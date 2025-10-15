// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EventCreate {
  name: string;
  description?: string;
  location: string;
  eventPosterUrl?: string;
  eventCapacity: number; // ✅ required now (no '?')
  eventCategory?: string;
  eventStartDate: string; // 'YYYY-MM-DD'
  eventEndDate: string;   // 'YYYY-MM-DD'
  eventStartTime: string; // 'HH:mm'
  eventEndTime: string;   // 'HH:mm'
}

export interface EventResponse {
  id: number;
  name: string;
  // Add more response fields as needed
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
  eventStartTime: string;
  // Extend as needed
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events'; // Adjust if backend changes

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
}
