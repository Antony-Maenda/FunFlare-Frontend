import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Wallet {
  netEarnings: number;
  amountWithdrawn: number;
  currentBalance: number;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance.html',
  styleUrls: ['./finance.css']
})
export class FinanceComponent implements OnInit {
  wallet: Wallet = {
    netEarnings: 1500.75,
    amountWithdrawn: 500.25,
    currentBalance: 1000.50
  };
  error: string = '';

  ngOnInit() {
    this.updateBalance();
  }

  private parseNumber(value: any): number {
    return isNaN(value) || value === null || value === '' ? 0 : Number(value);
  }

  updateBalance(): void {
    this.wallet.currentBalance = this.wallet.netEarnings - this.wallet.amountWithdrawn;
    if (this.wallet.currentBalance < 0) {
      this.error = 'Balance cannot be negative. Please adjust earnings or withdrawals.';
      this.wallet.currentBalance = 0;
    } else {
      this.error = '';
    }
  }

  onWithdraw(amountValue: any): void {
    const amount = this.parseNumber(amountValue);

    if (amount <= 0) {
      this.error = 'Withdrawal amount must be positive.';
      return;
    }
    if (amount > this.wallet.currentBalance) {
      this.error = 'Insufficient balance for withdrawal.';
      return;
    }

    this.wallet.amountWithdrawn += amount;
    this.updateBalance();
    this.error = '';
  }

  addEarnings(amount: number): void {
    if (amount <= 0) {
      this.error = 'Earnings amount must be positive.';
      return;
    }
    this.wallet.netEarnings += amount;
    this.updateBalance();
  }
}
