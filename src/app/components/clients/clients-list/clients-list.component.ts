import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../../models/client.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
 // styleUrls: ['./clients-list.component.css']
})
export class ClientsListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClients();
  }
  //this.http.get<User[]>('https://railwayaapi-production.up.railway.app/admin/users')
  loadClients(): void {
    this.http.get<Client[]>(`${environment.apiUrl}/admin/clients`).subscribe({
      next: (data) => {
        this.clients = data;
        console.log(this.clients);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }
  
}
