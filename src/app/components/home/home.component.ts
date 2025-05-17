import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-content">
      <div class="welcome-section">
        <h1>Welcome to MFM Market Dashboard</h1>
        <p class="subtitle">Welcome back, salmi!</p>
        <div class="quick-stats">
          <div class="stat-card" (click)="navigateTo('/produits')">
            <i class="fas fa-box"></i>
            <h3>Produits</h3>
            <p>Manage your products</p>
          </div>
          <div class="stat-card" (click)="navigateTo('/commande')">
            <i class="fas fa-shopping-cart"></i>
            <h3>Commandes</h3>
            <p>View recent orders</p>
          </div>
          <div class="stat-card" (click)="navigateTo('/utilisateurs')">
            <i class="fas fa-users"></i>
            <h3>Utilisateurs</h3>
            <p>Manage users</p>
          </div>
          <div class="stat-card" (click)="navigateTo('/paiement')">
            <i class="fas fa-credit-card"></i>
            <h3>Paiements</h3>
            <p>Payment methods</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
