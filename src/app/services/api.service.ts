// ApiService: thin wrapper around HttpClient. Exposes get/post and a FormData uploader with optional progress events.
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // base API URL — adjust to your backend host/port if needed
  private baseUrl = 'https://localhost:7174/api';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  // postFormData: when reportProgress=true the observable emits HttpEvent for upload progress
  postFormData<T>(endpoint: string, formData: FormData, reportProgress = false): Observable<T | HttpEvent<T>> {
    if (reportProgress) {
      return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData, {
        reportProgress: true,
        observe: 'events'
      });
    }
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
  }
}
