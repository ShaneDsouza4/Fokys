import { Component, NgZone, OnInit } from '@angular/core';

interface UsageEntry {
  category: string;
  domain: string;
  time: number;
}

@Component({
  selector: 'app-analytics',
  imports: [],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})




export class Analytics implements OnInit {

  constructor(private ngZone: NgZone) { }

  usageByCategory: { [category: string]: number } = {};
  sortedUsageCategories: { category: string, time: number }[] = [];
  topDomains: { domain: string; time: number }[] = [];

  data: any = {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    const key = `fokys_${today}`;

    chrome.storage.local.get([key], (result) => {
      this.ngZone.run(() => {
        this.data = result[key];

        if (this.data) {
          //this.usageByCategory = this.data.summary.sort((a, b) => b.time - a.time) || {};
          if (this.data?.summary) {
            this.sortedUsageCategories = (Object.entries(this.data.summary) as [string, number][])
              .map(([category, time]) => ({ category, time }))
              .sort((a, b) => b.time - a.time);
          }

          this.getTopDomains(this.data.details || []);
        }
      });
    });
  }

  getTopDomains(data: UsageEntry[]) {
    const domainMap: { [domain: string]: number } = {};
    for (const entry of data) {
      domainMap[entry.domain] = (domainMap[entry.domain] || 0) + entry.time;
    }

    this.topDomains = Object.entries(domainMap)
      .map(([domain, time]) => ({ domain, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0s';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h ? `${h}h` : '', m ? `${m}m` : '', s ? `${s}s` : '']
      .filter(Boolean)
      .join(' ');
  }

  openDashboard() {
    console.log("Open")
    //chrome.tabs.create({ url: 'dashboard.html' }); // Or your defined route
  }

}
