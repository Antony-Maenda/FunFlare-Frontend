import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private apiUrl = 'http://localhost:8080/api/register';

  constructor(private http: HttpClient) {}

  register(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }
}

