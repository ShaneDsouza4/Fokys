import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule, SunIcon, MoonIcon } from 'lucide-angular';
import { Analytics } from '../analytics/analytics';
import { Fokys } from '../fokys/fokys';
import { Settings } from '../settings/settings';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    LucideAngularModule,
    Analytics,
    Fokys,
    Settings
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})


export class Navbar {
  activeTab: 'analytics' | 'fokys' | 'settings' = 'analytics';

  readonly SunIcon = SunIcon
  readonly MoonIcon = MoonIcon

  isDark = false;

  toggleDarkMode() {
    this.isDark = !this.isDark;

    const root = document.documentElement.classList;
    if (this.isDark) {
      root.add('dark');
    } else {
      root.remove('dark');
    }
  }


  switchTab(tab: 'analytics' | 'fokys' | 'settings') {
    this.activeTab = tab;
  }

}
