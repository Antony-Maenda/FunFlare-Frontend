// src/app/Events/events.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService, EventCreate } from '../services/event.service';
import { TempEventService } from '../services/temp-event.service'; // Adjust path if needed

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private router: Router,
    private tempEventService: TempEventService
  ) {}

  // ✅ Form model structure
  formModel: EventCreate = {
    name: '',
    location: '',
    eventStartDate: '',
    eventEndDate: '',
    eventStartTime: '',
    eventEndTime: '',
    eventCapacity: 0,
    eventCategory: '',
    description: ''
  };

  poster: File | null = null;
  posterFilename: string = '';
  posterPreview: string | null = null;
  filterText: string = '';
  minDate: string = ''; // ✅ For date validation

  // ✅ Initialize minDate on load
  ngOnInit() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today.toISOString().split('T')[0];
  }

  // ✅ Handle file input and preview
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.poster = file;
      this.posterFilename = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.posterPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ Remove selected poster
  removePoster(): void {
    this.poster = null;
    this.posterFilename = '';
    this.posterPreview = null;
    const fileInput = document.getElementById('poster') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; // Reset input field
  }

  // ✅ Optional method for live validation or text filtering
  applyFilter(): void {
    console.log('Filter applied with text:', this.filterText);
    // Optional: add filtering logic if needed
  }

  // ✅ Handle form submission
  onSubmit(form: NgForm): void {
    if (!form.valid) {
      console.error('Form is invalid. Please check all required fields.');
      return;
    }

    const eventData: EventCreate = { ...this.formModel };

    const start = new Date(`${eventData.eventStartDate} ${eventData.eventStartTime}`);
    const end = new Date(`${eventData.eventEndDate} ${eventData.eventEndTime}`);

    if (start >= end) {
      console.error('End date and time must be after start date and time.');
      return;
    }

    if (eventData.eventCapacity && eventData.eventCapacity <= 0) {
      console.error('Capacity must be greater than zero.');
      return;
    }

    // ✅ Store event data temporarily in service (including poster File directly) and redirect to tickets
    this.tempEventService.setTempData(eventData, this.poster, this.posterFilename);
    this.router.navigate(['/organizer-dashboard/tickets']);

    // Reset form after storing
    form.resetForm();
    this.poster = null;
    this.posterFilename = '';
    this.posterPreview = null;
  }
}