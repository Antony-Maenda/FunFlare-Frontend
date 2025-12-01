// src/app/organizer-dashboard/my-events/my-events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-events.html',
  styleUrls: ['./my-events.css']
})
export class MyEventsComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
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

  // Fixed: Correct type for image error event
  onImageError(event: Event | any): void {
    const img = event.target as HTMLImageElement;
    if (img?.parentElement) {
      img.style.display = 'none';
      // Optional: show initials or name
      const fallback = document.createElement('div');
      fallback.className = 'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600';
      fallback.textContent = (event.target?.alt || 'EV').slice(0, 2).toUpperCase();
      img.parentElement.appendChild(fallback);
    }
  }

  // NEW: Determine event status based on date & time
  getEventStatus(event: Event): 'Upcoming' | 'Active' | 'Past' {
    const now = new Date();

    // Combine date + time into full Date objects
    const startDateTime = new Date(`${event.eventStartDate}T${event.eventStartTime}`);
    const endDateTime = event.eventEndDate && event.eventEndTime
      ? new Date(`${event.eventEndDate}T${event.eventEndTime}`)
      : new Date(startDateTime.getTime() + 6 * 60 * 60 * 1000); // fallback: +6 hours

    if (isNaN(startDateTime.getTime())) return 'Upcoming'; // safety

    if (now < startDateTime) {
      return 'Upcoming';
    } else if (now >= startDateTime && now <= endDateTime) {
      return 'Active';
    } else {
      return 'Past';
    }
  }

  // NEW: Dynamic badge class for status
  getStatusClass(event: Event): string {
    const status = this.getEventStatus(event);
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Active':
        return 'bg-green-100 text-green-800 border border-green-200 animate-pulse';
      case 'Past':
        return 'bg-gray-100 text-gray-600 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  // NEW: Cleaner category badge classes
  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'Concert': 'bg-purple-600',
      'Conference': 'bg-green-600',
      'Festival': 'bg-orange-600',
      'Sports': 'bg-blue-600',
      'Party': 'bg-pink-600',
      'Theater': 'bg-indigo-600'
    };
    return map[category] || 'bg-gray-600';
  }
}