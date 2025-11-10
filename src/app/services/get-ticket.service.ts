//.service.ts


// src/app/services/get-ticket.service.ts
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
  eventPosterUrl: string | null;
  eventCategory: string;
  eventStatus: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;      // ← was eventStartDate
  endDate: string;
  startTime: string;      // ← was eventStartTime
  endTime: string;        // ← was eventEndTime
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
export class GetTicketService {
  private baseUrl = 'http://localhost:8080/api/events/public';

  constructor(private http: HttpClient) {}

 // src/app/services/get-ticket.service.ts
getEventWithTickets(eventId: number): Observable<EventWithTickets> {
  return this.http
    .get<EventWithTickets>(`${this.baseUrl}/${eventId}`)  // ← No headers
    .pipe(
      timeout(5000),
      catchError(err =>
        throwError(() => err.error?.message || 'Event not found')
      )
    );
}
}