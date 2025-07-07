import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ProductsService, Product } from '../../../services/products.service';

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
  addItemForm: FormGroup;
  loading = true;
  error: string = '';
  products: Product[] = [];
  loadingProducts = false;
  selectedProduct: Product | null = null; // Produit sélectionné

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private productsService: ProductsService
  ) {
    // Initialiser les formulaires avec des valeurs par défaut
    this.commandeForm = this.fb.group({
      client_name: ['', Validators.required],
      client_mobile: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      client_adresse: ['', Validators.required]
    });
    
    this.addItemForm = this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      remise: [0, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    // Charger les produits au démarrage
    this.loadProducts();

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

  loadProducts(): void {
    this.loadingProducts = true;
    this.productsService.getProducts().subscribe({
      next: (products) => {
        console.log('Produits reçus de l\'API:', products);
        if (products && Array.isArray(products)) {
          this.products = products;
          console.log('Nombre de produits chargés:', this.products.length);
        } else {
          console.error('Les données produits ne sont pas valides:', products);
          this.products = [];
        }
        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.loadingProducts = false;
      }
    });
  }

  onProductChange(event: any): void {
    const selectedProductId = parseInt(event.target.value);
    console.log('Produit sélectionné ID:', selectedProductId);
    
    if (selectedProductId) {
      this.selectedProduct = this.products.find(p => p.id === selectedProductId) || null;
      console.log('Produit sélectionné:', this.selectedProduct);
      
      if (this.selectedProduct) {
        // Mettre à jour le formulaire avec les valeurs du produit
        this.addItemForm.patchValue({
          product_id: selectedProductId,
          price: this.selectedProduct.price || 0,
          quantity: 1,
          remise: 0
        });
      }
    } else {
      this.selectedProduct = null;
      // Réinitialiser le formulaire
      this.addItemForm.patchValue({
        product_id: '',
        price: 0,
        quantity: 1,
        remise: 0
      });
    }
  }

  addNewItem(): void {
    if (!this.addItemForm.valid || !this.selectedProduct) {
      console.log('Formulaire invalide ou produit non sélectionné');
      return;
    }

    const formValue = this.addItemForm.value;
    
    // Vérifier le stock disponible
    if (this.selectedProduct.qtt_stock < formValue.quantity) {
      alert(`Stock insuffisant! Stock disponible: ${this.selectedProduct.qtt_stock}`);
      return;
    }

    const newItem: CommandeItem = {
      item_id: Date.now(), // Générer un ID temporaire
      quantity: formValue.quantity,
      price: formValue.price,
      remise: formValue.remise,
      total_ligne: this.calculateItemTotal(formValue.price, formValue.quantity, formValue.remise),
      product_id: this.selectedProduct.id,
      product_name: this.selectedProduct.name,
      is_new: true
    };

    console.log('Nouvel item à ajouter:', newItem);

    if (this.commande) {
      this.commande.items = [...this.commande.items, newItem];
      this.calculateTotal();
      console.log('Items après ajout:', this.commande.items);
    }

    // Réinitialiser le formulaire et fermer le modal
    this.resetAddItemForm();
    this.closeModal();
  }

  private resetAddItemForm(): void {
    this.selectedProduct = null;
    this.addItemForm.reset({
      product_id: '',
      quantity: 1,
      price: 0,
      remise: 0
    });
  }

  private closeModal(): void {
    // Fermer le modal Bootstrap
    const modalElement = document.getElementById('addItemModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  // Calculer le total prévisualisation dans le modal
  getPreviewTotal(): number {
    if (!this.addItemForm.valid) return 0;
    
    const formValue = this.addItemForm.value;
    return this.calculateItemTotal(formValue.price, formValue.quantity, formValue.remise);
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
          alert('Commande sauvegardée avec succès!');
          // Redirection ou autre action
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la sauvegarde');
        }
      });
  }

  // Update item quantity
  updateItemQuantity(item: CommandeItem, newQuantity: number): void {
    if (!this.commande?.items) return;
    
    const product = this.products.find(p => p.id === item.product_id);
    if (product && product.qtt_stock < newQuantity) {
      alert('La quantité demandée dépasse le stock disponible');
      return;
    }

    const index = this.commande.items.findIndex(i => i.item_id === item.item_id);
    if (index !== -1) {
      this.commande.items[index].quantity = newQuantity;
      this.commande.items[index].total_ligne = this.calculateItemTotal(
        this.commande.items[index].price,
        this.commande.items[index].quantity,
        this.commande.items[index].remise
      );
      this.calculateTotal();
    }
  }

  // Update item price
  updateItemPrice(item: CommandeItem, newPrice: number): void {
    if (!this.commande?.items) return;
    
    const index = this.commande.items.findIndex(i => i.item_id === item.item_id);
    if (index !== -1) {
      this.commande.items[index].price = newPrice;
      this.commande.items[index].total_ligne = this.calculateItemTotal(
        this.commande.items[index].price,
        this.commande.items[index].quantity,
        this.commande.items[index].remise
      );
      this.calculateTotal();
    }
  }

  // Update item remise
  updateItemRemise(item: CommandeItem, newRemise: number): void {
    if (!this.commande?.items) return;
    
    const index = this.commande.items.findIndex(i => i.item_id === item.item_id);
    if (index !== -1) {
      this.commande.items[index].remise = newRemise;
      this.commande.items[index].total_ligne = this.calculateItemTotal(
        this.commande.items[index].price,
        this.commande.items[index].quantity,
        this.commande.items[index].remise
      );
      this.calculateTotal();
    }
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