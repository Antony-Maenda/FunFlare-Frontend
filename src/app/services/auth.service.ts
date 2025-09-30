import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = Environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    const endpoint = user.isOrganizer
    ? '${this.apiUrl}api/users/register/organizer'
    : '${this.apiUrl}api/users/register/attendee';
    return this.http.post(endpoint, user);
  }

  login(user: User): Observable<any> {
    const endpoint = user.isOrganizer
    ? '${this.apiUrl}api/users/login/organizer'
    : '${this.apiUrl}api/users/login/attendee';
    return this.http.post(endpoint, user);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-email?token=${token}`);
  }
}