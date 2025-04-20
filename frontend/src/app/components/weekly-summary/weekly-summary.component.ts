import { Component, OnInit } from '@angular/core';
import { StravaService } from '../../services/strava.service';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatCardContent } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-weekly-summary',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardContent, MatCardTitle],
  templateUrl: './weekly-summary.component.html',
  styleUrls: ['./weekly-summary.component.css']
})
export class WeeklySummaryComponent implements OnInit {
  totalDistance: number = 0;
  totalElevation: number = 0;
  totalTime: number = 0;

  constructor(private stravaService: StravaService) {}

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary(): void {
    this.stravaService.getWeeklySummary().subscribe({
      next: (data) => {
        console.log("Weekly summary response:", data);
        this.totalDistance = data.total_distance;
        this.totalElevation = data.total_elevation;
        this.totalTime = data.total_time;
      },
      error: (err) => {
        console.error('Error fetching weekly summary:', err);
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return hours > 0
      ? `${hours}h ${remainingMinutes.toString().padStart(2, "0")}min`
      : `${minutes}min`;
  }
}
