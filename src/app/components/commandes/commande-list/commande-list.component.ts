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
  searchTerm = '';
  statusFilter = '';
  dateFilter = '';
  currentPage = 1;
  itemsPerPage = 10;
  selectedCommande: any = null;
  adresseComplete: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadCommandes();
  }



  loadCommandes(): void {
    this.http.get<{ orders: Commande[] }>('/admin/orders')
      .subscribe(response => {
        this.commandes = response.orders;
      });
  }

  get filteredCommandes(): Commande[] {
    let filtered = [...this.commandes];

    // Filtrer par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cmd => 
        cmd.id.toString().includes(term) ||
        cmd.client_name.toLowerCase().includes(term)
      );
    }

    // Filtrer par statut
    if (this.statusFilter) {
      filtered = filtered.filter(cmd => cmd.status === this.statusFilter);
    }

    // Filtrer par date
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(cmd => {
        const cmdDate = new Date(cmd.created_at);
        return cmdDate.toDateString() === filterDate.toDateString();
      });
    }

    // Pagination
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
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


  



}
