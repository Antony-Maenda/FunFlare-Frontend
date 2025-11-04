// src/app/landing-page/landing-page.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


interface Event {
  title: string;
  date: string;
  venue: string;
  price: string;
  image: string;
}

@Component({
  selector: 'app-landing-page-navbar',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
   
  ],
  templateUrl: './landing-page-navbar.html',
  styleUrl: './landing-page-navbar.css'
})
export class LandingPageNavbar {
  searchQuery = '';
  filteredEvents: Event[] = [];

  events: Event[] = [
    
  ];

  constructor() {
    this.filteredEvents = [...this.events];
  }

  searchEvents(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredEvents = [...this.events];
      return;
    }
    this.filteredEvents = this.events.filter(e =>
      e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
    );
  }
}