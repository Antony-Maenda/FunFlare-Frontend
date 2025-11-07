// src/app/components/get-ticket/get-ticket.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GetTicketService, EventWithTickets } from '../services/get-ticket.service';  // New import

import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-get-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-ticket.html',
  styleUrls: ['./get-ticket.css'],
  providers: [GetTicketService] // optional if providedIn: 'root'
})
export class GetTicketComponent implements OnInit {
  eventWithTickets: EventWithTickets | null = null;
  loading = true;
  error: string | null = null;

  // Ticket selection
  selectedQuantities: number[] = [];
  subtotal = 0;

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
    }
  }

  decrementQuantity(index: number): void {
    if (this.selectedQuantities[index] > 0) {
      this.selectedQuantities[index]--;
      this.updateSubtotal();
    }
  }

  updateSubtotal(): void {
    this.subtotal = this.eventWithTickets!.tickets.reduce((sum, ticket, i) => {
      return sum + ticket.price * (this.selectedQuantities[i] || 0);
    }, 0);
  }
}