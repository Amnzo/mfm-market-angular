import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';

interface CommandeItem {
  item_id: number;
  quantity: number | string;
  price: number | string;
  remise: number | string;
  total_ligne: number | string;
  product_id: number;
  product_name: string;
  is_new?: boolean;
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
  items_total: number;
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
  newProduct: string = '';
  newQuantity: number = 1;
  newPrice: number = 0;
  newRemise: number = 0;

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
  }

  ngOnInit(): void {
    // Get the commande data from history state
    const state = window.history.state;
    console.log('History state:', state);
    
    if (state && state.commande) {
      console.log('Received commande data:', state.commande);
      this.commande = state.commande;
      console.log('Commande items:', this.commande.items);
      
      // Vérifier que les items existent et sont un tableau
      if (this.commande.items && Array.isArray(this.commande.items)) {
        console.log('Items trouvés:', this.commande.items.length);
        this.initializeForm();
      } else {
        console.log('Aucun item trouvé ou items n\'est pas un tableau');
        this.commande.items = []; // Initialiser un tableau vide
        this.initializeForm();
      }
    } else {
      console.log('No state data found, checking route params');
      // If no state data, try to load from route params
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        console.log('Loading commande with ID:', id);
        this.loadCommande(id);
      } else {
        this.loading = false;
      }
    }
  }

  private initializeForm(): void {
    if (this.commande) {
      this.commandeForm.patchValue({
        client_name: this.commande.client_name,
        client_mobile: this.commande.client_mobile,
        client_adresse: this.commande.client_adresse
      });
      
      // Initialize items and calculate their totals
      if (this.commande.items && Array.isArray(this.commande.items)) {
        console.log('Initializing items:', this.commande.items);
        this.commande.items.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          // S'assurer que les propriétés sont correctement typées
          item.total_ligne = this.calculateItemTotal(item.price, item.quantity, item.remise);
        });
        
        // Calculate total for all items
        this.calculateTotal();
        console.log('Items après initialisation:', this.commande.items);
      }
      
      this.loading = false;
    }
  }

  // AJOUTER CETTE MÉTHODE MANQUANTE
  trackByItemId(index: number, item: CommandeItem): number {
    return item.item_id;
  }

  // Calculate total for all items
  private calculateTotal(): void {
    if (!this.commande || !this.commande.items) return;
    
    this.commande.items_total = this.commande.items.reduce((total: number, item: CommandeItem) => {
      const prix = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const remiseValue = typeof item.remise === 'string' ? parseFloat(item.remise) : item.remise;
      const quantite = typeof item.quantity === 'string' ? parseInt(item.quantity.toString()) : item.quantity;
      
      const totalItem = (prix * quantite) - remiseValue;
      return total + totalItem;
    }, 0);
  }

  // Calculate total for a specific item
  private calculateItemTotal(price: number | string, quantity: number | string, remise: number | string): number {
    const prix = typeof price === 'string' ? parseFloat(price) : price;
    const quantite = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    const remiseValue = typeof remise === 'string' ? parseFloat(remise) : remise;
    
    return (prix * quantite) - remiseValue;
  }

  // Reset new item form
  private resetNewItemForm(): void {
    this.newProduct = '';
    this.newQuantity = 1;
    this.newPrice = 0;
    this.newRemise = 0;
  }

  addNewItem(): void {
    if (!this.commande) return;
    
    // Initialiser le tableau items s'il n'existe pas
    if (!this.commande.items) {
      this.commande.items = [];
    }
    
    if (!this.newProduct || this.newQuantity <= 0 || this.newPrice <= 0) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    const newId = Math.max(0, ...this.commande.items.map(i => i.item_id)) + 1;
    const newItem: CommandeItem = {
      item_id: newId,
      product_id: 0, // Will be set by backend
      quantity: this.newQuantity.toString(),
      price: this.newPrice.toString(),
      remise: this.newRemise.toString(),
      total_ligne: this.calculateItemTotal(this.newPrice.toString(), this.newQuantity.toString(), this.newRemise.toString()).toString(),
      product_name: this.newProduct,
      is_new: true
    };

    this.commande.items.push(newItem);
    this.calculateTotal();
    this.resetNewItemForm();
  }

  // Remove item
  removeItem(item: CommandeItem): void {
    if (!this.commande || !this.commande.items) return;
    const index = this.commande.items.indexOf(item);
    if (index > -1) {
      this.commande.items.splice(index, 1);
      this.calculateTotal();
    }
  }

  // Save commande
  saveCommande(): void {
    if (!this.commande) {
      console.log('Aucune commande à sauvegarder');
      return;
    }
  
    const data = {
      user_id: 1, // À remplacer par l'ID de l'utilisateur actuel
      client_id: this.commande.client_id,
      client_name: this.commandeForm.value.client_name,
      client_mobile: this.commandeForm.value.client_mobile,
      client_adresse: this.commandeForm.value.client_adresse,
      client_gps: this.commande.client_gps,
      date_order: new Date().toISOString(),
      items: this.commande.items.map(item => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity.toString()),
        price: parseFloat(item.price.toString()),
        discount: parseFloat(item.remise.toString())
      })),
      total: this.commande.items_total
    };
  
    this.http.put(`${environment.apiUrl}/admin/edit_order/${this.commande.id}`, data)
      .subscribe({
        next: (response) => {
          console.log('Commande mise à jour avec succès:', response);
          // Redirection ou autre action
        },
        error: (error) => {
          console.error('Erreur:', error);
          // Gestion de l'erreur
        }
      });
  }

  // Update item quantity
  updateItemQuantity(item: CommandeItem, newQuantity: number): void {
    if (!this.commande) return;
    
    item.quantity = newQuantity.toString();
    item.total_ligne = this.calculateItemTotal(item.price, item.quantity, item.remise).toString();
    this.calculateTotal();
  }

  // Update item remise
  updateItemRemise(item: CommandeItem, newRemise: number): void {
    if (!this.commande) return;
    
    item.remise = newRemise.toString();
    item.total_ligne = this.calculateItemTotal(item.price, item.quantity, item.remise).toString();
    this.calculateTotal();
  }

  loadCommande(id: string): void {
    this.http.get<Commande>(`${environment.apiUrl}/admin/orders/${id}`)
      .subscribe({
        next: (response) => {
          console.log('Commande chargée depuis API:', response);
          this.commande = response;
          
          // Vérifier que les items existent
          if (!this.commande.items) {
            this.commande.items = [];
          }
          
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

    // Prepare items data
    const itemsData = this.commande.items?.map(item => ({
      item_id: item.item_id,
      quantity: item.quantity,
      remise: item.remise,
      total_ligne: item.total_ligne
    })) || [];

    const data = {
      client_name: this.commandeForm.value.client_name,
      client_mobile: this.commandeForm.value.client_mobile,
      client_adresse: this.commandeForm.value.client_adresse,
      items: itemsData
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