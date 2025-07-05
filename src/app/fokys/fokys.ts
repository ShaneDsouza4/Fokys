import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fokys',
  imports: [CommonModule, FormsModule],
  templateUrl: './fokys.html',
  styleUrl: './fokys.css'
})
export class Fokys implements OnInit {

  constructor(private ngZone: NgZone) { }

  domainToBlock = '';
  blockedDomains: string[] = [];

  ngOnInit(): void {
    chrome.storage.local.get(['blockedDomains'], (result) => {
      this.ngZone.run(() => {
        this.blockedDomains = result['blockedDomains'] || [];
      });
    });
  }

  blockDomain() {
    const trimmed = this.domainToBlock.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (trimmed && !this.blockedDomains.includes(trimmed)) {
      this.blockedDomains.push(trimmed);
      chrome.storage.local.set({ blockedDomains: this.blockedDomains });
      this.domainToBlock = '';
    }
  }

  unblockDomain(domain: string) {
    this.blockedDomains = this.blockedDomains.filter(d => d !== domain);
    chrome.storage.local.set({ blockedDomains: this.blockedDomains });
  }


}
