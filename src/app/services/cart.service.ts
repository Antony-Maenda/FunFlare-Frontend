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
  private items = new BehaviorSubject<CartItem[]>([]);
  items$ = this.items.asObservable();

  // NEW: Trigger purchase from GetTicketComponent → BuyerNavbar
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

  /**
   * Add or update item in cart
   */
  addItem(item: CartItem): void {
    const current = this.items.value;

    // Use eventId + ticketType as unique key (more reliable than eventName)
    const existingIndex = current.findIndex(
      i => i.eventId === item.eventId && i.ticketType === item.ticketType
    );

    let updated: CartItem[];

    if (existingIndex > -1) {
      if (item.quantity <= 0) {
        // Remove item
        updated = current.filter((_, idx) => idx !== existingIndex);
      } else {
        // Update quantity
        updated = current.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: item.quantity } : i
        );
      }
    } else if (item.quantity > 0) {
      // Add new
      updated = [...current, item];
    } else {
      updated = current;
    }

    this.items.next(updated);
  }

  /**
   * Remove specific item by eventId + ticketType
   */
  removeItem(eventId: number, ticketType: string): void {
    const updated = this.items.value.filter(
      i => !(i.eventId === eventId && i.ticketType === ticketType)
    );
    this.items.next(updated);
  }

  /**
   * Get current cart items (snapshot)
   */
  getItems(): CartItem[] {
    return [...this.items.value]; // Return copy
  }

  /**
   * Clear entire cart
   */
  clear(): void {
    this.items.next([]);
  }

  /**
   * Get total items count
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
   * Trigger purchase flow — called from GetTicketComponent
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