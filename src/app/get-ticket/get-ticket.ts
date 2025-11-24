// src/app/components/get-ticket/get-ticket.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GetTicketService, EventWithTickets } from '../services/get-ticket.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PurchaseComponent } from '../purchase/purchase';
import { CartService } from '../services/cart.service';
import { SharedNavbarComponent } from '../shared-navbar/shared-navbar';

@Component({
  selector: 'app-get-ticket',
  standalone: true,
  imports: [
    CommonModule,
    PurchaseComponent,
    RouterModule,
    SharedNavbarComponent
  ],
  templateUrl: './get-ticket.html',
  styleUrls: ['./get-ticket.css'],
  providers: [GetTicketService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetTicketComponent implements OnInit {
  eventWithTickets: EventWithTickets | null = null;
  loading = true;
  error: string | null = null;

  selectedQuantities: number[] = [];
  subtotal = 0;

  showPurchaseForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getTicketService: GetTicketService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(eventId)) {
      this.error = 'Invalid event ID.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.getTicketService.getEventWithTickets(eventId).subscribe({
      next: (data) => {
        this.eventWithTickets = data;
        this.selectedQuantities = new Array(data.tickets.length).fill(0);
        this.updateSubtotal();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.message ?? 'Failed to load event.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Enhanced: Increment with cart update
  incrementQuantity(index: number): void {
    const ticket = this.eventWithTickets!.tickets[index];
    const current = this.selectedQuantities[index] ?? 0;
    if (current >= ticket.quantity) return;

    this.selectedQuantities[index]++;
    this.updateSubtotal();
    this.saveCartItem(index);
    this.cdr.markForCheck();
  }

  // Enhanced: Decrement with cart update
  decrementQuantity(index: number): void {
    const current = this.selectedQuantities[index] ?? 0;
    if (current <= 0) return;

    this.selectedQuantities[index]--;
    this.updateSubtotal();
    this.saveCartItem(index);
    this.cdr.markForCheck();
  }

  // NEW: Handle direct input in number field
  onQuantityInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    let value = parseInt(rawValue, 10);

    // Handle empty or invalid
    if (isNaN(value) || rawValue === '' || value < 0) {
      value = 0;
    }

    const max = this.eventWithTickets!.tickets[index].quantity;
    if (value > max) {
      value = max;
    }

    this.selectedQuantities[index] = value;
    input.value = value.toString(); // Sync UI

    this.updateSubtotal();
    this.saveCartItem(index);
    this.cdr.markForCheck();
  }

  // NEW: Validate on blur (user leaves input)
  validateQuantityInput(index: number): void {
    const max = this.eventWithTickets!.tickets[index].quantity;
    let value = this.selectedQuantities[index] ?? 0;

    if (value > max) {
      value = max;
    } else if (value < 0) {
      value = 0;
    }

    this.selectedQuantities[index] = value;
    this.updateSubtotal();
    this.saveCartItem(index);
    this.cdr.markForCheck();
  }

  private updateSubtotal(): void {
    if (!this.eventWithTickets) {
      this.subtotal = 0;
      return;
    }

    this.subtotal = this.eventWithTickets.tickets.reduce((sum, ticket, i) => {
      const qty = this.selectedQuantities[i] ?? 0;
      return sum + ticket.price * qty;
    }, 0);
  }

  private saveCartItem(index: number): void {
    if (!this.eventWithTickets) return;
    const ticket = this.eventWithTickets.tickets[index];
    const qty = this.selectedQuantities[index] ?? 0;

    if (qty <= 0) {
      this.cartService.removeItem(this.eventWithTickets.id, ticket.type);
      return;
    }

    this.cartService.addItem({
      eventId: this.eventWithTickets.id,
      eventName: this.eventWithTickets.name,
      ticketType: ticket.type,
      quantity: qty,
      price: ticket.price
    });
  }

  openPurchaseForm(): void {
    this.showPurchaseForm = true;
    this.cdr.markForCheck();
  }

  closePurchaseForm(): void {
    this.showPurchaseForm = false;
    this.cdr.markForCheck();
  }

  onPurchaseSubmit(data: {
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
    console.log('Purchase DTO ready:', data);
    this.cartService.triggerPurchase(data);
    this.closePurchaseForm();
    alert(`Processing payment...\nMPESA prompt sent to ${data.phoneNumber}`);
  }

  onImageError(event: Event, eventName: string): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="flex items-center justify-center h-72 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-xl rounded-2xl">
          ${eventName}
        </div>`;
    }
  }
}