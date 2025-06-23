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

interface CommandeCredit {
  created_at: string;
  cloture_date: string;
  total: string;
  credit_sur_commande: string;
  vendeur: string;
  livreur: string;
}

interface Commande {
  id: number;
  client_id: number;  // ID du client
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
  montantPaiement: number = 0;
  commentairePaiement: string = '';
  commandesCredit: any[] = [];  // Pour stocker les commandes avec crédit

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

  loadCommandesCredit(clientId: number): void {
    console.log("**************");
    console.log(clientId);
    console.log("**************");

    this.http.get<CommandeCredit[]>(`${environment.apiUrl}/admin/orders-with-credit/${clientId}`)
      .subscribe(response => {
        this.commandesCredit = response;
      });
  }

  sommeCredits(): number {
    return this.commandesCredit.reduce((total, cmd) => {
      return total + Number(cmd.credit_sur_commande);
    }, 0);
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
        Number(commande.credit_sur_commande) > 0
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

      this.http.post(`${environment.apiUrl}/admin/assign-delivery`, deliveryData)
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

  ouvrirModalReglement(commande: Commande): void {
    this.selectedCommande = commande;
    this.montantPaiement = 0;
    this.commentairePaiement = '';
  }

  reglerCredit(): void {
    if (this.montantPaiement > 0 && this.commentairePaiement.trim()) {
      const data = {
        montant: this.montantPaiement,
        commentaire: this.commentairePaiement
      };

      this.http.put(`${environment.apiUrl}/admin/reglement-credit/${this.selectedCommande.id}`, data)
        .subscribe({
          next: (response) => {
            // Réinitialiser les champs
            this.montantPaiement = 0;
            this.commentairePaiement = '';
            
            // Fermer la modale
            const modal = document.getElementById('reglementCreditModal');
            if (modal) {
              modal.classList.remove('show');
              modal.style.display = 'none';
            }
            
            // Recharger les commandes pour mettre à jour l'état
            this.loadCommandes();
            
            // Afficher un message de succès
            alert('Paiement enregistré avec succès !');
          },
          error: (error) => {
            alert('Erreur lors de l\'enregistrement du paiement : ' + error.message);
          }
        });
    } else {
        if (this.montantPaiement <= 0) {
        alert('Le montant doit être supérieur à 0');
      } else {
        alert('Le commentaire est obligatoire');
      }
    }
  }

validerPaiement(): void {
  const montant = parseFloat(this.montantPaiement.toFixed(2));
  const credit = parseFloat(Number(this.selectedCommande?.credit_sur_commande).toFixed(2));

  if (montant > 0 && montant <= credit + 0.01) {
    this.reglerCredit();
  } else {
    alert("Le montant doit être supérieur à 0 et ne pas dépasser le crédit restant (avec une tolérance de 1 centime).");
  }
}

async imprimerCommande(commande: any) {
  // Vérifier si la commande existe
  if (!commande) {
    alert('Aucune commande sélectionnée');
    return;
  }

  // Récupérer les commandes avec crédit
  const commandesCredit = await this.http.get<CommandeCredit[]>(`${environment.apiUrl}/admin/orders-with-credit/${commande.client_id}`).toPromise();

  // Générer le HTML complet
  const printContent = `
    <html>
    <head>
      <title>طلب رقم ${commande.id}</title>
      <style>
        body {
          font-family: 'Tahoma', 'Arial', sans-serif;
          font-size: 16px;
          color: #000;
          direction: rtl;
          text-align: right;
          padding: 20px;
          line-height: 1.6;
        }
        h2 {
          text-align: center;
          margin: 20px 0;
          font-family: 'Tahoma', 'Arial', sans-serif;
          font-size: 24px;
          font-weight: bold;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        h3 {
          text-align: center;
          margin: 20px 0;
          font-family: 'Tahoma', 'Arial', sans-serif;
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        p {
          margin: 10px 0;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-family: 'Tahoma', 'Arial', sans-serif;
          font-size: 16px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        th, td {
          border: 1px solid #000;
          padding: 12px;
          text-align: right;
          font-size: 16px;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .total-amount {
          font-size: 18px;
          font-weight: bold;
          color: #000;
        }
        .credit-amount {
          font-size: 18px;
          font-weight: bold;
          color: #dc3545;
        }
      </style>
    </head>
    <body>
      <h2>طلب رقم ${commande.id}</h2>

      <p>الزبون: ${commande.client_name}</p>
      <p>العنوان: ${commande.client_adresse}</p>
      <p>الهاتف: ${commande.client_mobile}</p>
      <p>الحالة: ${commande.status}</p>
      <p>تاريخ الإنشاء: ${new Date(commande.created_at).toLocaleString()}</p>
      <p>المجموع العام: ${commande.total}</p>
      <p>رقم البائع: ${commande.vendeur_phone}</p>

      <h3>تفاصيل المنتجات</h3>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الخصم</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${commande.items.map(item => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.quantity}</td>
              <td>${item.price}</td>
              <td>${item.remise}</td>
              <td>${item.total_ligne}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${commandesCredit.length > 0 ? `
        <!-- Commandes avec crédit -->
        <h3>سجل الطلبات مع الديون</h3>
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>التسليم</th>
              <th>المجموع</th>
              <th>الدين</th>
              <th>البائع</th>
              <th>السائق</th>
            </tr>
          </thead>
          <tbody>
            ${commandesCredit.map(cmd => `
              <tr>
                <td>${new Date(cmd.created_at).toLocaleDateString('ar-MA', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                <td>${new Date(cmd.cloture_date).toLocaleDateString('ar-MA', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                <td>${Number(cmd.total).toFixed(2)}</td>
                <td>${Number(cmd.credit_sur_commande).toFixed(2)}</td>
                <td>${cmd.vendeur}</td>
                <td>${cmd.livreur}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" class="text-end fw-bold">إجمالي الديون :</td>
              <td class="fw-bold">${commandesCredit.reduce((total, cmd) => total + Number(cmd.credit_sur_commande), 0).toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      ` : ''}
    </body>
    </html>
  `;

  // Ouvrir une nouvelle fenêtre pour l'impression
  const newWindow = window.open('', '_blank', 'width=600,height=800');
  if (newWindow) {
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  } else {
    alert('Impossible d\'ouvrir la fenêtre d\'impression');
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
