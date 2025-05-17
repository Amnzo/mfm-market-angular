import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  totalCommandes = 0;
  chiffreAffaire = 0;
  totalProduits = 0;
  totalUtilisateurs = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Données simulées (exemple)
    this.totalCommandes = 152;
    this.chiffreAffaire = 98450.75;
    this.totalProduits = 87;
    this.totalUtilisateurs = 34;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
