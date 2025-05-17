import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  statusFilter = ''; 

  baseUrl = 'https://2872714c-427f-45d7-86a5-48cfb2ec630d-00-1poko749ejplg.janeway.replit.dev';
  uploads = '/uploads';

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase();

    this.filteredProducts = this.products.filter(product => {
      // Filtre recherche texte sur le nom
      const matchesSearch = product.name.toLowerCase().includes(query);

      // Filtre stock selon la sélection
      let matchesStatus = true;
      if (this.statusFilter === 'disponible') {
        matchesStatus = product.qtt_stock > 0;
      } else if (this.statusFilter === 'epuise') {
        matchesStatus = product.qtt_stock === 0;
      }

      return matchesSearch && matchesStatus;
    });
  }

  private loadProducts() {
    this.loading = true;
    this.error = null;
    
    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });
  }

  getFullImageUrl(imageFilename: string): string {
    const imagePath = `${this.baseUrl}${this.uploads}/`;
    if (imageFilename && imageFilename.trim() !== '') {
      return `${imagePath}${imageFilename}`;
    }
    return `${imagePath}no_picture.jpg`;
  }

  editProduct(product: Product): void {
    console.log('Editing product:', product);
  }

  deleteProduct(product: Product): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productsService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          alert('Erreur lors de la suppression du produit');
        }
      });
    }
  }
}
