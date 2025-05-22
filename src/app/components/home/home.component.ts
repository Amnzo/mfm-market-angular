import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  stats: any = {};
  baseUrl: string = 'https://2872714c-427f-45d7-86a5-48cfb2ec630d-00-1poko749ejplg.janeway.replit.dev';
  bord_url: string = this.baseUrl + '/admin/dashboard';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(this.bord_url).subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Dashboard stats:', data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du dashboard', err);
      }
    });
  }
}
