// src/app/components/get-ticket/get-ticket.component.ts
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GetTicketService, EventWithTickets } from '../services/get-ticket.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PurchaseComponent } from '../purchase/purchase';
import { CartService } from '../services/cart.service';
import { BuyerNavbar } from '../navbar/buyer-navbar/buyer-navbar';

@Component({
  selector: 'app-get-ticket',
  standalone: true,
  imports: [
    CommonModule,
    PurchaseComponent,
    RouterModule,
    BuyerNavbar
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

  incrementQuantity(index: number): void {
    const ticket = this.eventWithTickets!.tickets[index];
    const current = this.selectedQuantities[index] ?? 0;
    if (current >= ticket.quantity) return;

    this.selectedQuantities[index]++;
    this.updateSubtotal();
    this.saveCartItem(index);
    this.cdr.markForCheck();
  }

  decrementQuantity(index: number): void {
    if ((this.selectedQuantities[index] ?? 0) <= 0) return;

    this.selectedQuantities[index]--;
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

  // FIXED: Now accepts the FULL DTO from PurchaseComponent
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

    // Trigger global purchase via CartService (so navbar can handle it)
    this.cartService.triggerPurchase(data);

    // Optionally close modal immediately
    this.closePurchaseForm();

    // Optional: Show confirmation
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