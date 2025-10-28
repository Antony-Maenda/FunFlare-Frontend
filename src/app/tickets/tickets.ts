// src/app/tickets/tickets.ts (Confirmed: Already accommodates date/time fields with validation)
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService, EventCreate } from '../services/event.service';
import { TicketService, TicketCreate, TicketResponse } from '../services/ticket.service';
import { Router } from '@angular/router';
import { TempEventService } from '../services/temp-event.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './tickets.html',
  styleUrls: ['./tickets.css']
})
export class TicketsComponent implements OnInit {
  ticketTypes: Omit<TicketCreate, 'eventId'>[] = [ // Omit eventId; add in service
    { type: 'earlybird', quantity: 0, price: 0, saleStartDate: '', saleEndDate: '', saleStartTime: '', saleEndTime: '' },
    { type: 'advanced', quantity: 0, price: 0, saleStartDate: '', saleEndDate: '', saleStartTime: '', saleEndTime: '' },
    { type: 'VIP', quantity: 0, price: 0, saleStartDate: '', saleEndDate: '', saleStartTime: '', saleEndTime: '' }
  ];

  eventCapacity: number = 0;

  eventData: (EventCreate & { poster?: File; posterFilename?: string }) = {
    name: '',
    location: '',
    eventStartDate: '',
    eventEndDate: '',
    eventStartTime: '',
    eventEndTime: '',
    eventCapacity: 0,
    eventCategory: '',
    description: '',
    poster: undefined,
    posterFilename: undefined
  };

  posterPreview: string | null = null;

  error: string | null = null;

  private eventId: number | null = null;

  constructor(
    private eventService: EventService,
    private ticketService: TicketService,
    private router: Router,
    private tempEventService: TempEventService
  ) {}

  ngOnInit(): void {
    const tempData = this.tempEventService.getTempData();
    if (tempData) {
      this.eventData = tempData;
      this.eventCapacity = this.eventData?.eventCapacity ?? 0;

      // ✅ Set defaults for sale dates/times based on event (full period; adjust UI if needed)
      const startDate = this.eventData.eventStartDate;
      const endDate = this.eventData.eventEndDate;
      const startTime = this.eventData.eventStartTime || '00:00:00';
      const endTime = this.eventData.eventEndTime || '23:59:00';
      this.ticketTypes.forEach(t => {
        t.saleStartDate = startDate;
        t.saleEndDate = endDate;
        t.saleStartTime = startTime;
        t.saleEndTime = endTime;
      });

      if (this.eventData.poster) {
        const reader = new FileReader();
        reader.onload = () => {
          this.posterPreview = reader.result as string;
        };
        reader.readAsDataURL(this.eventData.poster);
      }
    }
  }

  get totalTickets(): number {
    return this.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0);
  }

  onQuantityChange(index: number, event: Event): void {
  const input = event.target as HTMLInputElement;
  const oldQuantity = this.ticketTypes[index].quantity;
  const newQuantity = parseInt(input.value, 10) || 0;

  // ✅ Calculate totals BEFORE setting quantity
  const currentTotal = this.totalTickets;
  const otherTotal = currentTotal - oldQuantity;  // Sum of all other types (unchanged)

  if (otherTotal + newQuantity > this.eventCapacity) {
    const maxAllowed = Math.max(0, this.eventCapacity - otherTotal);
    this.ticketTypes[index].quantity = maxAllowed;
    input.value = maxAllowed.toString();  // ✅ Sync input to show the cap
    this.error = `Total tickets cannot exceed event capacity (${this.eventCapacity}). Max for this type: ${maxAllowed}.`;
  } else {
    this.ticketTypes[index].quantity = newQuantity;
    this.error = null;
  }
}

  // ✅ Method for price input handling and validation (dynamic organizer input)
  onPriceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let price = parseFloat(input.value) || 0;
    if (price < 0.01) {
      price = 0.01; // Enforce minimum price
      this.error = 'Price must be at least Ksh 0.01.';
    } else {
      this.error = null;
    }
    this.ticketTypes[index].price = price;
  }

  // ✅ New methods for date/time validation (optional; called from template if needed)
  onSaleStartDateChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const startDate = input.value;
    const endDate = this.ticketTypes[index].saleEndDate;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.error = 'Sale start date must be before or equal to end date.';
    } else {
      this.error = null;
    }
  }

  onSaleEndDateChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const endDate = input.value;
    const startDate = this.ticketTypes[index].saleStartDate;
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      this.error = 'Sale end date must be after or equal to start date.';
    } else {
      this.error = null;
    }
  }

  onFinish(): void {
    this.error = null;

    if (this.totalTickets === 0) {
      this.error = 'Please set at least one ticket type.';
      return;
    }

    if (this.totalTickets > this.eventCapacity) {
      this.error = 'Total tickets exceed event capacity.';
      return;
    }

    // ✅ Check for non-zero prices on selected types
    const hasValidPrices = this.ticketTypes.some(t => t.quantity > 0 && t.price > 0);
    if (!hasValidPrices) {
      this.error = 'Selected ticket types must have a price greater than Ksh 0.00.';
      return;
    }

    // ✅ Validate dates/times for selected types (basic checks)
    const invalidDate = this.ticketTypes.find(t => t.quantity > 0 && (
      !t.saleStartDate || !t.saleEndDate || !t.saleStartTime || !t.saleEndTime ||
      new Date(t.saleStartDate + 'T' + t.saleStartTime) >= new Date(t.saleEndDate + 'T' + t.saleEndTime)
    ));
    if (invalidDate) {
      this.error = 'Sale dates and times must be valid and start before end.';
      return;
    }

    const validTickets = this.ticketTypes.filter(t => t.quantity > 0);

    // Step 1: Create event
    this.eventService.createEvent(this.eventData, this.eventData.poster ?? undefined)
      .subscribe({
        next: (eventResponse) => {
          this.eventId = eventResponse.id;
          console.log('Event created successfully:', eventResponse);
          console.log('All ticketTypes before filter:', JSON.stringify(this.ticketTypes, null, 2));
          const validTickets = this.ticketTypes.filter(t => t.quantity > 0);
          console.log('Sending tickets:', JSON.stringify(validTickets, null, 2));

          // Step 2: Create tickets (one per type, parallel)
          this.ticketService.createTickets(this.eventId!, validTickets)
            .subscribe({
              next: (ticketResponses: TicketResponse[]) => {
                console.log('Tickets created successfully:', ticketResponses);
                this.tempEventService.clearTempData();
                this.router.navigate(['/organizer-dashboard/home']);
              },
              error: (ticketErr) => {
                console.error('Error creating tickets:', ticketErr);
                this.error = ticketErr.message || 'Failed to create tickets. Event was created.';
              }
            });
        },
        error: (eventErr) => {
          console.error('Error creating event:', eventErr);
          this.error = eventErr.message || 'Failed to create event.';
        }
      });
  }
}