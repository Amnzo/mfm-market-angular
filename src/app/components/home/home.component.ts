import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  menuItems = [
    { route: '/produits', icon: 'fa-box', label: 'Produits' },
    { route: '/commande', icon: 'fa-shopping-cart', label: 'Commandes' },
    { route: '/utilisateurs', icon: 'fa-users', label: 'Utilisateurs' },
    { route: '/paiement', icon: 'fa-credit-card', label: 'Paiements' }
  ];

  showMenu = false;

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.showMenu = false;
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

}
