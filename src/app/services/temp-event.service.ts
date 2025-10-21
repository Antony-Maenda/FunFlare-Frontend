// src/app/services/temp-event.service.ts (New Service - Create this file)
import { Injectable } from '@angular/core';
import { EventCreate } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class TempEventService {
  private tempData: (EventCreate & { poster?: File; posterFilename?: string }) | null = null;

  setTempData(data: EventCreate, poster: File | null = null, posterFilename: string = ''): void {
    this.tempData = { ...data };
    if (poster) {
      this.tempData.poster = poster;
      this.tempData.posterFilename = posterFilename;
    }
  }

  getTempData(): (EventCreate & { poster?: File; posterFilename?: string }) | null {
    return this.tempData;
  }

  clearTempData(): void {
    this.tempData = null;
  }
}