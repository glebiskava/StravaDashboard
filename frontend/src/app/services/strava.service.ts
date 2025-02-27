import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StravaService {
  private apiUrl = 'http://127.0.0.1:5000';
  public thunderforestApiKey: string = '';
  apiKeyLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadThunderforestApiKey(); 
  }

  public loadThunderforestApiKey(): void {
    this.http
      .get<{ apiKey: string }>(`${this.apiUrl}/api/thunderforest`)
      .subscribe({
        next: (response) => {
          if (response && response.apiKey) {
            this.thunderforestApiKey = response.apiKey;
            this.apiKeyLoaded.next(true);
            console.log(`Thunderforest API key loaded`);
          } else {
            console.error('Received empty Thunderforest API key response');
            this.apiKeyLoaded.next(false);
          }
        },
        error: (error) => {
          console.error('Failed to load Thunderforest API key:', error);
          this.apiKeyLoaded.next(false);
        },
        complete: () => {
          console.log('API key request completed.');
        },
      });
  }

  waitForApiKey(): Observable<boolean> {
    return this.apiKeyLoaded.asObservable();
  }

  getActivities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activities`);
  }

  getLocalActivities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activities/local`);
  }

  getPolyline(activityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity_polyline/${activityId}`);
  }

  getWeeklySummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/weekly`);
  }
}
