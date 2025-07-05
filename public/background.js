const DEFAULT_CATEGORY = "Other";

let currentDomain = null;
let startTime = Date.now();

function getDomainFromUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    if (hostname === "localhost") {
      return parsed.host;
    }

    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch (e) {
    return null;
  }
}

async function saveTimeSpent(domain, durationMs) {
  if (!domain || durationMs < 1000) return;

  const seconds = Math.floor(durationMs / 1000);
  const today = new Date().toISOString().split("T")[0];
  const key = `fokys_${today}`;

  const data = await chrome.storage.local.get([key]);
  const existing = data[key] || { summary: {}, details: [] };

  const category = getCategoryForDomain(domain);

  existing.summary[category] = (existing.summary[category] || 0) + seconds;

  const existingEntry = existing.details.find(d => d.domain === domain);
  if (existingEntry) {
    existingEntry.time += seconds;
  } else {
    existing.details.push({ domain, time: seconds, category });
  }

  await chrome.storage.local.set({ [key]: existing });
  console.log(`Saved ${seconds}s for ${domain} (${category})`);
}

async function flushCurrentSession() {
  const now = Date.now();
  const duration = now - startTime;
  await saveTimeSpent(currentDomain, duration);
  startTime = now;
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await flushCurrentSession();

  const tab = await chrome.tabs.get(activeInfo.tabId);
  const domain = getDomainFromUrl(tab.url);
  currentDomain = domain;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    flushCurrentSession().then(() => {
      currentDomain = getDomainFromUrl(changeInfo.url);
    });
  }
});

chrome.runtime.onSuspend.addListener(async () => {
  await flushCurrentSession();
});

function getCategoryForDomain(domain) {
  const mapping = {
    "github.com": "Work",
    "localhost:4200": "Work",
    "open.spotify.com": "Entertainment",
    "youtube.com": "Entertainment"
  };
  return mapping[domain] || DEFAULT_CATEGORY;
}

function isFirstDayOfWeek() {
  const today = new Date();
  return today.getDay() === 1; //Monday
}

function isFirstDayOfMonth() {
  return new Date().getDate() === 1;
}


function getWeekOfMonth(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = first.getDay() === 0 ? 7 : first.getDay(); // Sunday = 7
  const offset = firstDay - 1;
  const adjustedDate = date.getDate() + offset;
  return Math.ceil(adjustedDate / 7);
}

function getNextMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime();
}

function getLast7Dates() {
  const dates = [];
  const base = new Date();

  for (let i = 1; i <= 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
}

async function summarizeLastWeek() {
  const all = await chrome.storage.local.get(null);
  const today = new Date();
  const last7Dates = getLast7Dates();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const weekNumber = getWeekOfMonth(yesterday);
  const weekKey = `fokys_week_${year}-${month}-W${weekNumber}`;

  const weeklySummary = {};

  for (const date of last7Dates) {
    const key = `fokys_${date}`;
    if (!all[key] || !all[key].summary) continue;

    for (const category in all[key].summary) {
      weeklySummary[category] = (weeklySummary[category] || 0) + all[key].summary[category];
    }

    await chrome.storage.local.remove(key);
  }

  if (Object.keys(weeklySummary).length) {
    await chrome.storage.local.set({ [weekKey]: { summary: weeklySummary } });
  }
}

async function summarizePreviousMonth() {
  const all = await chrome.storage.local.get(null);
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const year = lastMonth.getFullYear();
  const month = String(lastMonth.getMonth() + 1).padStart(2, "0");
  const prefix = `fokys_week_${year}-${month}-W`;

  const monthlySummary = {};

  for (const key in all) {
    if (!key.startsWith(prefix)) continue;
    const summary = all[key].summary;
    for (const category in summary) {
      monthlySummary[category] = (monthlySummary[category] || 0) + summary[category];
    }

    await chrome.storage.local.remove(key);
  }

  const monthKey = `fokys_month_${year}-${month}`;
  if (Object.keys(monthlySummary).length) {
    await chrome.storage.local.set({ [monthKey]: { summary: monthlySummary } });
  }
}


chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "daily-reset") {
    await flushCurrentSession();

    if (isFirstDayOfWeek()) {
      await summarizeLastWeek();
    }

    if (isFirstDayOfMonth()) {
      await summarizePreviousMonth();
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("daily-reset", {
    when: getNextMidnight(),
    periodInMinutes: 1440
  });
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {

  const url = new URL(details.url);
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') return;

  chrome.storage.local.get('blockedDomains', (result) => {
    const blocked = result.blockedDomains || [];
    const url = new URL(details.url);
    const hostname = url.hostname;
    console.log("Hostname", hostname)

    if (blocked.includes(hostname)) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html")
      });
    }
  });
}, { url: [{ schemes: ['https', 'http'] }] });
