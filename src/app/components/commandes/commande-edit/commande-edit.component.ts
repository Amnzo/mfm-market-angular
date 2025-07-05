import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface CommandeItem {
  item_id: number;
  quantity: number;
  price: string;
  remise: string;
  total_ligne: string;
  product_id: number;
  product_name: string;
}

interface Paiement {
  // Add properties for Paiement interface if needed
}

interface Commande {
  id: number;
  client_id: number;
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
  selector: 'app-commande-edit',
  templateUrl: './commande-edit.component.html',
  styleUrls: ['./commande-edit.component.scss']
})
export class CommandeEditComponent implements OnInit {
  commande: Commande | null = null;
  commandeForm: FormGroup;
  loading = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.commandeForm = this.fb.group({
      client_name: ['', Validators.required],
      client_mobile: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      client_adresse: ['', Validators.required]
    });

    // Get the commande data from history state
    const state = history.state;
    if (state && state.commande) {
      this.commande = state.commande;
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.commande) {
      this.commandeForm.patchValue({
        client_name: this.commande.client_name,
        client_mobile: this.commande.client_mobile,
        client_adresse: this.commande.client_adresse
      });
      this.loading = false;
    }
  }

  ngOnInit(): void {
    // No need to load data from API since we have it from the state
  }

  loadCommande(id: string): void {
    this.http.get<Commande>(`${environment.apiUrl}/admin/orders/${id}`)
      .subscribe({
        next: (response) => {
          this.commande = response;
          this.initializeForm();
        },
        error: (error) => {
          console.error('Error loading commande:', error);
          this.loading = false;
          this.error = 'Erreur lors du chargement de la commande';
        }
      });
  }

  updateCommande(): void {
    if (!this.commande) return;

    const data = {
      client_name: this.commandeForm.value.client_name,
      client_mobile: this.commandeForm.value.client_mobile,
      client_adresse: this.commandeForm.value.client_adresse
    };

    this.http.put(`${environment.apiUrl}/admin/orders/${this.commande.id}`, data)
      .subscribe({
        next: (response) => {
          alert('Commande mise à jour avec succès!');
          window.history.back();
        },
        error: (error) => {
          console.error('Error updating commande:', error);
          this.error = 'Erreur lors de la mise à jour de la commande';
        }
      });
  }
}
