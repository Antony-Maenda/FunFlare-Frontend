import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService, Event } from '../services/event.service';
import { TicketService, Ticket } from '../services/ticket.service';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  tickets: Ticket[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private ticketService: TicketService
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

    this.eventService.getEventById(eventId).pipe(timeout(5000)).subscribe({
      next: (event) => {
        console.log('Event data:', event);
        this.event = event;
        this.ticketService.getTicketsForEvent(eventId).pipe(timeout(5000)).subscribe({
          next: (tickets) => {
            console.log('Ticket data:', tickets);
            this.tickets = tickets;
            this.loading = false;
          },
          error: (err: HttpErrorResponse) => {
            console.error('Ticket fetch error:', err);
            this.error = err.message || 'Failed to load tickets.';
            this.loading = false;
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Event fetch error:', err);
        this.error = err.message || 'Failed to load event details.';
        this.loading = false;
      }
    });
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

  editEvent(eventId: number): void {
    console.log('Navigating to edit event:', eventId);
    this.router.navigate(['/organizer-dashboard/events', eventId, 'edit']);
  }

  deleteEvent(eventId: number): void {
    if (confirm('Are you sure you want to delete this event?')) {
      console.log('Deleting event:', eventId);
      this.eventService.deleteEvent(eventId).pipe(timeout(5000)).subscribe({
        next: () => {
          console.log('Event deleted:', eventId);
          this.router.navigate(['/organizer-dashboard/home']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Delete error:', err);
          this.error = err.message || 'Failed to delete event.';
        }
      });
    }
  }
}