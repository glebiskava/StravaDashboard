import { Component } from '@angular/core';

import { WeeklySummaryComponent } from '../weekly-summary/weekly-summary.component';
import { MonthlySummaryComponent } from '../monthly-summary/monthly-summary.component';
import { TrainingLoadComponent } from '../training-load/training-load.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [WeeklySummaryComponent, MonthlySummaryComponent, TrainingLoadComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
