import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Paiement {
  paiement_id: number;
  montant: string;
  date_paiement: string;
  mode_paiement: string;
}

interface CommandeItem {
  item_id: number;
  quantity: number;
  price: string;
  remise: string;
  total_ligne: string;
  product_id: number;
  product_name: string;
}



interface Commande {
  id: number;
  client_name: string;
  client_mobile: string;
  client_adresse: string;
  client_gps: string;
  total: string;
  status: string;
  created_at: string;
  cloture_date: string | null;
  credit_sur_commande: string | null;
  creator_name: string;
  delivery_name: string | null;
  items: CommandeItem[];
  paiements: Paiement[];
}



@Component({
  selector: 'app-commande-list',
  templateUrl: './commande-list.component.html'
})
export class CommandeListComponent implements OnInit {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  dateFilter: string = '';
  creditFilter: boolean = false;
  currentPage = 1;
  itemsPerPage = 10;
  selectedCommande: Commande | null = null;
  selectedDeliveryUser: string | null = null;
  deliveryUsers: any[] = [];
  adresseComplete = '';


  constructor(private http: HttpClient) {
    this.loadDeliveryUsers();
  }

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.http.get<{ orders: Commande[] }>(`${environment.apiUrl}/admin/orders`)
      .subscribe(response => {
        this.commandes = response.orders;
        this.filteredCommandes = [...this.commandes];
      });
  }

  applyFilters(): void {
    let filtered = [...this.commandes];

    // Filtrer par statut
    if (this.statusFilter) {
      filtered = filtered.filter(commande => 
        commande.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    // Filtrer par date
    if (this.dateFilter) {
      filtered = filtered.filter(commande => {
        const commandeDate = new Date(commande.created_at);
        const filterDate = new Date(this.dateFilter);
        return commandeDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filtrer par crédit
    if (this.creditFilter) {
      filtered = filtered.filter(commande => 
        commande.credit_sur_commande !== null && commande.credit_sur_commande !== ''
      );
    }

    // Filtrer par nom de client
    if (this.searchTerm) {
      filtered = filtered.filter(commande => 
        commande.client_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredCommandes = filtered;
  }

  loadDeliveryUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`)
      .subscribe(response => {
        console.log(response);
        this.deliveryUsers = response.filter(user => user.user_level === 'livreur'); // Filtrer par level = 1 pour les livreurs
      });
  }

  assignDelivery() {
    if (this.selectedCommande && this.selectedDeliveryUser) {
      const deliveryData = {
        order_id: this.selectedCommande.id,
        delivery_id: this.selectedDeliveryUser
      };

      this.http.post(`${environment.apiUrl}admin/assign-delivery`, deliveryData)
        .subscribe(response => {
          // Mettre à jour le statut de la commande
          const modal = document.getElementById('assignDeliveryModal');
          if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
          }
          window.location.reload();
        });
    }
  }

  // Pagination
  get paginatedCommandes(): Commande[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCommandes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.commandes.length / this.itemsPerPage);
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }


  imprimerCommande(commande: any) {
    let itemsHTML = '';
    commande.items.forEach(item => {
      itemsHTML += `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>${item.price} MAD</td>
          <td>${item.remise} %</td>
          <td>${item.total_ligne} MAD</td>
        </tr>
      `;
    });
  
    let paiementsHTML = '';
    commande.paiements.forEach(paiement => {
      paiementsHTML += `
        <tr>
          <td>${new Date(paiement.date_paiement).toLocaleDateString()}</td>
          <td>${paiement.montant} MAD</td>
          <td>${paiement.mode_paiement}</td>
        </tr>
      `;
    });
  
    const printContent = `
      <html>
      <head>
        <title>Impression commande #${commande.id}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <style>
          body { padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          h2, h3 { text-align: center; margin-bottom: 20px; }
          .table thead th { background-color: #0d6efd; color: white; }
          .info-section p { font-size: 1rem; margin: 0.3rem 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="mb-4">Détails de la commande #${commande.id}</h2>
  
          <div class="info-section mb-4">
            <p><strong>Client :</strong> ${commande.client_name}</p>
            <p><strong>Adresse :</strong> ${commande.client_adresse}</p>
            <p><strong>Mobile :</strong> ${commande.client_mobile}</p>
            <p><strong>Status :</strong> <span class="badge bg-success">${commande.status}</span></p>
            <p><strong>Date création :</strong> ${new Date(commande.created_at).toLocaleString()}</p>
            <p><strong>Total :</strong> <span class="fw-bold">${commande.total} MAD</span></p>
          </div>
  
          <h3>Produits</h3>
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Remise (%)</th>
                <th>Total ligne</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
  
          <h3>Paiements</h3>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Mode de paiement</th>
              </tr>
            </thead>
            <tbody>
              ${paiementsHTML}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  
    const newWindow = window.open('', '_blank', 'width=900,height=700');
    if (newWindow) {
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    }
  }
  


  annulerCommande(commande: any): void {
    const url = `/admin/cancel-order/${commande.id}`;
    
    this.http.put(url, {}).subscribe({
      next: (response) => {
        console.log('Commande annulée avec succès:', response);
        // Rafraîchir la liste des commandes pour voir le nouveau statut
        this.loadCommandes();
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation de la commande:', error);
        // Afficher un message d'erreur à l'utilisateur si besoin
      }
    });
  }
  



}
