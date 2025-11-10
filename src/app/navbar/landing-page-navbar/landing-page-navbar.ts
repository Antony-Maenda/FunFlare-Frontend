// src/app/landing-page/landing-page-navbar.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Event {
  title: string;
  date: string;
  venue: string;
  price: string;
  image: string;
}

interface CartItem {
  eventName: string;
  ticketType: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-landing-page-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './landing-page-navbar.html',
  styleUrl: './landing-page-navbar.css'
})
export class LandingPageNavbar implements OnInit {
  // Search
  searchQuery = '';
  filteredEvents: Event[] = [];
  events: Event[] = [];

  // Cart
  cartOpen = false;
  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartTotalItems = 0;

  constructor() {
    this.filteredEvents = [...this.events];
  }

  ngOnInit(): void {
    this.updateCartFromStorage();
  }

  // --- SEARCH LOGIC (unchanged) ---
  searchEvents(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredEvents = [...this.events];
      return;
    }
    this.filteredEvents = this.events.filter(e =>
      e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
    );
  }

  // --- CART LOGIC ---
  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
    if (this.cartOpen) this.updateCartFromStorage();
  }

  updateCartFromStorage(): void {
    const raw = localStorage.getItem('eventCart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    this.cartItems = cart;
    this.cartTotalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    this.cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }

  // Called from get-ticket.component.ts
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

  // Optional: clear cart
  clearCart(): void {
    localStorage.removeItem('eventCart');
    this.updateCartFromStorage();
    this.cartOpen = false;
  }
}