// src/app/services/ticket.service.ts (Confirmed: Already passes date/time fields in payload)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TicketCreate {
  eventId: number;
  type: 'earlybird' | 'advanced' | 'VIP';
  quantity: number;
  price: number;
  saleStartDate: string;
  saleEndDate: string;
  saleStartTime: string;
  saleEndTime: string;
}

export interface TicketResponse {
  id: number;
  type: string;
  quantity: number;
  price: number;
  saleStartDate: string;
  saleEndDate: string;
  saleStartTime: string;
  saleEndTime: string;
}

export interface Ticket {
  id: number;
  type: string;
  quantity: number;
  price: number;
  eventId: number;
  saleStartDate: string;
  saleEndDate: string;
  saleStartTime: string;
  saleEndTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  createSingleTicket(ticketData: TicketCreate): Observable<TicketResponse> {
    let backendType: string = ticketData.type;

    if (ticketData.type === 'earlybird') {
      backendType = 'EARLY_BIRD';
    } else if (ticketData.type === 'advanced') {
      backendType = 'ADVANCE';
    } else if (ticketData.type === 'VIP') {
      backendType = 'VIP';
    }

    const payload = {
      eventId: ticketData.eventId,
      type: backendType,
      price: ticketData.price,
      quantity: ticketData.quantity,
      saleStartDate: ticketData.saleStartDate,
      saleEndDate: ticketData.saleEndDate,
      saleStartTime: ticketData.saleStartTime,
      saleEndTime: ticketData.saleEndTime
    };

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const createUrl = `${this.baseUrl}/generate/tickets`;

    return this.http.post<any>(createUrl, payload, { headers }).pipe(
      map(response => ({
        id: response.id || response.ticketId,
        type: response.type,
        quantity: response.quantity,
        price: response.price,
        saleStartDate: response.saleStartDate,
        saleEndDate: response.saleEndDate,
        saleStartTime: response.saleStartTime,
        saleEndTime: response.saleEndTime
      })),
      catchError(error => {
        console.error('Ticket creation failed:', error);
        const message = error.error?.message || 'Failed to create ticket. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  createTickets(eventId: number, tickets: Omit<TicketCreate, 'eventId'>[]): Observable<TicketResponse[]> {
    const ticketObservables = tickets.map(t => 
      this.createSingleTicket({ ...t, eventId } as TicketCreate)
    );
    return forkJoin(ticketObservables);
  }

  getTicketsForEvent(eventId: number): Observable<Ticket[]> {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      return throwError(() => new Error('No JWT token found. Please log in.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const url = `${this.baseUrl}/${eventId}/tickets`;

    return this.http.get<any[]>(url, { headers }).pipe(
      map(tickets =>
        tickets.map(t => ({
          id: t.id || t.ticketId,
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          eventId: eventId,
          saleStartDate: t.saleStartDate,
          saleEndDate: t.saleEndDate,
          saleStartTime: t.saleStartTime,
          saleEndTime: t.saleEndTime
        }))
      ),
      catchError(error => {
        console.error('Failed to fetch tickets:', error);
        const message = error.error?.message || 'Failed to fetch tickets. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }
}