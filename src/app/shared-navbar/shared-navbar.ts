// src/app/navbar/shared-navbar/shared-navbar.component.ts
import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { PurchaseComponent } from '../purchase/purchase';
import { PurchaseService } from '../services/purchase.service';

@Component({
  selector: 'app-shared-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PurchaseComponent],
  templateUrl: './shared-navbar.html',
  styleUrls: ['./shared-navbar.css']
})
export class SharedNavbarComponent implements OnInit, OnDestroy {
  // UI flags
  walletOpen = false;
  pointsOpen = false;
  profileOpen = false;
  mobileMenuOpen = false;
  cartOpen = false;
  showPurchaseModal = false;
  showLogoutConfirm = false;

  // User
  isLoggedIn = false;
  userName = 'Guest';
  avatarUrl: string | null = null;

  // Cart
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalItems = 0;

  private cartSub: any;
  private purchaseSub: any;

  constructor(
    private router: Router,
    private cartService: CartService,
    private purchaseService: PurchaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.checkLoginState();
    this.subscribeCart();
    this.subscribePurchaseTrigger();
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.purchaseSub?.unsubscribe();
  }

  /* -------------------------------------------------- AUTH -------------------------------------------------- */
  private checkLoginState(): void {
    const token = localStorage.getItem('jwtToken');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      this.userName = localStorage.getItem('username') || 'User';
      this.avatarUrl = localStorage.getItem('avatarUrl') || null;
    }
  }

  confirmLogout(): void {
    this.showLogoutConfirm = true;
  }

  logout(): void {
    ['jwtToken', 'role', 'userId', 'username', 'avatarUrl'].forEach(k =>
      localStorage.removeItem(k)
    );

    this.isLoggedIn = false;
    this.userName = 'Guest';
    this.avatarUrl = null;
    this.mobileMenuOpen = false;
    this.cartOpen = false;
    this.walletOpen = false;
    this.pointsOpen = false;
    this.profileOpen = false;
    this.showLogoutConfirm = false;

    this.checkLoginState();
    this.router.navigate(['/']).then(() => setTimeout(() => this.cdr.detectChanges(), 0));
  }

  /* -------------------------------------------------- CART EDITING -------------------------------------------------- */
  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.eventId, item.ticketType, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.eventId, item.ticketType, item.quantity - 1);
    }
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeItem(item.eventId, item.ticketType);
  }

  /* -------------------------------------------------- UI -------------------------------------------------- */
  toggleDropdown(type: 'wallet' | 'points' | 'profile'): void {
    this.walletOpen = this.pointsOpen = this.profileOpen = false;
    if (type === 'wallet') this.walletOpen = true;
    if (type === 'points') this.pointsOpen = true;
    if (type === 'profile') this.profileOpen = true;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  openPurchaseModal(): void {
    this.showPurchaseModal = true;
    this.cartOpen = false;
  }

  closePurchaseModal(): void {
    this.showPurchaseModal = false;
  }

  onAvatarUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      this.avatarUrl = url;
      localStorage.setItem('avatarUrl', url);
    };
    reader.readAsDataURL(file);
  }

  /* -------------------------------------------------- CART SUBSCRIPTION -------------------------------------------------- */
  private subscribeCart(): void {
    this.ngZone.run(() => {
      this.cartSub = this.cartService.items$.subscribe(items => {
        this.cartItems = [...items];
        this.cartTotalItems = items.reduce((s, i) => s + i.quantity, 0);
        this.cartTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        this.cdr.detectChanges();
      });
    });
  }

  private subscribePurchaseTrigger(): void {
    this.purchaseSub = this.cartService.purchase$.subscribe(() => {
      this.openPurchaseModal();
    });
  }

  /* -------------------------------------------------- PURCHASE -------------------------------------------------- */
  onPurchaseSubmit(data: any): void {
    // ... your existing purchase logic (unchanged) ...
  }

  /* -------------------------------------------------- GLOBAL CLICK / RESIZE -------------------------------------------------- */
  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    if (!el.closest('.dropdown-btn') && !el.closest('[class*="absolute"]')) {
      this.walletOpen = this.pointsOpen = this.profileOpen = false;
    }
    if (this.cartOpen && !el.closest('button[aria-label="View cart"]') && !el.closest('.w-96')) {
      this.cartOpen = false;
    }
    if (this.mobileMenuOpen && !el.closest('[aria-label="Open Menu"]') && !el.closest('.mobile-menu')) {
      this.mobileMenuOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) this.mobileMenuOpen = false;
  }
}