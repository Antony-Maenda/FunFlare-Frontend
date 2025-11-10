// src/app/components/get-ticket/get-ticket.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GetTicketService, EventWithTickets } from '../services/get-ticket.service';
import { HttpErrorResponse } from '@angular/common/http';

// Import the Purchase component (modal form)
import { PurchaseComponent } from '../purchase/purchase';

@Component({
  selector: 'app-get-ticket',
  standalone: true,
  imports: [CommonModule, PurchaseComponent], // PurchaseComponent added
  templateUrl: './get-ticket.html',
  styleUrls: ['./get-ticket.css'],
  providers: [GetTicketService]
})
export class GetTicketComponent implements OnInit {
  eventWithTickets: EventWithTickets | null = null;
  loading = true;
  error: string | null = null;

  // Ticket selection
  selectedQuantities: number[] = [];
  subtotal = 0;

  // Purchase form state
  showPurchaseForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getTicketService: GetTicketService
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Fetching event ID:', eventId);

    if (isNaN(eventId)) {
      this.error = 'Invalid event ID.';
      this.loading = false;
      return;
    }

    this.getTicketService.getEventWithTickets(eventId).subscribe({
      next: (data) => {
        console.log('Event loaded:', data);
        this.eventWithTickets = data;
        this.selectedQuantities = new Array(data.tickets.length).fill(0);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load event:', err);
        this.error = err.message || 'Failed to load event details.';
        this.loading = false;
      }
    });
  }

  // Image fallback
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

  // Quantity controls
  incrementQuantity(index: number): void {
    const ticket = this.eventWithTickets!.tickets[index];
    if (this.selectedQuantities[index] < ticket.quantity) {
      this.selectedQuantities[index]++;
      this.updateSubtotal();
      this.saveCartItem(index);
    }
  }

  decrementQuantity(index: number): void {
    if (this.selectedQuantities[index] > 0) {
      this.selectedQuantities[index]--;
      this.updateSubtotal();
      this.saveCartItem(index);
    }
  }

  updateSubtotal(): void {
    this.subtotal = this.eventWithTickets!.tickets.reduce((sum, ticket, i) => {
      return sum + ticket.price * (this.selectedQuantities[i] || 0);
    }, 0);
  }

  // Save selected ticket to cart via navbar
  saveCartItem(index: number): void {
    if (!this.eventWithTickets || !this.eventWithTickets.tickets?.[index]) return;

    const ticket = this.eventWithTickets.tickets[index];
    const qty = this.selectedQuantities[index] || 0;
    if (qty <= 0) return;

    const selectors = ['app-landing-page-navbar', 'app-buyer-navbar'];
    for (const sel of selectors) {
      const navbar = document.querySelector(sel) as any;
      if (navbar?.saveToCart && typeof navbar.saveToCart === 'function') {
        navbar.saveToCart(this.eventWithTickets.name, ticket.type, qty, ticket.price);
        return;
      }
    }
  }

  // ——— PURCHASE FORM METHODS ———
  openPurchaseForm(): void {
    this.showPurchaseForm = true;
  }

  closePurchaseForm(): void {
    this.showPurchaseForm = false;
  }

  onPurchaseSubmit(buyer: { name: string; email: string; phone: string }): void {
    const order = {
      eventId: this.eventWithTickets!.id,
      eventName: this.eventWithTickets!.name,
      tickets: this.eventWithTickets!.tickets
        .map((t, i) => ({
          type: t.type,
          quantity: this.selectedQuantities[i] || 0,
          price: t.price
        }))
        .filter(t => t.quantity > 0),
      subtotal: this.subtotal,
      buyer
    };

    console.log('Purchase confirmed:', order);
    alert(`Success! Ksh ${this.subtotal.toFixed(2)}`);
    this.closePurchaseForm();
  }
}