// src/app/services/ticket.service.ts (Confirmed: Already passes date/time fields in payload)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TicketCreate {
  eventId: number; // Added to match DTO
  type: 'earlybird' | 'advanced' | 'VIP'; // Frontend types; map to backend in service
  quantity: number;
  price: number;
  // Add these to match DTO (default/compute in component)
  saleStartDate: string; // 'YYYY-MM-DD'
  saleEndDate: string;   // 'YYYY-MM-DD'
  saleStartTime: string; // 'HH:mm:ss'
  saleEndTime: string;   // 'HH:mm:ss'
}

export interface TicketResponse {
  id: number;
  type: string;
  quantity: number;
  price: number;
  // Add more from backend DTO as needed
}

export interface Ticket {
  id: number;
  type: string;
  quantity: number;
  price: number;
  eventId: number;
  // Extend as needed
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'http://localhost:8080/api/events'; // Matches backend

  constructor(private http: HttpClient) {}

  /**
   * Creates a single ticket for an event (matches backend /generate/tickets).
   * @param ticketData Full DTO matching TicketCreateDTO.
   * @returns Observable of the single ticket response.
   */
  createSingleTicket(ticketData: TicketCreate): Observable<TicketResponse> {
    let backendType: string = ticketData.type; // ✅ Explicit string type to allow mapping

    // Map frontend type to backend expected string (case-insensitive in DTO, but use uppercase for enum match)
    if (ticketData.type === 'earlybird') {
      backendType = 'EARLY_BIRD'; // Matches backend enum/DTO pattern
    } else if (ticketData.type === 'advanced') {
      backendType = 'ADVANCE';
    } else if (ticketData.type === 'VIP') {
      backendType = 'VIP'; // Assumes backend updated for VIP support
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
    const createUrl = `${this.baseUrl}/generate/tickets`; // Matches backend path

    return this.http.post<any>(createUrl, payload, { headers }).pipe(
      map(response => ({ // Map backend response to frontend interface
        id: response.id || response.ticketId, // Adjust if backend uses 'ticketId'
        type: response.type,
        quantity: response.quantity,
        price: response.price,
        eventId: ticketData.eventId
      })),
      catchError(error => {
        console.error('Ticket creation failed:', error);
    
        const message = error.error?.message || 'Failed to create ticket. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  /**
   * Creates multiple tickets (one API call per type).
   * @param eventId The event ID.
   * @param tickets Array of ticket details.
   * @returns Observable of all responses (parallel via forkJoin).
   */
  createTickets(eventId: number, tickets: Omit<TicketCreate, 'eventId'>[]): Observable<TicketResponse[]> {
    const ticketObservables = tickets.map(t => 
      this.createSingleTicket({ ...t, eventId } as TicketCreate)
    );
    return forkJoin(ticketObservables);
  }

  getTicketsForEvent(eventId: number): Observable<Ticket[]> {
    // Implement if needed; backend may need a GET endpoint
    return throwError(() => new Error('Not implemented yet'));
  }
}