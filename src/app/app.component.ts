// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { LandingPageNavbar } from './navbar/landing-page-navbar/landing-page-navbar';
import { BuyerNavbar } from './navbar/buyer-navbar/buyer-navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LandingPageNavbar, BuyerNavbar, RouterOutlet],
  templateUrl: './app.html',
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  // Initialize ONE as true, the other as false
  showLandingNavbar = true;
  showBuyerNavbar = false;

  private interval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateNavbars();
    this.startPolling();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateNavbars());
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  private updateNavbars(): void {
    const url = this.router.url;
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('role');

    const isPublic = ['/', '/login', '/register', '/verify-email'].some(p => url.startsWith(p));
    const isBuyer = !!token && role === 'buyer';
    const inBuyerArea = url.startsWith('/buyer-dashboard') || url.startsWith('/get-ticket');

    this.showBuyerNavbar = isBuyer && !isPublic && inBuyerArea;
    this.showLandingNavbar = !this.showBuyerNavbar; // ← Critical: mutually exclusive
  }

  private startPolling(): void {
    this.interval = setInterval(() => this.updateNavbars(), 1000);
  }
}