import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LandingPageNavbar } from './navbar/landing-page-navbar/landing-page-navbar';
import { BuyerNavbar } from './navbar/buyer-navbar/buyer-navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule, LandingPageNavbar, BuyerNavbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  
})
export class App {
  protected readonly title = signal('fun-flare');
  showLandingNavbar = true;  // Set this to your desired default value
  showBuyerNavbar: boolean = false;  // Add the missing property used by the template
}

