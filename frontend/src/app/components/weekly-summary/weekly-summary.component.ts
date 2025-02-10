import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StravaService } from '../../services/strava.service';

@Component({
  selector: 'app-weekly-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-summary.component.html',
  styleUrls: ['./weekly-summary.component.css']
})
export class WeeklySummaryComponent implements OnInit {
  summary: any = { total_distance: 0, total_elevation: 0, total_time: 0 };

  constructor(private stravaService: StravaService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.stravaService.getWeeklySummary().subscribe((data) => {
      this.summary = data;
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h${remainingMinutes.toString().padStart(2, "0")}min`;
    }
    return `${minutes}min`;
  }
}
