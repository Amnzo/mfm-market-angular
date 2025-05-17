import { Component } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  //styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  product = {
    name: '',
    price: null,
    price2: null,
    available: true,
    qtt_stock: null,
    imageurl: ''
  };

  imageFileInvalid = false;
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

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

  submit() {
    if (
      !this.product.name ||
      this.product.price === null ||
      this.product.price2 === null ||
      this.product.qtt_stock === null ||
      this.imageFileInvalid
    ) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    // Préparer les données dans un FormData pour gérer fichier + données
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('price', this.product.price.toString());
    formData.append('price2', this.product.price2.toString());
    formData.append('available', this.product.available.toString());
    formData.append('qtt_stock', this.product.qtt_stock.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    // Exemple d’URL, à changer par celle de ton API réelle
    const apiUrl = 'admin/add-product';

    // Envoyer la requête POST
    this.http.post(apiUrl, formData).subscribe({
      next: (response) => {
        console.log('Produit ajouté avec succès', response);
        alert('Produit ajouté avec succès');

        // Réinitialiser le formulaire
        this.product = {
          name: '',
          price: null,
          price2: null,
          available: true,
          qtt_stock: null,
          imageurl: ''
        };
        this.imageFileInvalid = false;
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        alert('Erreur lors de l\'ajout du produit');
      }
    });
  }
}
