import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { WeeklySummaryComponent } from './components/weekly-summary/weekly-summary.component';
import { MonthlySummaryComponent } from './monthly-summary/monthly-summary.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    ActivityListComponent,
    WeeklySummaryComponent,
    MonthlySummaryComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenav,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class AppComponent {
  isSidenavOpen = false;
}
