import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout } from '../../components/layout/layout';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buyer-dashboard',
  imports: [CommonModule, Layout, FormsModule],
  templateUrl: './buyer-dashboard.html',
  styleUrls: ['./buyer-dashboard.css']
})
export class BuyerDashboard {
  // Dropdown states
  walletOpen = false;
  pointsOpen = false;
  profileOpen = false;

  toggleDropdown(type: string) {
    this.walletOpen = type === 'wallet' ? !this.walletOpen : false;
    this.pointsOpen = type === 'points' ? !this.pointsOpen : false;
    this.profileOpen = type === 'profile' ? !this.profileOpen : false;
  }

  logout() {
    console.log('Logged out');
    // TODO: Implement actual logout logic (clear tokens, redirect, etc.)
  }
}

