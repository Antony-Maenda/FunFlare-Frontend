import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

export interface EventWithTickets {
  id: number;
  organizerId: number;
  name: string;
  description: string;
  location: string;
  eventPosterUrl: string;
  eventCapacity: number;
  eventCategory: string;
  eventStatus: string;
  createdAt: string;
  updatedAt: string;
  eventStartDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
  tickets: {
    id: number;
    type: string;
    quantity: number;
    price: number;
    quantitySold?: number;
    saleStartDate: string;
    saleEndDate: string;
    saleStartTime: string;
    saleEndTime: string;
  }[];
}

@Component({
  selector: 'app-get-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-ticket.html',
  styleUrls: ['./get-ticket.css']
})
export class GetTicketComponent implements OnInit {
  eventWithTickets: EventWithTickets | null = null;
  loading: boolean = true;
  error: string | null = null;

  // Ticket selection state
  selectedQuantities: number[] = [];
  subtotal: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Event ID:', eventId);

    if (isNaN(eventId)) {
      this.error = 'Invalid event ID.';
      this.loading = false;
      console.error('Invalid event ID:', eventId);
      return;
    }

    // Mock data for demonstration (replace with actual API call when service is available)
    // This simulates the same structure as the real service
    const mockData: EventWithTickets = {
      id: eventId,
      organizerId: 1,
      name: 'Sample Concert Event',
      description: 'An amazing live music experience featuring top artists.',
      location: 'Nairobi, Kenya',
      eventPosterUrl: 'https://images.unsplash.com/photo-1540039156060-76da999c14d9?auto=format&fit=crop&w=800&q=80',
      eventCapacity: 5000,
      eventCategory: 'Concert',
      eventStatus: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      eventStartDate: '2025-12-20',
      eventEndDate: '2025-12-20',
      eventStartTime: '19:00',
      eventEndTime: '23:00',
      tickets: [
        {
          id: 1,
          type: 'VIP',
          quantity: 100,
          price: 5000,
          saleStartDate: '2025-11-01',
          saleEndDate: '2025-12-19',
          saleStartTime: '00:00',
          saleEndTime: '23:59'
        },
        {
          id: 2,
          type: 'Regular',
          quantity: 1000,
          price: 2000,
          saleStartDate: '2025-11-01',
          saleEndDate: '2025-12-19',
          saleStartTime: '00:00',
          saleEndTime: '23:59'
        }
      ]
    };

    // Simulate API delay
    setTimeout(() => {
      console.log('Mock event with tickets data:', mockData);
      this.eventWithTickets = mockData;
      this.selectedQuantities = new Array(this.eventWithTickets.tickets.length).fill(0);
      this.loading = false;
    }, 800);
  }

  onImageError(event: ErrorEvent, eventName: string): void {
    console.log('Image error for event:', eventName);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `<div class="text-gray-500 text-lg font-medium">${eventName}</div>`;
    }
  }

  // Ticket quantity controls
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
      return sum + (ticket.price * (this.selectedQuantities[i] || 0));
    }, 0);
  }
}