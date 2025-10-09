// events.ts
import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService, EventCreate } from '../services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent {
  constructor(private eventService: EventService) {}

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
  posterPreview: string | null = null;
  filterText: string = ''; // Optional filter field for consistency

  // ✅ Handle file input and preview
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.poster = file;

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
    this.posterPreview = null;
    const fileInput = document.getElementById('poster') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; // Reset input field
  }

  // ✅ Optional method for live validation or text filtering
  applyFilter(): void {
    console.log('Filter applied with text:', this.filterText);
    // You could add filtering logic here if displaying event lists
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

    // ✅ Use service to create event
    this.eventService.createEvent(eventData, this.poster ?? undefined)
      .subscribe({
        next: response => {
          console.log('Event created successfully:', response);
          form.resetForm();
          this.poster = null;
          this.posterPreview = null;
          alert('Event created successfully!');
        },
        error: error => {
          console.error('Error during submission:', error);
          alert(error.message || 'Failed to create event. Please try again.');
        }
      });
  }
}