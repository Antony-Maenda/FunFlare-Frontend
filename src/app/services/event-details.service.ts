import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface EventWithTickets {
  id: number;
  organizerId: number;
  name: string;
  description: string;
  location: string;
  eventPosterUrl: string;
  eventCapacity: number;
  eventCategory: string;
  eventStatus: string;
  createdAt: string;
  updatedAt: string;
  eventStartDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
  tickets: {
    id: number;
    type: string;
    quantity: number;
    price: number;
    quantitySold?: number;
    saleStartDate: string;
    saleEndDate: string;
    saleStartTime: string;
    saleEndTime: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class EventDetailsService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  getEventWithTickets(eventId: number): Observable<EventWithTickets> {
    const token = localStorage.getItem('jwtToken');
    if (!token) return throwError(() => new Error('No JWT token found. Please log in.'));

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<EventWithTickets>(`${this.baseUrl}/${eventId}/details`, { headers }).pipe(
      timeout(5000),
      catchError(err => throwError(() => err.error?.message || 'Failed to load event details.'))
    );
  }
}