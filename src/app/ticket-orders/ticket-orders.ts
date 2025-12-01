import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TicketOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  ticketType: string;
  quantity: number;
  price: number;
  purchaseDate: string;
  paymentMethod: 'M-Pesa' | 'Card' | 'PayPal';
  eventId: string;
  eventName: string;           // Now required (or keep optional if preferred)
  eventPosterUrl?: string;     // Optional – will show fallback if missing
}

@Component({
  selector: 'app-ticket-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-orders.html',
  styleUrls: ['./ticket-orders.css']
})
export class TicketOrdersComponent implements OnInit {
  orders: TicketOrder[] = [
    {
      id: 'TKT001',
      name: 'Kelvin Mwangi',
      email: 'kelvin@example.com',
      phone: '+254712345678',
      ticketType: 'VIP',
      quantity: 2,
      price: 5000,
      purchaseDate: '2025-11-15',
      paymentMethod: 'M-Pesa',
      eventId: '1',
      eventName: 'Nairobi Tech Summit 2025',
      eventPosterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop'
    },
    {
      id: 'TKT002',
      name: 'Aisha Omar',
      email: 'aisha@domain.co',
      phone: '+254723456789',
      ticketType: 'Early Bird',
      quantity: 4,
      price: 2500,
      purchaseDate: '2025-11-10',
      paymentMethod: 'Card',
      eventId: '2',
      eventName: 'Women in Tech Conference',
      eventPosterUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=400&fit=crop'
    },
    {
      id: 'TKT003',
      name: 'David Kimani',
      email: 'david.k@gmail.com',
      phone: '+254734567890',
      ticketType: 'Regular',
      quantity: 1,
      price: 1500,
      purchaseDate: '2025-11-20',
      paymentMethod: 'M-Pesa',
      eventId: '1',
      eventName: 'Nairobi Tech Summit 2025',
      // No poster → fallback initials will show
    },
    {
      id: 'TKT004',
      name: 'Sarah Wanjiku',
      email: 'sarah.w@example.com',
      phone: '+254711223344',
      ticketType: 'Student',
      quantity: 3,
      price: 800,
      purchaseDate: '2025-11-18',
      paymentMethod: 'M-Pesa',
      eventId: '3',
      eventName: 'Campus Hackathon 2025',
      eventPosterUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop'
    }
  ];

  filterText = '';
  sortField: keyof TicketOrder | 'total' = 'purchaseDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  filteredOrders: TicketOrder[] = [];

  ngOnInit(): void {
    this.filteredOrders = [...this.orders];
    this.applyFilter();
    this.applySort();
  }

  applyFilter(): void {
    const term = this.filterText.toLowerCase().trim();
    if (!term) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order =>
        order.name.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.ticketType.toLowerCase().includes(term) ||
        order.eventName.toLowerCase().includes(term)
      );
    }
    this.applySort();
  }

  applySort(): void {
    this.filteredOrders.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (this.sortField === 'total') {
        aVal = a.price * a.quantity;
        bVal = b.price * b.quantity;
      } else {
        aVal = a[this.sortField as keyof TicketOrder];
        bVal = b[this.sortField as keyof TicketOrder];
      }

      // Handle strings vs numbers
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  sort(field: keyof TicketOrder | 'total'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.applySort();
  }

  getTotalRevenue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.price * order.quantity, 0);
  }

  getTicketTypeClass(type: string): string {
    const map: Record<string, string> = {
      'VIP': 'bg-purple-100 text-purple-800 ring-1 ring-purple-300',
      'Early Bird': 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
      'Regular': 'bg-blue-100 text-blue-800 ring-1 ring-blue-300',
      'Student': 'bg-orange-100 text-orange-800 ring-1 ring-orange-300'
    };
    return map[type] || 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
  }
}