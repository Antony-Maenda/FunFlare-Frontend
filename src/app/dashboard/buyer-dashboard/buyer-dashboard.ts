import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout } from '../../components/layout/layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
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
  avatarUrl: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Fetch username and avatar from storage
    const storedUsername = localStorage.getItem('username');
    const storedAvatar = localStorage.getItem('avatarUrl');
    if (storedUsername) {
      this.userName = storedUsername;
    }
    if (storedAvatar) {
      this.avatarUrl = storedAvatar;
    }

    // Redirect if no token
    if (!localStorage.getItem('jwtToken')) {
      this.router.navigate(['/login']);
    }
  }

  toggleDropdown(type: string) {
    // Close all dropdowns first
    this.walletOpen = false;
    this.pointsOpen = false;
    this.profileOpen = false;

    // Open only the clicked dropdown
    if (type === 'wallet') this.walletOpen = true;
    if (type === 'points') this.pointsOpen = true;
    if (type === 'profile') this.profileOpen = true;
  }

  onAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarUrl = reader.result as string;
        localStorage.setItem('avatarUrl', this.avatarUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  logout() {
    // Clear session
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');

    this.userName = 'Guest';
    this.avatarUrl = null;
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