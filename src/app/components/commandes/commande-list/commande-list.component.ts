import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
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

  editCommande(commande: Commande): void {
    console.log('Editing commande:', commande);
    console.log('Commande items:', commande.items);
    // Navigate to the edit page with the commande data
    this.router.navigate(['/commande/edit'], {
      state: { commande: commande }
    });
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


annulerCommande(commande: any): void {
  const url = `${environment.apiUrl}/admin/cancel-order/${commande.id}`;
  
  this.http.put(url, {}).subscribe({
    next: (response) => {
      console.log('Commande annulée avec succès:', response);
      this.loadCommandes(); // Rafraîchir la liste des commandes
    },
    error: (error) => {
      console.error('Erreur lors de l\'annulation de la commande:', error);
    }
  });
}






async imprimerCommande(commande: any) {
  if (!commande) {
    alert('Aucune commande sélectionnée');
    return;
  }

  const commandesCredit = await this.http
    .get<CommandeCredit[]>(`${environment.apiUrl}/admin/orders-with-credit/${commande.client_id}`)
    .toPromise();

  const totalCredit = commandesCredit.reduce((total, cmd) => total + Number(cmd.credit_sur_commande), 0);
  const totalFinal = Number(commande.total) + totalCredit;
  const logoUrl = `${window.location.origin}/assets/launcher.png`;


  const printContent = `
    <html>
    <head>
      <title>فاتورة رقم ${commande.id}</title>
      <style>
        body {
  font-family: 'Arial', sans-serif;
  font-size: 11px;
  color: #000;
  direction: rtl;
  text-align: right;
  padding: 15px;
  background-color: #fff;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
  margin-bottom: 10px;
}
.logo {
  width: 80px;
  height: auto;
}
.company-info {
  font-size: 11px;
  line-height: 1.4;
  padding-right: 10px;
}
h2 {
  font-size: 16px;
  margin: 15px 0;
  text-align: center;
  border: 1px solid #000;
  padding: 6px;
  background-color: #f7f7f7;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #333;
  padding: 4px;
  text-align: center;
  font-size: 10px;
}
th {
  background-color: #eee;
  font-weight: bold;
}
.totals {
  font-weight: bold;
  background-color: #f0f0f0;
}
.footer-note {
  margin-top: 20px;
  font-size: 10px;
  border-top: 1px dashed #aaa;
  padding-top: 6px;
  color: #333;
}
.client-info {
  margin-top: 8px;
  line-height: 1.4;
  font-size: 11px;
}

      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" class="logo" alt="Logo"  class="logo" alt="Logo">
        <div class="company-info">
          <strong>fmw-market Company</strong><br>
          Avenue du 2 Mars<br>
          Quartier Bab Lamrissa, Salé 11005<br>
          Préfecture de Salé, Région Rabat-Salé-Kénitra<br>
          Tél: 0606070649
        </div>
      </div>

      <h2>فاتورة الطلب رقم ${commande.id}</h2>

      <div class="client-info">
        <p><strong>الزبون:</strong> ${commande.client_name}</p>
        <p><strong>العنوان:</strong> ${commande.client_adresse}</p>
        <p><strong>الهاتف:</strong> ${commande.client_mobile}</p>
        <p><strong>البائع:</strong> ${commande.vendeur_phone}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الخصم</th>
            <th>المجموع</th>
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

          <tr class="totals">
            <td colspan="4">إجمالي الطلب</td>
            <td>${commande.total}</td>
          </tr>
          <tr class="totals red">
            <td colspan="4">إجمالي الديون</td>
            <td>${totalCredit.toFixed(2)}</td>
          </tr>
          <tr class="totals">
            <td colspan="4">المجموع النهائي</td>
            <td>${totalFinal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-note">
        تم إصدار هذه الفاتورة بتاريخ اليوم. يرجى التسديد خلال 45 يومًا بعد التسليم.<br>
        <strong>العنوان:</strong><br>
        Avenue du 2 Mars<br>
        Quartier Bab Lamrissa, Salé 11005<br>
        Préfecture de Salé, Région Rabat-Salé-Kénitra<br>
        المغرب
      </div>
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank', 'width=800,height=1000');
  if (newWindow) {
    newWindow.document.write(printContent);
    newWindow.document.close();

    // Attendre que la nouvelle fenêtre soit prête
    newWindow.onload = () => {
      const logo = newWindow.document.querySelector('img');
      if (logo && !logo.complete) {
        logo.onload = () => {
          newWindow.focus();
          newWindow.print();
        };
      } else {
        newWindow.focus();
        newWindow.print();
      }
    };
  } else {
    alert('Impossible d\'ouvrir la fenêtre d\'impression');
  }
}

  









}
