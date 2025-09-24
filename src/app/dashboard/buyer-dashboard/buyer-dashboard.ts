import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-buyer-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-dashboard.html',
  styleUrl: './buyer-dashboard.css'
   
})
export class BuyerDashboard {
  isMenuOpen = false;
  featuredEvents = [
    { name: 'Live Concert: The Beats', date: 'Sep 20, 2025', venue: 'Nairobi Arena', price: 2500, image: 'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=80' },
    { name: 'Championship Finals', date: 'Oct 5, 2025', venue: 'Kasarani Stadium', price: 1800, image: 'https://images.unsplash.com/photo-1600195077074-2e4b0a3c15a9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Food & Culture Festival', date: 'Nov 15, 2025', venue: 'Uhuru Gardens', price: 1200, image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=800&q=80' },
  ];
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }


  

  

}
