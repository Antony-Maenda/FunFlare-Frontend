import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageSource = new BehaviorSubject<{ message: string; type: ToastType } | null>(null);
  toast$ = this.messageSource.asObservable();

  show(message: string, type: ToastType = 'info') {
    this.messageSource.next({ message, type });
    setTimeout(() => this.clear(), 3000); // auto-hide after 3s
  }

  clear() {
    this.messageSource.next(null);
  }
}
