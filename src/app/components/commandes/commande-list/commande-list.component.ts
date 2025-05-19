import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  searchTerm: string = '';
  statusFilter: string = '';
  dateFilter: string = '';
  currentPage = 1;
  itemsPerPage = 10;
  selectedCommande: Commande | null = null;
  selectedDeliveryUser: string | null = null;
  deliveryUsers: any[] = [];
  adresseComplete = '';
  statusColors = {
    'en attente': 'warning',
    'en cours': 'info',
    'terminée': 'success',
    'annulée': 'danger',
    'livrée': 'success'
  };

  constructor(private http: HttpClient) {
    this.loadDeliveryUsers();
  }

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadDeliveryUsers() {
    this.http.get<any[]>('https://2872714c-427f-45d7-86a5-48cfb2ec630d-00-1poko749ejplg.janeway.replit.dev/admin/users')
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

      this.http.post('https://2872714c-427f-45d7-86a5-48cfb2ec630d-00-1poko749ejplg.janeway.replit.dev/admin/assign-delivery', deliveryData)
        .subscribe(response => {
          // Mettre à jour le statut de la commande
          const modal = document.getElementById('assignDeliveryModal');
          if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
          }
          this.selectedCommande = null;
          this.selectedDeliveryUser = null;
          this.loadCommandes();
        });
    }
  }

  loadCommandes(): void {
    this.http.get<{ orders: Commande[] }>('https://2872714c-427f-45d7-86a5-48cfb2ec630d-00-1poko749ejplg.janeway.replit.dev/admin/orders')
      .subscribe(response => {
        this.commandes = response.orders;
      });
  }



  // Pagination
  get paginatedCommandes(): Commande[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.commandes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.commandes.length / this.itemsPerPage);
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }

  getStatusColor(status: string): string {
    const statusMap = {
      'en attente': 'warning',
      'en cours': 'info',
      'terminée': 'success',
      'annulée': 'danger',
      'livrée': 'success'
    };
    return statusMap[status.toLowerCase()] || 'default';
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
            <p><strong>Adresse :</strong> ${commande.client_address}</p>
            <p><strong>Mobile :</strong> ${commande.client_phone}</p>
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
  


  



}
