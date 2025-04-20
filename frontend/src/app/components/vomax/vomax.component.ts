import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-vomax',
  standalone: true,
  templateUrl: './vomax.component.html',
  styleUrl: './vomax.component.css',
  imports: [CommonModule, MatCardModule]
})
export class VomaxComponent implements OnInit {
  vo2maxData: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/vo2max').subscribe(data => {
      this.vo2maxData = data;
      console.log('VO2 Max:', data);
    });
  }
}
