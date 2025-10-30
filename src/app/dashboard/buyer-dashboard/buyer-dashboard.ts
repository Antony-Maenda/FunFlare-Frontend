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
  mobileMenuOpen = false; // New: Mobile menu state

  // User data
  userName: string = 'Guest';
  avatarUrl: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();

    // Redirect if not authenticated
    if (!localStorage.getItem('jwtToken')) {
      this.router.navigate(['/login']);
    }
  }

  /** Load user data from localStorage */
  private loadUserData(): void {
    const storedUsername = localStorage.getItem('username');
    const storedAvatar = localStorage.getItem('avatarUrl');

    if (storedUsername) {
      this.userName = storedUsername;
    }
    if (storedAvatar) {
      this.avatarUrl = storedAvatar;
    }
  }

  /** Toggle dropdowns (desktop) */
  toggleDropdown(type: 'wallet' | 'points' | 'profile'): void {
    // Close all
    this.walletOpen = false;
    this.pointsOpen = false;
    this.profileOpen = false;

    // Open selected
    if (type === 'wallet') this.walletOpen = true;
    if (type === 'points') this.pointsOpen = true;
    if (type === 'profile') this.profileOpen = true;
  }

  /** Toggle mobile menu */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  /** Handle avatar upload */
  onAvatarUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      this.avatarUrl = result;
      localStorage.setItem('avatarUrl', result);
    };

    reader.readAsDataURL(file);
  }

  /** Logout user */
  logout(): void {
    // Clear all auth-related data
    const keysToRemove = ['jwtToken', 'role', 'userId', 'username', 'avatarUrl'];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Reset state
    this.userName = 'Guest';
    this.avatarUrl = null;
    this.mobileMenuOpen = false;

    console.log('User logged out successfully');
    this.router.navigate(['/login']);
  }

  /** Close all dropdowns & mobile menu when clicking outside */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isDropdownBtn = target.closest('.dropdown-btn');
    const isDropdownMenu = target.closest('.dropdown-menu');
    const isMobileMenuBtn = target.closest('[aria-label="Open Menu"]');
    const isMobileMenu = target.closest('.mobile-menu'); // optional class

    // Close dropdowns if click is outside
    if (!isDropdownBtn && !isDropdownMenu) {
      this.walletOpen = false;
      this.pointsOpen = false;
      this.profileOpen = false;
    }

    // Close mobile menu if open and click is outside
    if (this.mobileMenuOpen && !isMobileMenuBtn && !isMobileMenu) {
      this.mobileMenuOpen = false;
    }
  }

  /** Optional: Close mobile menu on route change */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.mobileMenuOpen = false; // Auto-close on large screens
    }
  }
}