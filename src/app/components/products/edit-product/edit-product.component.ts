import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  product: {
    id: number;
    name: string;
    price: number;
    price2: number;
    available: boolean;
    qtt_stock: number;
    imageurl: string;
  } | null = null;
  imageFileInvalid = false;
  selectedFile: File | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      // ⚠️ À adapter avec ton API réelle
      this.http.get(`admin/get_product/${id}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.product = {
            id: data.id,
            name: data.name || '',
            price: data.price || 0,
            price2: data.price2 || 0,
            available: data.avalaible,
            qtt_stock: data.qtt_stock || 0,
            imageurl: data.imageurl || ''
          };
        },
        error: (err) => {
          console.error('Erreur lors du chargement du produit', err);
          alert('Erreur lors du chargement du produit');
          this.router.navigate(['/produits']);
        }
      });
    } else {
      alert('Produit non trouvé');
      this.router.navigate(['/produits']);
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
          this.product.imageurl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    } else {
      this.imageFileInvalid = false;
      this.selectedFile = null;
      this.product.imageurl = '';
    }
  }

  update() {
    console.log("voici les nouvvel valeur de produit****");
    console.log(this.product);
    if (
      !this.product.name ||
      this.product.price === null ||
      this.product.price2 === null ||
      this.product.qtt_stock === null
    ) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('name', this.product?.name || '');
    formData.append('price', this.product?.price ? this.product.price.toString() : '0');
    formData.append('price2', this.product?.price2 ? this.product.price2.toString() : '0');
    formData.append('available', (this.product?.available).toString());
    formData.append('qtt_stock', this.product?.qtt_stock ? this.product.qtt_stock.toString() : '0');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    // ⚠️ À adapter avec ton API réelle
    this.http.put(`admin/update-product/${this.product.id}`, formData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Produit mis à jour avec succès', response);
        alert('Produit mis à jour avec succès');
        this.router.navigate(['/produits']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Erreur lors de la mise à jour du produit';
        console.error('Erreur lors de la mise à jour', err);
        alert(this.error);
      }
    });
  }

  cancel() {
    this.router.navigate(['/produits']);
  }
}
