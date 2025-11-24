// src/app/tickets/tickets.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService, EventCreate } from '../services/event.service';
import { TicketService, TicketCreate, TicketResponse } from '../services/ticket.service';
import { Router } from '@angular/router';
import { TempEventService } from '../services/temp-event.service';

interface TicketWithDiscount extends Omit<TicketCreate, 'eventId'> {
  hasDiscount?: boolean;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './tickets.html',
  styleUrls: ['./tickets.css']
})
export class TicketsComponent implements OnInit {
  ticketTypes: TicketWithDiscount[] = [
    { 
      type: 'earlybird', 
      quantity: 0, 
      price: 0, 
      saleStartDate: '', 
      saleEndDate: '', 
      saleStartTime: '', 
      saleEndTime: '',
      hasDiscount: false,
      discountValue: 0,
      discountType: 'percentage'
    },
    { 
      type: 'advanced', 
      quantity: 0, 
      price: 0, 
      saleStartDate: '', 
      saleEndDate: '', 
      saleStartTime: '', 
      saleEndTime: '',
      hasDiscount: false,
      discountValue: 0,
      discountType: 'percentage'
    },
    { 
      type: 'VIP', 
      quantity: 0, 
      price: 0, 
      saleStartDate: '', 
      saleEndDate: '', 
      saleStartTime: '', 
      saleEndTime: '',
      hasDiscount: false,
      discountValue: 0,
      discountType: 'percentage'
    }
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

  finalPrice(ticket: TicketWithDiscount): number {
    if (!ticket.hasDiscount || !ticket.discountValue || ticket.discountValue <= 0) {
      return ticket.price || 0;
    }
    if (ticket.discountType === 'percentage') {
      return ticket.price * (1 - (ticket.discountValue / 100));
    } else {
      return Math.max(0, ticket.price - ticket.discountValue);
    }
  }

  ticketRevenue(ticket: TicketWithDiscount): number {
    return (ticket.quantity || 0) * this.finalPrice(ticket);
  }

  get totalEarnings(): number {
    return this.ticketTypes.reduce((sum, ticket) => sum + this.ticketRevenue(ticket), 0);
  }

  // ──────────────────────────────────────────────────────────────
  // NEW: DISCOUNT CHANGE HANDLERS (Only additions)
  // ──────────────────────────────────────────────────────────────

  onDiscountToggle(index: number, checked: boolean): void {
    this.ticketTypes[index].hasDiscount = checked;

    if (!checked) {
      this.ticketTypes[index].discountValue = 0;
      this.ticketTypes[index].discountType = 'percentage';
    }
    this.error = null;
  }

  onDiscountValueChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value) || 0;
    const ticket = this.ticketTypes[index];

    if (value < 0) value = 0;

    if (ticket.discountType === 'percentage' && value > 100) {
      value = 100;
      this.error = 'Discount percentage cannot exceed 100%.';
    } else if (ticket.discountType === 'fixed' && value > ticket.price) {
      value = ticket.price;
      this.error = `Fixed discount cannot exceed ticket price (KSh ${ticket.price}).`;
    } else {
      this.error = null;
    }

    ticket.discountValue = value;
    input.value = value.toString();
  }

  onDiscountTypeChange(index: number, type: 'percentage' | 'fixed'): void {
    const ticket = this.ticketTypes[index];
    ticket.discountType = type;

    // Auto-adjust value if switching types
    if (type === 'percentage' && (ticket.discountValue || 0) > 100) {
      ticket.discountValue = 100;
    } else if (type === 'fixed' && (ticket.discountValue || 0) > ticket.price) {
      ticket.discountValue = ticket.price;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Existing logic — 100% untouched
  // ──────────────────────────────────────────────────────────────

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const oldQuantity = this.ticketTypes[index].quantity;
    const newQuantity = parseInt(input.value, 10) || 0;

    const currentTotal = this.totalTickets;
    const otherTotal = currentTotal - (oldQuantity || 0);

    if (otherTotal + newQuantity > this.eventCapacity) {
      const maxAllowed = Math.max(0, this.eventCapacity - otherTotal);
      this.ticketTypes[index].quantity = maxAllowed;
      input.value = maxAllowed.toString();
      this.error = `Total tickets cannot exceed event capacity (${this.eventCapacity}). Max for this type: ${maxAllowed}.`;
    } else {
      this.ticketTypes[index].quantity = newQuantity;
      this.error = null;
    }
  }

  onPriceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let price = parseFloat(input.value) || 0;
    if (price < 0) {
      price = 0;
      this.error = `Price for ${this.ticketTypes[index].type} must be at least Ksh 1.`;
      input.value = price.toFixed(2);
    } else {
      this.error = null;
    }
    this.ticketTypes[index].price = parseFloat(price.toFixed(2));
  }

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

    const hasValidPrices = this.ticketTypes.every(t => t.quantity === 0 || (t.price || 0) >= 0.01);
    if (!hasValidPrices) {
      this.error = 'All ticket types with quantity > 0 must have a price of at least Ksh 0.01.';
      return;
    }

    const invalidDate = this.ticketTypes.find(t => t.quantity! > 0 && (
      !t.saleStartDate || !t.saleEndDate || !t.saleStartTime || !t.saleEndTime ||
      new Date(t.saleStartDate + 'T' + t.saleStartTime) >= new Date(t.saleEndDate + 'T' + t.saleEndTime)
    ));
    if (invalidDate) {
      this.error = 'Sale dates and times must be valid and start before end.';
      return;
    }

    const validTickets = this.ticketTypes
      .filter(t => t.quantity! > 0)
      .map(t => ({
        type: t.type,
        quantity: t.quantity!,
        price: t.price!,
        saleStartDate: t.saleStartDate,
        saleEndDate: t.saleEndDate,
        saleStartTime: t.saleStartTime,
        saleEndTime: t.saleEndTime,
        hasDiscount: t.hasDiscount,
        discountValue: t.discountValue,
        discountType: t.discountType
      }));

    this.eventService.createEvent(this.eventData, this.eventData.poster ?? undefined)
      .subscribe({
        next: (eventResponse) => {
          this.eventId = eventResponse.id;
          console.log('Event created:', eventResponse);

          this.ticketService.createTickets(this.eventId!, validTickets)
            .subscribe({
              next: (responses) => {
                console.log('Tickets created:', responses);
                this.tempEventService.clearTempData();
                this.router.navigate(['/organizer-dashboard/home']);
              },
              error: (err) => {
                console.error('Ticket creation failed:', err);
                this.error = err.message || 'Failed to create tickets.';
              }
            });
        },
        error: (err) => {
          console.error('Event creation failed:', err);
          this.error = err.message || 'Failed to create event.';
        }
      });
  }
}