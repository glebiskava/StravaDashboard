import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClient } from '@angular/common/http';
import { MatCard } from '@angular/material/card';
import { MatCardContent } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';


@Component({
  selector: 'app-monthly-summary',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatCard, MatCardContent, MatCardTitle],
  templateUrl: './monthly-summary.component.html',
  styleUrl: './monthly-summary.component.css'
})

export class MonthlySummaryComponent implements OnInit {
  summaryData: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:5000/summary/monthly-type').subscribe(data => {
      this.summaryData = data.map(item => ({
        name: item.sport_type,
        value: item.distance_km
      }));
    });
  }
}
