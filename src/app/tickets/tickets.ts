import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService, EventCreate } from '../services/event.service';
import { Router } from '@angular/router';

interface TicketType {
  type: 'earlybird' | 'advanced' | 'VIP';
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './tickets.html',
  styleUrls: ['./tickets.css']
})
export class TicketsComponent implements OnInit {
  ticketTypes: TicketType[] = [
    { type: 'earlybird', quantity: 0, price: 0 },
    { type: 'advanced', quantity: 0, price: 0 },
    { type: 'VIP', quantity: 0, price: 0 }
  ];

  eventCapacity: number = 0;

  eventData: (EventCreate & { poster: File | null }) = {
    name: '',
    location: '',
    eventStartDate: '',
    eventEndDate: '',
    eventStartTime: '',
    eventEndTime: '',
    eventCapacity: 0,
    eventCategory: '',
    description: '',
    poster: null
  };

  // ✅ Add this missing property
  error: string | null = null;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    const tempEventData = localStorage.getItem('tempEventData');
    if (tempEventData) {
      try {
        this.eventData = JSON.parse(tempEventData);
        this.eventCapacity = this.eventData?.eventCapacity ?? 0;
      } catch (e) {
        console.error('Failed to parse event data:', e);
      }
    }
  }

  // ✅ getter to safely compute total tickets
  get totalTickets(): number {
    return this.ticketTypes?.reduce((sum, t) => sum + (t.quantity || 0), 0);
  }

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10) || 0;
    this.ticketTypes[index].quantity = quantity;

    if (this.totalTickets > this.eventCapacity) {
      const overflow = this.totalTickets - this.eventCapacity;
      this.ticketTypes[index].quantity = Math.max(0, quantity - overflow);
      this.error = 'Total tickets cannot exceed event capacity.';
    } else {
      this.error = null;
    }
  }

  onFinish(): void {
    this.error = null; // clear old errors

    if (this.totalTickets === 0) {
      this.error = 'Please set at least one ticket type.';
      return;
    }

    if (this.totalTickets > this.eventCapacity) {
      this.error = 'Total tickets exceed event capacity.';
      return;
    }

    const eventDataWithTickets = {
      ...this.eventData,
      tickets: this.ticketTypes.filter(t => t.quantity > 0)
    };

    this.eventService.createEvent(eventDataWithTickets, this.eventData.poster ?? undefined)
      .subscribe({
        next: response => {
          console.log('Event and tickets created successfully:', response);
          localStorage.removeItem('tempEventData');
          this.router.navigate(['/events']);
        },
        error: err => {
          console.error('Error during submission:', err);
          this.error = err.message || 'Failed to create event and tickets.';
        }
      });
  }
}
