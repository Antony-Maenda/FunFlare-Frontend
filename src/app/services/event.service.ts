// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// === ORGANIZER INTERFACES (EXISTING) ===
export interface EventCreate {
  name: string;
  description?: string;
  location: string;
  eventPosterUrl?: string;
  eventCapacity: number;
  eventCategory?: string;
  eventStartDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
}

export interface EventResponse {
  id: number;
  name: string;
  description?: string;
  location: string;
  eventPosterUrl?: string;
  eventCapacity: number;
  eventCategory?: string;
  eventStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  eventStartDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventPosterUrl?: string;
  eventCapacity: number;
  eventCategory: string;
  eventStartDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
}

// === BUYER (PUBLIC) INTERFACES (NEW) ===
export interface TicketInfo {
  type: string;
  price: number;
  available: number;
}

export interface PublicEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  eventPosterUrl: string;
  eventPosterBase64?: string;
  startDate: string;     // "2025-11-15"
  startTime: string;     // "09:00:00"
  endDate: string;
  endTime: string;
  tickets: TicketInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  // === ORGANIZER: CREATE EVENT ===
  createEvent(eventData: EventCreate, poster?: File): Observable<EventResponse> {
    const formData = new FormData();
    formData.append('dto', JSON.stringify(eventData));
    if (poster) formData.append('poster', poster, poster.name);

    const token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post<EventResponse>(`${this.baseUrl}/create/event`, formData, { headers }).pipe(
      catchError(err => this.handleError(err, 'create event'))
    );
  }

  // === ORGANIZER: GET OWN EVENTS ===
  getOrganizerEvents(): Observable<Event[]> {
    const token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get<EventResponse[]>(`${this.baseUrl}/organizer`, { headers }).pipe(
      map(events => events.map(e => this.mapToEvent(e))),
      catchError(err => this.handleError(err, 'load organizer events'))
    );
  }

  // === ORGANIZER: GET SINGLE EVENT ===
  getEventById(eventId: number): Observable<Event> {
    const token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get<EventResponse>(`${this.baseUrl}/${eventId}`, { headers }).pipe(
      map(response => this.mapToEvent(response)),
      catchError(err => this.handleError(err, 'fetch event details'))
    );
  }

  // === ORGANIZER: DELETE EVENT ===
  deleteEvent(eventId: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.delete<void>(`${this.baseUrl}/${eventId}`, { headers }).pipe(
      catchError(err => this.handleError(err, 'delete event'))
    );
  }

  // === BUYER: GET PUBLIC EVENTS (NEW) ===
  getPublicEvents(): Observable<PublicEvent[]> {
    // NO JWT NEEDED
    return this.http.get<PublicEvent[]>(`${this.baseUrl}/public`).pipe(
      catchError(err => {
        console.error('Failed to load public events:', err);
        return throwError(() => new Error('Failed to load events. Please try again.'));
      })
    );
  }

  // === HELPER: Get JWT Token ===
  private getToken(): string {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('No JWT token found. Please log in.');
    return token;
  }

  // === HELPER: Map Response to Event ===
  private mapToEvent(response: EventResponse): Event {
    return {
      id: response.id,
      name: response.name,
      description: response.description || 'No description provided',
      location: response.location,
      eventPosterUrl: response.eventPosterUrl,
      eventCapacity: response.eventCapacity,
      eventCategory: response.eventCategory || 'Uncategorized',
      eventStartDate: response.eventStartDate,
      eventEndDate: response.eventEndDate,
      eventStartTime: response.eventStartTime,
      eventEndTime: response.eventEndTime
    };
  }

  // === HELPER: Centralized Error Handling ===
  private handleError(error: any, action: string): Observable<never> {
    console.error(`Failed to ${action}:`, error);
    const message = error.error?.message || `Failed to ${action}. Please try again.`;
    return throwError(() => new Error(message));
  }
}