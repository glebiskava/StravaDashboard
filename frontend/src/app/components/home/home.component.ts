import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklySummaryComponent } from '../weekly-summary/weekly-summary.component';
import { TrainingLoadComponent } from '../training-load/training-load.component';
import { MonthlySummaryComponent } from '../monthly-summary/monthly-summary.component';
import { VomaxComponent } from '../vomax/vomax.component';
import { HeartRateZonesComponent } from '../heart-rate-zones/heart-rate-zones.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    WeeklySummaryComponent,
    TrainingLoadComponent,
    MonthlySummaryComponent,
    VomaxComponent,
    HeartRateZonesComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
