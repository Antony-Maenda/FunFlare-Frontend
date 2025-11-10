// src/app/dashboard/buyer-dashboard/buyer-navbar.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

interface CartItem {
  eventName: string;
  ticketType: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-buyer-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buyer-navbar.html',
  styleUrls: ['./buyer-navbar.css']
})
export class BuyerNavbar implements OnInit {
  // Dropdown states
  walletOpen = false;
  pointsOpen = false;
  profileOpen = false;
  mobileMenuOpen = false;

  // User data
  userName: string = 'Guest';
  avatarUrl: string | null = null;

  // Cart state
  cartOpen = false;
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalItems = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.updateCartFromStorage(); // Load cart on init

    // Redirect if not authenticated
    if (!localStorage.getItem('jwtToken')) {
      this.router.navigate(['/login']);
    }
  }

  /** Load user data from localStorage */
  private loadUserData(): void {
    const storedUsername = localStorage.getItem('username');
    const storedAvatar = localStorage.getItem('avatarUrl');

    if (storedUsername) this.userName = storedUsername;
    if (storedAvatar) this.avatarUrl = storedAvatar;
  }

  /** Toggle dropdowns (desktop) */
  toggleDropdown(type: 'wallet' | 'points' | 'profile'): void {
    this.walletOpen = this.pointsOpen = this.profileOpen = false;
    if (type === 'wallet') this.walletOpen = true;
    if (type === 'points') this.pointsOpen = true;
    if (type === 'profile') this.profileOpen = true;
  }

  /** Toggle mobile menu */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  /** Toggle cart dropdown */
  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
    if (this.cartOpen) this.updateCartFromStorage();
  }

  /** Update cart from localStorage */
  updateCartFromStorage(): void {
    const raw = localStorage.getItem('eventCart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    this.cartItems = cart;
    this.cartTotalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    this.cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }

  /** Public method: Save ticket to cart (called from get-ticket.component.ts) */
  saveToCart(eventName: string, ticketType: string, quantity: number, price: number): void {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('eventCart') || '[]');
    const existing = cart.find(c => c.eventName === eventName && c.ticketType === ticketType);

    if (existing) {
      existing.quantity = quantity;
      if (quantity === 0) {
        cart = cart.filter(c => c !== existing);
      }
    } else if (quantity > 0) {
      cart.push({ eventName, ticketType, quantity, price });
    }

    localStorage.setItem('eventCart', JSON.stringify(cart));
    this.updateCartFromStorage();
  }

  /** Handle avatar upload */
  onAvatarUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

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
    const keysToRemove = ['jwtToken', 'role', 'userId', 'username', 'avatarUrl'];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    this.userName = 'Guest';
    this.avatarUrl = null;
    this.mobileMenuOpen = false;
    this.cartOpen = false;

    this.router.navigate(['/login']);
  }

  /** Close dropdowns & mobile menu on outside click */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const isDropdownBtn = target.closest('.dropdown-btn');
    const isDropdownMenu = target.closest('[id$="-dropdown"]');
    const isMobileMenuBtn = target.closest('[aria-label="Open Menu"]');
    const isMobileMenu = target.closest('.mobile-menu');
    const isCartBtn = target.closest('button[aria-label="View cart"]');
    const isCartMenu = target.closest('.animate-fadeIn');

    // Close dropdowns
    if (!isDropdownBtn && !isDropdownMenu) {
      this.walletOpen = this.pointsOpen = this.profileOpen = false;
    }

    // Close mobile menu
    if (this.mobileMenuOpen && !isMobileMenuBtn && !isMobileMenu) {
      this.mobileMenuOpen = false;
    }

    // Close cart
    if (this.cartOpen && !isCartBtn && !isCartMenu) {
      this.cartOpen = false;
    }
  }

  /** Auto-close mobile menu on resize */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.mobileMenuOpen = false;
    }
  }
}