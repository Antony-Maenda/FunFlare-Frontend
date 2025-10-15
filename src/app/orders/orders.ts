import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Order {
  orderNumber: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  method: string;
  status: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent {
  orders: Order[] = [
    { orderNumber: 'ORD001', name: 'John Doe', email: 'john.doe@example.com', phone: '+254712345678', date: '2025-10-07', method: 'Credit Card', status: 'Completed' },
    { orderNumber: 'ORD002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+254723456789', date: '2025-10-08', method: 'PayPal', status: 'Pending' },
    { orderNumber: 'ORD003', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '+254734567890', date: '2025-10-08', method: 'M-Pesa', status: 'Failed' }
  ];

  filterText: string = '';
  sortField: string = 'orderNumber';
  sortDirection: string = 'asc';
  filteredOrders: Order[] = [...this.orders];

  ngOnInit() {
    this.applyFilter();
    this.applySort();
  }

  applyFilter(): void {
    this.filteredOrders = this.orders.filter(order =>
      order.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      order.email.toLowerCase().includes(this.filterText.toLowerCase())
    );
    this.applySort();
  }

  applySort(): void {
    this.filteredOrders.sort((a, b) => {
      let valueA = a[this.sortField as keyof Order];
      let valueB = b[this.sortField as keyof Order];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      return 0;
    });
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }
}
