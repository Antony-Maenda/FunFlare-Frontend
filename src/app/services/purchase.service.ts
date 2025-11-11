// src/app/services/purchase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from './cart.service';

export interface PurchaseCreateDTO {
  eventId: number;
  selectedTickets: Array<{
    ticketType: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;        
  purchaseEmail: string;
  phoneNumber: string;
  guestName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = 'http://localhost:8080/api/purchases/create';

  constructor(private http: HttpClient) {}

  createPurchase(
    cartItems: CartItem[],
    buyer: { name: string; email: string; phone: string },
    userId: number
  ): Observable<any> {
    const eventId = cartItems.length > 0 ? cartItems[0].eventId : 1;

    const dto: PurchaseCreateDTO = {
      eventId,
      selectedTickets: cartItems.map(item => ({
        ticketType: item.ticketType.toUpperCase(),  // ← EARLY_BIRD, VIP, etc.
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod: 'MPESA',           // ← HARDCODED
      purchaseEmail: buyer.email,
      phoneNumber: buyer.phone,
      guestName: buyer.name
    };

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post(this.apiUrl, dto, {
      headers,
      params: { userId: userId.toString() }
    });
  }
}