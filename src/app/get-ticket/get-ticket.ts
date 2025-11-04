import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { LandingPageNavbar } from '../navbar/landing-page-navbar/landing-page-navbar'; 
import { BuyerNavbar } from '../navbar/buyer-navbar/buyer-navbar';



@Component({
  selector: 'app-get-ticket',
  imports: [CommonModule,BuyerNavbar, LandingPageNavbar],
  templateUrl: './get-ticket.html',
  styleUrls: ['./get-ticket.css'],
  standalone: true
})
export class GetTicketComponent implements OnInit, OnDestroy {
  event: any = null;
  totalAmount = 0;
  isBuyer = false;
  private authSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
  const id = +this.route.snapshot.paramMap.get('id')!;

  this.event = this.getMockEvent(id);

  // ← ADD THIS CHECK
  if (!this.event) {
    console.error(`Event with id ${id} not found`);
    this.router.navigate(['/']); // or show 404
    return;
  }

  this.event.tickets = (this.event.tickets || []).map((t: any) => ({ ...t, selected: 0 }));
  this.updateTotal();

  // Auth subscription
  this.authSub = this.authService.isLoggedIn$.subscribe(loggedIn => {
    const role = this.authService.getRole();
    this.isBuyer = loggedIn && role === 'attendee';
  });
}

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  isBuyerLoggedIn(): boolean {
    return this.isBuyer;
  }

  private getMockEvent(id: number): any {
  const mockEvents: any = {
    1: {
      id: 1,
      name: "Afrobeat Summer Fest",
      eventPosterUrl: "https://images.unsplash.com/photo-1493676304819-0d7a8d93849c", // ← FIXED: removed extra "photo-"
      description: "Join us for the biggest Afrobeat festival in Nairobi with top artists, food, and vibes!",
      location: "Uhuru Gardens, Nairobi",
      startDate: "2025-06-15T00:00:00.000Z",
      startTime: "14:00",
      endTime: "23:00",
      category: "Music",
      tickets: [
        { id: 1, type: "Regular", price: 1500, quantity: 200 },
        { id: 2, type: "VIP", price: 5000, quantity: 50 },
        { id: 3, type: "VVIP", price: 10000, quantity: 20 }
      ]
    },
    2: {
      id: 2,
      name: "Tech Summit 2025",
      eventPosterUrl: "https://images.unsplash.com/photo-1505373877841-8d25f771d0b7",
      description: "Explore the future of AI, blockchain, and digital innovation with global experts.",
      location: "KICC, Nairobi",
      startDate: "2025-07-20T00:00:00.000Z",
      startTime: "09:00",
      endTime: "17:00",
      category: "Conference",
      tickets: [
        { id: 4, type: "Standard", price: 3000, quantity: 150 },
        { id: 5, type: "Premium", price: 8000, quantity: 40 }
      ]
    }
  };

  return mockEvents[id] || null;
}

  updateQuantity(ticket: any, change: number): void {
    const newQty = ticket.selected + change;
    if (newQty >= 0 && newQty <= (ticket.quantity ?? Infinity)) {
      ticket.selected = newQty;
      this.updateTotal();
    }
  }

  updateTotal(): void {
    this.totalAmount = this.event?.tickets?.reduce((sum: number, t: any) => sum + t.selected * t.price, 0) || 0;
  }

  proceedToCheckout(): void {
    if (this.totalAmount === 0) return;

    const selected = this.event.tickets
      .filter((t: any) => t.selected > 0)
      .map((t: any) => ({ id: t.id, type: t.type, quantity: t.selected, price: t.price }));

    this.router.navigate(['/checkout'], {
      state: { event: this.event, tickets: selected, total: this.totalAmount }
    });
  }
}