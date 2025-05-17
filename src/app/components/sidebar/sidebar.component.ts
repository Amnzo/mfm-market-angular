import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems = [
    { icon: 'fas fa-box', label: 'Produits', route: '/produits' },
    { icon: 'fas fa-shopping-cart', label: 'Commande', route: '/commande' },
    { icon: 'fas fa-users', label: 'Utilisateurs', route: '/utilisateurs' },
    { icon: 'fas fa-credit-card', label: 'Mode de paiement', route: '/paiement' }
  ];

  isMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
