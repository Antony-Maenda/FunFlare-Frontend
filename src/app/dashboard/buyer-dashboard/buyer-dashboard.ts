//buyer-dashboard.ts


import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout } from '../../components/layout/layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buyer-dashboard',
  imports: [CommonModule, Layout, FormsModule],
  templateUrl: './buyer-dashboard.html',
  styleUrls: ['./buyer-dashboard.css']
})
export class BuyerDashboard implements OnInit {
  // Dropdown states
  walletOpen = false;
  pointsOpen = false;
  profileOpen = false;
  userName: string = 'Guest';

  constructor(private router: Router) {}

  ngOnInit() {
    // Fetch username from storage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.userName = storedUsername;
    }

    // Optional: Redirect if no token
    if (!localStorage.getItem('jwtToken')) {
      this.router.navigate(['/login']);
    }
  }

  toggleDropdown(type: string) {
    // Close all first
    this.walletOpen = false;
    this.pointsOpen = false;
    this.profileOpen = false;

    // Open only the clicked one
    if (type === 'wallet') this.walletOpen = true;
    if (type === 'points') this.pointsOpen = true;
    if (type === 'profile') this.profileOpen = true;
  }

  logout() {
    // Clear session
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    this.userName = 'Guest';
    console.log('Logged out');

    this.router.navigate(['/login']);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-btn') && !target.closest('.dropdown-menu')) {
      this.walletOpen = false;
      this.pointsOpen = false;
      this.profileOpen = false;
    }
  }
}