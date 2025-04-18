import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { MonthlySummaryComponent } from './monthly-summary/monthly-summary.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'activities', pathMatch: 'full' }, // ✅ Correct
  { path: 'activities', component: ActivityListComponent },   // ✅ Correct
  { path: 'monthly-summary', component: MonthlySummaryComponent },
  { path: 'user', component: UserProfileComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export { routes };
