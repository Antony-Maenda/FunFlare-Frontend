import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { VerifyEmailComponent } from './verify-email/verify-email';
import { BuyerDashboard } from './dashboard/buyer-dashboard/buyer-dashboard';
import { OrganizerDashboardComponent } from './dashboard/organizer-dashboard/organizer-dashboard';
import { EventsComponent } from './Events/events';
import { OrdersComponent } from './orders/orders';
import { OrganizerDashboardHomeComponent } from './Home/home';
import { TicketsComponent } from './tickets/tickets';
import { FinanceComponent } from './finance/finance';
import { EventDetailsComponent } from './event-details/event-details';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'buyer-dashboard', component: BuyerDashboard },
  {
    path: 'organizer-dashboard',
    component: OrganizerDashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: OrganizerDashboardHomeComponent },
      { path: 'events', component: EventsComponent },
      { path: 'events/:id', component: EventDetailsComponent },
      { path: 'events/:id/edit', component: EventsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'finance', component: FinanceComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}