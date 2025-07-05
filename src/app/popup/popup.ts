import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup implements OnInit {

  today = new Date().toISOString().split("T")[0];
  summary: Record<string, number> = {};
  details: { domain: string, time: number, category: string }[] = [];

  ngOnInit() {
    const key = `fokys_${this.today}`;

    chrome.storage.local.get([key], (result) => {
      const data = result[key] || { summary: {}, details: [] };
      this.summary = data.summary;
      this.details = data.details;
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m`;
  }

}
