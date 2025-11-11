// src/app/navbar/buyer-navbar/buyer-navbar.ts
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
import { CartService, CartItem } from '../../services/cart.service';
import { PurchaseComponent } from '../../purchase/purchase';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-buyer-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PurchaseComponent
  ],
  templateUrl: './buyer-navbar.html',
  styleUrls: ['./buyer-navbar.css']
})
export class BuyerNavbar implements OnInit, OnDestroy {
  walletOpen = false;
  pointsOpen = false;
  profileOpen = false;
  mobileMenuOpen = false;

  userName: string = 'Guest';
  avatarUrl: string | null = null;

  cartOpen = false;
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalItems = 0;

  showPurchaseModal = false;

  private subscription: any;
  private purchaseSubscription: any;

  constructor(
    private router: Router,
    private purchaseService: PurchaseService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadUserData();

    // Cart updates
    this.ngZone.run(() => {
      this.subscription = this.cartService.items$.subscribe(items => {
        this.cartItems = [...items];
        this.cartTotalItems = items.reduce((s, i) => s + i.quantity, 0);
        this.cartTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        this.cdr.detectChanges();
      });
    });

    // Listen for purchase trigger from anywhere (GetTicketComponent)
    this.purchaseSubscription = this.cartService.purchase$.subscribe(data => {
      this.onPurchaseSubmit(data);
      this.openPurchaseModal();
    });

    if (!localStorage.getItem('jwtToken')) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.purchaseSubscription?.unsubscribe();
  }

  private loadUserData(): void {
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatarUrl');
    if (username) this.userName = username;
    if (avatar) this.avatarUrl = avatar;
  }

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

  onAvatarUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.avatarUrl = result;
      localStorage.setItem('avatarUrl', result);
    };
    reader.readAsDataURL(file);
  }

  logout(): void {
    ['jwtToken', 'role', 'userId', 'username', 'avatarUrl'].forEach(key =>
      localStorage.removeItem(key)
    );
    this.userName = 'Guest';
    this.avatarUrl = null;
    this.mobileMenuOpen = false;
    this.cartOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isDropdownBtn = target.closest('.dropdown-btn');
    const isDropdownMenu = target.closest('[id$="-dropdown"]');
    const isMobileMenuBtn = target.closest('[aria-label="Open Menu"]');
    const isMobileMenu = target.closest('.mobile-menu');
    const isCartBtn = target.closest('button[aria-label="View cart"]');
    const isCartMenu = target.closest('.animate-fadeIn');

    if (!isDropdownBtn && !isDropdownMenu) {
      this.walletOpen = this.pointsOpen = this.profileOpen = false;
    }
    if (this.mobileMenuOpen && !isMobileMenuBtn && !isMobileMenu) {
      this.mobileMenuOpen = false;
    }
    if (this.cartOpen && !isCartBtn && !isCartMenu) {
      this.cartOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.mobileMenuOpen = false;
    }
  }

  openPurchaseModal(): void {
    this.showPurchaseModal = true;
    this.cartOpen = false;
  }

  closePurchaseModal(): void {
    this.showPurchaseModal = false;
  }

  // FIXED: Now uses FULL DTO from PurchaseComponent
  onPurchaseSubmit(data: {
    eventId: number;
    selectedTickets: Array<{ ticketType: string; quantity: number; price: number }>;
    paymentMethod: string;
    purchaseEmail: string;
    phoneNumber: string;
    guestName: string;
  }): void {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('Not logged in');
      this.router.navigate(['/login']);
      return;
    }

    let userId: number;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = parseInt(payload.userId, 10);
    } catch (e) {
      alert('Session expired');
      this.logout();
      return;
    }

    // Convert selectedTickets to CartItem array format
    const cartItems: CartItem[] = data.selectedTickets.map(ticket => ({
      eventId: data.eventId,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
      price: ticket.price
    })) as CartItem[];

    // Extract buyer information
    const buyer = {
      name: data.guestName,
      email: data.purchaseEmail,
      phone: data.phoneNumber
    };

    // Send with correct 3 arguments
    this.purchaseService.createPurchase(cartItems, buyer, userId).subscribe({
      next: () => {
        // SUCCESS — STK is sent
        alert(`Success! MPESA prompt sent to ${data.phoneNumber}`);
        this.cartService.clear();
        this.closePurchaseModal();
        this.router.navigate(['/purchases']);
      },
      error: (err) => {
        // ONLY show error on REAL failures
        console.error('Purchase HTTP Error:', err);
        if (err.status === 0) {
          alert('No internet connection');
        } else {
          const msg = err.error?.message || 'Server error. Try again.';
          alert('Purchase Failed: ' + msg);
        }
      }
    });
  }
}