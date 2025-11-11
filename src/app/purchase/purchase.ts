// src/app/components/purchase/purchase.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../services/cart.service';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase.html',
  styleUrls: ['./purchase.css']
})
export class PurchaseComponent {
  @Input() subtotal = 0;
  @Input() cartItems: CartItem[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{
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

  buyerName = '';
  buyerEmail = '';
  buyerPhone = '';

  formatPhoneNumber(): void {
    let digits = this.buyerPhone.replace(/\D/g, '')
      .replace(/^0/, '')
      .replace(/^254/, '')
      .substring(0, 9);

    if (digits && !/^7[0-9]{8}$|^1[0-9]{8}$/.test(digits)) {
      digits = digits[0] === '7' || digits[0] === '1' ? digits.replace(/[^0-9].*/, '') : '';
    }

    this.buyerPhone = digits;
  }

  onSubmit(form: any): void {
    if (
      !form.valid ||
      this.buyerName.trim().length < 2 ||
      !this.buyerEmail.includes('@') ||
      this.buyerPhone.length !== 9 ||
      !/^[71]/.test(this.buyerPhone)
    ) {
      const errors = [];
      if (!this.buyerName.trim()) errors.push('Name is required');
      if (!this.buyerEmail.includes('@')) errors.push('Valid email required');
      if (this.buyerPhone.length !== 9) errors.push('Enter 9-digit Kenyan number');
      if (!/^[71]/.test(this.buyerPhone)) errors.push('Must start with 7 or 1');
      alert('Fix these errors:\n• ' + errors.join('\n• '));
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const eventId = this.cartItems[0].eventId;
    if (!eventId) {
      alert('Event error. Try again.');
      return;
    }

    this.submit.emit({
      eventId,
      selectedTickets: this.cartItems.map(i => ({
        ticketType: i.ticketType,
        quantity: i.quantity,
        price: i.price
      })),
      paymentMethod: 'MPESA',
      purchaseEmail: this.buyerEmail.trim().toLowerCase(),
      phoneNumber: '254' + this.buyerPhone,
      guestName: this.buyerName.trim()
    });
  }

  onClose(): void {
    this.close.emit();
  }
}