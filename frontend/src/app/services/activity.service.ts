import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:5000'; // Flask backend

  constructor(private http: HttpClient) {}

  getLocalActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities/local`);
  }

  getNewestActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities`);
  }

  getActivityPolyline(activityId: number): Observable<{ polyline: string }> {
    return this.http.get<{ polyline: string }>(`${this.apiUrl}/activity_polyline/${activityId}`);
  }
}
