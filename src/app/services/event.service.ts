// event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EventCreate {
  name: string;
  description?: string;
  location: string;
  eventPosterUrl?: string;
  eventCapacity?: number;
  eventCategory?: string;
  eventStartDate: string; // 'YYYY-MM-DD'
  eventEndDate: string; // 'YYYY-MM-DD'
  eventStartTime: string; // 'HH:mm'
  eventEndTime: string; // 'HH:mm'
}

export interface EventResponse {
  id: number;
  name: string;
  // Add other fields as needed from backend response
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
  // Add other fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = 'http://localhost:8080/api/events';  // Full URL to backend

  constructor(private http: HttpClient) {}

  createEvent(eventData: EventCreate, poster?: File): Observable<EventResponse> {
    // Create JSON string for DTO
    const dtoJson = JSON.stringify(eventData);

    const formData = new FormData();
    formData.append('dto', dtoJson);

    if (poster) {
      formData.append('poster', poster, poster.name);
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const createUrl = `${this.baseUrl}/create/event`;
    return this.http.post<EventResponse>(createUrl, formData, { headers }).pipe(
      catchError(error => {
        console.error('Event creation failed:', error);
        let errorMessage = 'Failed to create event. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getOrganizerEvents(): Observable<Event[]> {
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const getUrl = `${this.baseUrl}/organizer`;
    return this.http.get<Event[]>(getUrl, { headers }).pipe(
      catchError(error => {
        console.error('Failed to fetch organizer events:', error);
        return throwError(() => new Error('Failed to load events'));
      })
    );
  }
}