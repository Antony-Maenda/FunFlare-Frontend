import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventDetailsService, EventWithTickets } from '../services/event-details.service';  // New import
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetailsComponent implements OnInit {
  eventWithTickets: EventWithTickets | null = null;  // Combined data
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventDetailsService: EventDetailsService  // Use new service
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

    // Single call to new endpoint
    this.eventDetailsService.getEventWithTickets(eventId).subscribe({
      next: (data) => {
        console.log('Event with tickets data:', data);
        this.eventWithTickets = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Event details fetch error:', err);
        this.error = err.error?.message || err.message || 'Failed to load event details and tickets.';
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
      // TODO: Add deleteEvent to EventDetailsService if needed, or inject EventService here
      // For now, placeholder - implement as needed
      alert('Delete functionality to be implemented via service.');
      // Example: this.eventDetailsService.deleteEvent(eventId).subscribe(...);
    }
  }
}