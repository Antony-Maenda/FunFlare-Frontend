import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  createEvent(eventData: EventCreate, poster?: File): Observable<EventResponse> {
    const formData = new FormData();
    formData.append('dto', JSON.stringify(eventData));

    if (poster) {
      formData.append('poster', poster, poster.name);
    }

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const createUrl = `${this.baseUrl}/create/event`;

    return this.http.post<EventResponse>(createUrl, formData, { headers }).pipe(
      catchError(error => {
        console.error('Event creation failed:', error);
        const message = error.error?.message || 'Failed to create event. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  getOrganizerEvents(): Observable<Event[]> {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const getUrl = `${this.baseUrl}/organizer`;

    return this.http.get<Event[]>(getUrl, { headers }).pipe(
      catchError(error => {
        console.error('Failed to fetch organizer events:', error);
        return throwError(() => new Error('Failed to load events.'));
      })
    );
  }

  getEventById(eventId: number): Observable<Event> {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${this.baseUrl}/${eventId}`;

    return this.http.get<EventResponse>(url, { headers }).pipe(
      map(response => ({
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
      })),
      catchError(error => {
        console.error('Failed to fetch event:', error);
        const message = error.error?.message || 'Failed to fetch event details. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  deleteEvent(eventId: number): Observable<void> {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${this.baseUrl}/${eventId}`;

    return this.http.delete<void>(url, { headers }).pipe(
      catchError(error => {
        console.error('Failed to delete event:', error);
        const message = error.error?.message || 'Failed to delete event. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }
}