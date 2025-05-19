import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  
  
  menuItems = [
    { route: '/produits', icon: 'fa-box', label: 'Produits' },
    { route: '/commande', icon: 'fa-shopping-cart', label: 'Commandes' },
    { route: '/utilisateurs', icon: 'fa-users', label: 'Utilisateurs' },

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
