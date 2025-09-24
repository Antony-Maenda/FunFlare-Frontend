import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Attendee registration
  registerAttendee(attendee: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register/attendee`, attendee);
  }

  // ✅ Organizer registration
  registerOrganizer(organizer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register/organizer`, organizer);
  }

  // ✅ Admin registration
  registerAdmin(admin: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register/admin`, admin);
  }

  // ✅ Email verification
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-email?token=${token}`);
  }

  // ✅ Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }
}
