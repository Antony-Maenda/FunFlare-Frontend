import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Layout } from '../components/layout/layout';
interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
}
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, Layout],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
  
})
export class LandingPage {
   searchQuery: string = '';
  filteredEvents: any[] = [];

  events = [
    {
      title: 'Live Concert: The Beats',
      date: 'Sep 20, 2025',
      venue: 'Nairobi Arena',
      price: 'KSh 2,500',
      image: 'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Championship Finals',
      date: 'Oct 5, 2025',
      venue: 'Kasarani Stadium',
      price: 'KSh 1,800',
      image: 'https://images.unsplash.com/photo-1600195077074-2e4b0a3c15a9?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Food & Culture Festival',
      date: 'Nov 15, 2025',
      venue: 'Uhuru Gardens',
      price: 'KSh 1,200',
      image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=800&q=80'
    }
  ];

  constructor() {
    // Show all events by default
    this.filteredEvents = [...this.events];
  }

  searchEvents() {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      this.filteredEvents = [...this.events];
      return;
    }

    this.filteredEvents = this.events.filter(e =>
      e.title.toLowerCase().includes(query) ||
      e.venue.toLowerCase().includes(query)
    );
  }
}
