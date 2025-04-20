import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-heart-rate-zones',
  standalone: true,
  templateUrl: './heart-rate-zones.component.html',
  styleUrls: ['./heart-rate-zones.component.css'],
  imports: [CommonModule, MatCardModule, NgxChartsModule],
})
export class HeartRateZonesComponent implements OnInit {
  zoneData: any[] = [];

  view: [number, number] = [500, 500];
  gradient = false;
  showLegend = true;
  showLabels = true;

  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.http.get<any[]>('http://localhost:5000/heartrate-zones').subscribe(data => {
      this.zoneData = data.map(d => ({
        name: d.name.split(' ')[0],  // 'Z1', 'Z2', etc.
        value: d.value
      }));
    });
  }
  
  
}
