import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-organizer-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
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

  onImageError(event: ErrorEvent, eventName: string): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `<div class="text-gray-500 text-lg font-medium">${eventName}</div>`;
    }
  }
}