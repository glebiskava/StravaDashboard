import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { WeeklySummaryComponent } from './components/weekly-summary/weekly-summary.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, ActivityListComponent, WeeklySummaryComponent]
})
export class AppComponent {}
