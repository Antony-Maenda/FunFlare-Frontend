import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LandingPage } from './landing-page/landing-page';
import { LoginComponent } from './auth/login/login';
import { BuyerDashboard } from './dashboard/buyer-dashboard/buyer-dashboard';
import { RegisterComponent } from './auth/register/register';
import { VerifyEmailComponent } from './verify-email/verify-email';


export const routes: Routes = [
     { path: '', component: LandingPage },
    { path: 'login', component: LoginComponent },
    {path: 'buyer-dashboard', component: BuyerDashboard},
    {path: 'register', component: RegisterComponent},
    { path: 'verify-email', component: VerifyEmailComponent },
    {path: '', redirectTo: 'login', pathMatch: 'full' }
    
    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
