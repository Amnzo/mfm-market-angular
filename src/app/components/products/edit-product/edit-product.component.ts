import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { ProductsService, Product } from '../../../services/products.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  productId: number | null = null;
  product: Product | null = null;
  imageFileInvalid = false;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    if (this.productId !== null) {
      this.productsService.getProduct(this.productId).subscribe({
        next: (product) => {
          this.product = product;
        },
        error: (err) => {
          console.error('Erreur lors du chargement du produit:', err);
          alert('Erreur lors du chargement du produit');
        }
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        this.imageFileInvalid = true;
        this.selectedFile = null;
      } else {
        this.imageFileInvalid = false;
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = () => {
          if (this.product) {
            this.product.imageurl = reader.result as string;
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      this.imageFileInvalid = false;
      this.selectedFile = null;
      if (this.product) {
        this.product.imageurl = '';
      }
    }
  }

  update() {
    if (!this.product) {
      alert('Produit non trouvé');
      return;
    }

    if (
      !this.product.name ||
      this.product.price === null ||
      this.product.price2 === null ||
      this.product.qtt_stock === null
    ) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('price', this.product.price.toString());
    formData.append('price2', this.product.price2.toString());
    formData.append('avalaible', this.product.avalaible ? 'true' : 'false');
    formData.append('qtt_stock', this.product.qtt_stock.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    // Utiliser updateProduct au lieu de addProduct
    this.productsService.updateProduct(this.productId!, formData).subscribe({
      next: (response) => {
        console.log('Produit mis à jour avec succès', response);
        alert('Produit mis à jour avec succès');
        this.router.navigate(['/produits']);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
        alert('Erreur lors de la mise à jour du produit');
      }
    });
  }

  cancel() {
    this.router.navigate(['/produits']);
  }
}
