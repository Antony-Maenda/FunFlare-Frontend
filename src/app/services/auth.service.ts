import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';  // Add HttpHeaders if needed
import { Observable } from 'rxjs';
import { User } from '../models/user';  // Ensure this matches your form
import { environment } from '../../environment/environment';  // Note: path might be '../../environments/' depending on folder

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;  // 'http://localhost:8080/'

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    const endpoint = user.isOrganizer
      ? `${this.apiUrl}api/users/register/organizer`
      : `${this.apiUrl}api/users/register/attendee`;
    console.log('Register endpoint:', endpoint);
    console.log('User data:', { ...user, password: '[HIDDEN]' });  // Sanitized log
    
    // Optional: Add headers if backend requires
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(endpoint, user, { headers });
  }

  login(user: User): Observable<any> {
  const endpoint = `${this.apiUrl}api/users/login`;  // Single endpoint for both roles
  return this.http.post(endpoint, user);
}

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}api/users/verify-email?token=${token}`);
  }
}