// app.routes.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { VerifyEmailComponent } from './verify-email/verify-email';
import { BuyerDashboard } from './dashboard/buyer-dashboard/buyer-dashboard';
import { OrganizerDashboardComponent } from './dashboard/organizer-dashboard/organizer-dashboard';
import { EventsComponent } from './Events/events';
import { TicketOrdersComponent } from './ticket-orders/ticket-orders';
import { MyEventsComponent } from './my-events/my-events';
import { TicketsComponent } from './tickets/tickets';
import { FinanceComponent } from './finance/finance';
import { EventDetailsComponent } from './event-details/event-details';
import { PurchaseComponent } from './purchase/purchase'; // ← CORRECT
import { GetTicketComponent } from './get-ticket/get-ticket';



export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'purchase', component: PurchaseComponent },
  { path: 'buyer-dashboard', component: BuyerDashboard },
  {
    path: 'organizer-dashboard',
    component: OrganizerDashboardComponent,
    children: [
      { path: '', redirectTo: 'my-events', pathMatch: 'full' },
      { path: 'my-events', component: MyEventsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'events/:id', component: EventDetailsComponent },
      { path: 'events/:id/edit', component: EventsComponent },
      { path: 'ticket-orders', component: TicketOrdersComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'finance', component: FinanceComponent },
      
    ]
  },

  { path: 'get-ticket/:id', component: GetTicketComponent },
  { path: 'purchases', component: PurchaseComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}