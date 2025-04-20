import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { MonthlySummaryComponent } from './components/monthly-summary/monthly-summary.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { WeeklySummaryComponent } from './components/weekly-summary/weekly-summary.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'activities', component: ActivityListComponent },
  { path: 'monthly-summary', component: MonthlySummaryComponent },
  { path: 'weekly-summary', component: WeeklySummaryComponent },
  { path: 'user', component: UserProfileComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export { routes };
