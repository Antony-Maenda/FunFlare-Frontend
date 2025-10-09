import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, RouterOutlet, CommonModule],
  templateUrl: './organizer-dashboard.html',
  styleUrls: ['./organizer-dashboard.css']
})
export class OrganizerDashboardComponent implements AfterViewInit, OnDestroy {
  // ✅ Sidebar
  isSidebarOpen = false;

  // ✅ Dropdown control
  profileOpen = false;

  // ✅ User info
  userName: string = 'Organizer';
  avatarUrl: string | null = null;

  @ViewChild('profileTrigger') profileTrigger!: ElementRef;
  @ViewChild('profileDropdownElement') profileDropdownElement!: ElementRef;

  constructor(public router: Router) {}

  /** ✅ Toggles the sidebar for mobile view */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /** ✅ Handles dropdown toggle */
  toggleDropdown(type: string): void {
    if (type === 'profile') {
      this.profileOpen = !this.profileOpen;
    }
  }

  /** ✅ Handles avatar upload */
  onAvatarUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarUrl = reader.result as string;
        localStorage.setItem('avatarUrl', this.avatarUrl); // persist avatar between reloads
      };
      reader.readAsDataURL(file);
    }
  }

  /** ✅ Click outside handler to close dropdown */
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = this.profileDropdownElement?.nativeElement.contains(target);
    const clickedTrigger = this.profileTrigger?.nativeElement.contains(target);

    if (this.profileOpen && !clickedInsideDropdown && !clickedTrigger) {
      this.profileOpen = false;
    }
  }

  /** ✅ Add listener after view init */
  ngAfterViewInit(): void {
    document.addEventListener('click', this.onDocumentClick.bind(this));

    // Load persisted avatar (if available)
    const storedAvatar = localStorage.getItem('avatarUrl');
    if (storedAvatar) {
      this.avatarUrl = storedAvatar;
    }
  }

  /** ✅ Clean up */
  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  /** ✅ Logout logic */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('avatarUrl');
    this.router.navigate(['/login']).then(() => {
      console.log('Logged out and redirected to login');
    });
  }
}
