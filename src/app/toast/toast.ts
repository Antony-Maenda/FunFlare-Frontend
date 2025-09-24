import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css']
})
export class ToastComponent implements OnInit {
  message = '';
  visible = false;
  type: ToastType = 'info';

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe((toast) => {
      if (toast) {
        this.message = toast.message;
        this.type = toast.type;
        this.visible = true;
      } else {
        this.visible = false;
      }
    });
  }

  hide() {
    this.visible = false;
    this.toastService.clear();
  }
}
