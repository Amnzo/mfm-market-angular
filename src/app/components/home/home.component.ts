import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  stats: any = {};
  totalChiffreMoisCourant: number = 0;
  baseUrl: string = environment.apiUrl;
  bord_url: string = this.baseUrl + '/admin/dashboard';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(this.bord_url).subscribe({
      next: (data) => {
        this.stats = data;

        // ✅ Calcul du chiffre d'affaires total du mois courant
        if (data?.vendeurs?.length) {
          this.totalChiffreMoisCourant = data.vendeurs.reduce(
            (somme: number, vendeur: any) => somme + (vendeur.chiffre_mois_courant || 0),
            0
          );
        }

        console.log('Dashboard stats:', data);
        console.log('Total mois courant:', this.totalChiffreMoisCourant);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du dashboard', err);
      }
    });
  }
}
