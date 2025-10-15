export interface EventCreate {
  name: string;
  description?: string;
  location: string;
  eventPosterUrl?: string;
  eventCapacity?: number;
  eventCategory?: string;
  eventStartDate: string; // Format: 'YYYY-MM-DD'
  eventEndDate: string; // Format: 'YYYY-MM-DD'
  eventStartTime: string; // Format: 'HH:mm'
  eventEndTime: string; // Format: 'HH:mm'
  eventPoster?: File; // For file upload, optional
}