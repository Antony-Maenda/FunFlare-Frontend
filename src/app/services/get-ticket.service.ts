import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Ticket {
  id: number;
  type: string;
  price: number;
  quantity: number;
  selected?: number; // Added in component
}

export interface Event {
  id: number;
  name: string;
  eventPosterUrl: string;
  description: string;
  location: string;
  startDate: string; // ISO string: "2025-06-15T00:00:00.000Z"
  startTime: string; // "14:00"
  endTime: string;   // "23:00"
  category: string;
  tickets: Ticket[];
}

@Injectable({
  providedIn: 'root'
})
export class GetTicketService {
  // CHANGE THIS TO YOUR BACKEND URL
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  /**
   * Fetch single event by ID
   */
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`).pipe(
      tap(event => console.log('Fetched event:', event)),
      catchError(this.handleError)
    );
  }

  /**
   * Optional: Fetch all events (for landing page)
   */
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Centralized error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let message = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(message));
  }
}