// organizer-dashboard.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass, CommonModule } from '@angular/common';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, RouterOutlet, CommonModule],
  templateUrl: './organizer-dashboard.html',
  styleUrls: ['./organizer-dashboard.css']
})
export class OrganizerDashboardComponent implements OnInit {
  // Sidebar
  isSidebarOpen = false;

  // Dropdown states
  profileOpen = false;

  // Logout confirmation modal
  showLogoutConfirm = false;

  // User data
  userName: string = 'Guest';
  avatarUrl: string | null = null;

  constructor(public router: Router) {}

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

  /** Toggles the sidebar for mobile view */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown(type: string) {
    // Close all dropdowns first
    this.profileOpen = false;

    // Open only the clicked dropdown
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

  // Show logout confirmation modal
  confirmLogout(): void {
    this.showLogoutConfirm = true;
    this.profileOpen = false; // Close dropdown when opening modal
  }

  // Actual logout (called only when user confirms)
  logout(): void {
    // Clear session
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatarUrl');

    this.userName = 'Guest';
    this.avatarUrl = null;
    this.showLogoutConfirm = false;

    console.log('Logged out');
    this.router.navigate(['/login']);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-btn') && !target.closest('.dropdown-menu')) {
      this.profileOpen = false;
    }
  }
}