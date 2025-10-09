import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LandingPage } from './landing-page/landing-page';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { VerifyEmailComponent } from './verify-email/verify-email';
import { BuyerDashboard } from './dashboard/buyer-dashboard/buyer-dashboard';
import { OrganizerDashboardComponent } from './dashboard/organizer-dashboard/organizer-dashboard';
import { EventsComponent } from './events/events';
import { OrdersComponent } from './orders/orders';

export const routes: Routes = [
     { path: '', component: LandingPage },
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent},
    { path: 'verify-email', component: VerifyEmailComponent },
    {path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'buyer-dashboard', component: BuyerDashboard },
    {
      path: 'organizer-dashboard',
      component: OrganizerDashboardComponent,
      children: [
        { path: 'events', component: EventsComponent },
        { path: 'orders', component: OrdersComponent },
      ]
  }
    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
