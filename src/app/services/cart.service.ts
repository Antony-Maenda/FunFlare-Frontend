// src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CartItem {
  eventId: number;
  eventName: string;
  ticketType: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'funflare_cart';

  private items = new BehaviorSubject<CartItem[]>([]);
  items$ = this.items.asObservable();

  // Trigger purchase flow (from ticket page → navbar)
  private purchaseTrigger = new Subject<{
    eventId: number;
    selectedTickets: Array<{
      ticketType: string;
      quantity: number;
      price: number;
    }>;
    paymentMethod: string;
    purchaseEmail: string;
    phoneNumber: string;
    guestName: string;
  }>();
  purchase$ = this.purchaseTrigger.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  /** Load cart from localStorage on app start */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.items.next(parsed);
      }
    } catch (e) {
      console.warn('Failed to load cart from storage', e);
      this.items.next([]);
    }
  }

  /** Save current cart to localStorage */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items.value));
    } catch (e) {
      console.warn('Failed to save cart to storage', e);
    }
  }

  /**
   * Add item or update existing one
   */
  addItem(newItem: CartItem): void {
    const current = this.items.value;

    const existingIndex = current.findIndex(
      i => i.eventId === newItem.eventId && i.ticketType === newItem.ticketType
    );

    let updated: CartItem[];

    if (existingIndex > -1) {
      // Update existing item
      updated = current.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );
    } else {
      // Add new item
      updated = [...current, newItem];
    }

    this.items.next(updated);
    this.saveToStorage();
  }

  /**
   * Update quantity directly (used by navbar +/− buttons)
   */
  updateQuantity(eventId: number, ticketType: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(eventId, ticketType);
      return;
    }

    const updated = this.items.value.map(item =>
      item.eventId === eventId && item.ticketType === ticketType
        ? { ...item, quantity: newQuantity }
        : item
    );

    this.items.next(updated);
    this.saveToStorage();
  }

  /**
   * Remove specific item from cart
   */
  removeItem(eventId: number, ticketType: string): void {
    const updated = this.items.value.filter(
      i => !(i.eventId === eventId && i.ticketType === ticketType)
    );

    this.items.next(updated);
    this.saveToStorage();
  }

  /**
   * Get current cart items (snapshot)
   */
  getItems(): CartItem[] {
    return [...this.items.value];
  }

  /**
   * Clear entire cart
   */
  clear(): void {
    this.items.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get total number of tickets
   */
  getTotalItems(): number {
    return this.items.value.reduce((sum, i) => sum + i.quantity, 0);
  }

  /**
   * Get total price
   */
  getTotalPrice(): number {
    return this.items.value.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  /**
   * Trigger purchase flow (called from ticket page)
   */
  triggerPurchase(data: {
    eventId: number;
    selectedTickets: Array<{
      ticketType: string;
      quantity: number;
      price: number;
    }>;
    paymentMethod: string;
    purchaseEmail: string;
    phoneNumber: string;
    guestName: string;
  }): void {
    this.purchaseTrigger.next(data);
  }
}