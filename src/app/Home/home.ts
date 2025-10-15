// home.ts (OrganizerDashboardHomeComponent)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, EventCreate } from '../services/event.service';

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventPosterUrl?: string;
  eventPosterBase64?: string; // Base64 encoded image
  eventCapacity: number;
  eventCategory: string;
  eventStartDate: string;
  eventStartTime: string;
  // Add other fields as needed
}

@Component({
  selector: 'app-organizer-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'] // Optional, if needed
})
export class OrganizerDashboardHomeComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    // Assuming EventService has a method getOrganizerEvents(): Observable<Event[]>
    this.eventService.getOrganizerEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = 'Failed to load your events. Please try again later.';
        this.loading = false;
      }
    });
  }

  onImageError(event: any, altText: string): void {
    (event.target as HTMLImageElement).src = ''; // Clear broken image
    // Optionally, show fallback or log error
    console.warn(`Failed to load image for event: ${altText}`);
  }
}