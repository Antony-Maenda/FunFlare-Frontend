// src/app/components/purchase/purchase.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase.html',
  styleUrls: ['./purchase.css']
})
export class PurchaseComponent {
  @Input() subtotal = 0;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{
    name: string;
    email: string;
    phone: string;
  }>();

  buyerName = '';
  buyerEmail = '';
  buyerPhone = '';

  onSubmit(form: any): void {
    if (form.valid) {
      this.submit.emit({
        name: this.buyerName,
        email: this.buyerEmail,
        phone: this.buyerPhone
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}