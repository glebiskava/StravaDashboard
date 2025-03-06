import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StravaService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities/local`);
  }

  getActivityPolyline(activityId: number): Observable<{ polyline: string }> {
    return this.http.get<{ polyline: string }>(`${this.apiUrl}/activity_polyline/${activityId}`);
  }

  getWeeklySummary(): Observable<{ total_distance: number, total_elevation: number, total_time: number }> {
    return this.http.get<{ total_distance: number, total_elevation: number, total_time: number }>(
      `${this.apiUrl}/summary/weekly`
    );
  }
}
