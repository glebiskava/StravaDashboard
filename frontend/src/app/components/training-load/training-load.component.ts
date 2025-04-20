import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivityService } from '../../services/activity.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-training-load',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatCardModule],
  templateUrl: './training-load.component.html',
  styleUrls: ['./training-load.component.css']
})
export class TrainingLoadComponent implements OnInit {
  chartData: any[] = [];

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.activityService.getTrainingLoad().subscribe({
      next: data => {
        console.log('Raw data from backend:', data); // Debugging line
        if (data && data.length > 0) {
          this.chartData = [{
            name: 'Training Load',
            series: data.map(item => {
              const date = formatDate(item.date, 'dd.MM.yyyy', 'en-US');
              const load = ((item.distance / 1000) * 6) * 2000; // assuming RPE = 6
              return {
                name: date,
                value: +load.toFixed(2)
              };
            })
          }];
          console.log('Processed chart data:', this.chartData); // Debugging line
        } else {
          this.chartData = [{
            name: 'Training Load',
            series: [{ name: 'No Data', value: 0 }]
          }]; // Handle empty data case
        }
      },
      error: error => {
        console.error('Error fetching training load data:', error); // Debugging line
        this.chartData = [{
          name: 'Training Load',
          series: [{ name: 'Error', value: 0 }]
        }]; // Handle error case
      }
    });
  }
}
