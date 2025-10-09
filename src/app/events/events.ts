import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

interface EventData {
  eventName: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  category: string;
  description: string;
  poster: File | null;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent {
  constructor(private http: HttpClient) {}

  formModel: EventData = {
    eventName: '',
    location: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    capacity: 0,
    category: '',
    description: '',
    poster: null
  };

  posterPreview: string | null = null;
  filterText: string = ''; // Optional filter field for consistency

  // ✅ Handle file input and preview
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.formModel.poster = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.posterPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ Remove selected poster
  removePoster(): void {
    this.formModel.poster = null;
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

    const eventData = { ...this.formModel };

    const start = new Date(`${eventData.startDate} ${eventData.startTime}`);
    const end = new Date(`${eventData.endDate} ${eventData.endTime}`);

    if (start >= end) {
      console.error('End date and time must be after start date and time.');
      return;
    }

    if (eventData.capacity <= 0) {
      console.error('Capacity must be greater than zero.');
      return;
    }

    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key !== 'poster' && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (eventData.poster) {
      formData.append('poster', eventData.poster, eventData.poster.name);
    }

    // ✅ Post to API with error handling
    this.http.post('https://api.example.com/events', formData, { responseType: 'json' })
      .pipe(
        catchError(error => {
          console.error('Submission failed:', error);
          return throwError(() => new Error('Failed to create event. Please try again.'));
        })
      )
      .subscribe({
        next: response => {
          console.log('Event created successfully:', response);
          form.resetForm();
          this.posterPreview = null;
          alert('Event created successfully!');
        },
        error: error => {
          console.error('Error during submission:', error);
          alert('Failed to create event. Please try again.');
        }
      });
  }
}
