import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // Reactive state
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userRole = new BehaviorSubject<string | null>(null);
  private userName = new BehaviorSubject<string>('Guest');

  // Public observables
  isLoggedIn$ = this.loggedIn.asObservable();
  userRole$ = this.userRole.asObservable();
  userName$ = this.userName.asObservable();

  constructor(private http: HttpClient) {
    this.restoreSession(); // ← RESTORE ON APP LOAD
  }

  register(user: User): Observable<any> {
    const endpoint = user.isOrganizer
      ? `${this.apiUrl}api/users/register/organizer`
      : `${this.apiUrl}api/users/register/attendee`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(endpoint, user, { headers });
  }

  login(user: User): Observable<any> {
    const endpoint = `${this.apiUrl}api/users/login`;
    return this.http.post<any>(endpoint, user).pipe(
      tap(response => {
        // ASSUMING BACKEND RETURNS: { token, role, name }
        const { token, role, name } = response;

        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', name || 'User');

        this.loggedIn.next(true);
        this.userRole.next(role);
        this.userName.next(name || 'User');
      })
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}api/users/verify-email?token=${token}`);
  }

  // CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getRole(): string | null {
    return this.userRole.value;
  }

  getUserName(): string {
    return this.userName.value;
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');

    this.loggedIn.next(false);
    this.userRole.next(null);
    this.userName.next('Guest');
  }

  // RESTORE SESSION FROM localStorage
  private restoreSession(): void {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (token && role) {
      this.loggedIn.next(true);
      this.userRole.next(role);
      this.userName.next(name || 'User');
    }
  }

  // GET AUTH HEADERS
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}