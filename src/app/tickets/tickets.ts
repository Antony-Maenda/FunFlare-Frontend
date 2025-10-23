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
  imports: [FormsModule, CommonModule],
  templateUrl: './tickets.html',
  styleUrls: ['./tickets.css']
})
export class TicketsComponent implements OnInit {
  ticketTypes: Omit<TicketCreate, 'eventId'>[] = [
    { type: 'earlybird', quantity: 0, price: 0.00, saleStartDate: '', saleEndDate: '', saleStartTime: '', saleEndTime: '' },
    { type: 'advanced', quantity: 0, price: 0.00, saleStartDate: '', saleEndDate: '', saleStartTime: '', saleEndTime: '' },
    { type: 'VIP', quantity: 0, price: 0.00, saleStartDate: '', saleEndDate: '', saleStartTime: '', saleEndTime: '' }
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

  onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const oldQuantity = this.ticketTypes[index].quantity;
    const newQuantity = parseInt(input.value, 10) || 0;
    this.ticketTypes[index].quantity = newQuantity;

    const otherTotal = this.totalTickets - newQuantity + oldQuantity;
    if (otherTotal + newQuantity > this.eventCapacity) {
      const maxAllowed = this.eventCapacity - otherTotal;
      this.ticketTypes[index].quantity = Math.max(0, maxAllowed);
      this.error = 'Total tickets cannot exceed event capacity.';
    } else {
      this.error = null;
    }
  }

  onPriceChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let price = parseFloat(input.value) || 0;
    if (price < 0.01) {
      price = 0.01;
      this.error = `Price for ${this.ticketTypes[index].type} must be at least Ksh 0.01.`;
      input.value = price.toFixed(2);
    } else {
      this.error = null;
    }
    this.ticketTypes[index].price = parseFloat(price.toFixed(2));
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

    const hasValidPrices = this.ticketTypes.every(t => t.quantity === 0 || t.price >= 0.01);
    if (!hasValidPrices) {
      this.error = 'All ticket types with quantity > 0 must have a price of at least Ksh 0.01.';
      return;
    }

    const validTickets = this.ticketTypes.filter(t => t.quantity > 0);

    this.eventService.createEvent(this.eventData, this.eventData.poster ?? undefined)
      .subscribe({
        next: (eventResponse) => {
          this.eventId = eventResponse.id;
          console.log('Event created successfully:', eventResponse);

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