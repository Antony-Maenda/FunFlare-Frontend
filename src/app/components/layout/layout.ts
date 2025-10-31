// src/app/components/layout/layout.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router'; // CORRECT PATH
import { EventService, PublicEvent } from '../../services/event.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterModule  // Enables routerLink
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  searchQuery = '';
  filteredEvents: PublicEvent[] = [];
  allEvents: PublicEvent[] = [];
  loading = true;
  error = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadPublicEvents();
  }

  loadPublicEvents(): void {
    this.loading = true;
    this.error = false;

    this.eventService.getPublicEvents().subscribe({
      next: (events) => {
        this.allEvents = events;
        this.filteredEvents = [...events];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  searchEvents(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredEvents = [...this.allEvents];
      return;
    }

    this.filteredEvents = this.allEvents.filter(event =>
      event.name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }
}