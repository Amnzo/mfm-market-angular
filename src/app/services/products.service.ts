import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  price: number;
  imageurl: string;
  price2: number;
  avalaible: boolean;
  qtt_stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = '/admin/products';
  private addProductUrl = '/admin/add-product';

  constructor(private http: HttpClient) {}


  sendTestPost() {
    const formData = new FormData();
    formData.append('test', 'value');
  
    this.http.post('/admin/hello', formData).subscribe({
      next: (res) => console.log('Succès', res),
      error: (err) => console.error('Erreur', err)
    });
  }

  getProducts(): Observable<Product[]> {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    };

    return this.http.get<Product[]>(this.apiUrl, { headers }).pipe(
      map((products) => {
        // Transform the data to match our interface
        return products.map(product => ({
          ...product,
          price: product.price,
          price2: product.price2,
          avalaible: product.avalaible,
          qtt_stock: product.qtt_stock
        }));
      }),
      catchError((error) => {
        console.error('API Error:', error);
        // Try to get more detailed error information
        const errorMessage = error.error?.message || 
                           error.statusText || 
                           'Erreur lors du chargement des produits';
        throw new Error(errorMessage);
      })
    );
  }

  getProduct(productId: number): Observable<Product> {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    };

    return this.http.get<Product>(`${this.apiUrl}/${productId}`, { headers }).pipe(
      map((product) => {
        return {
          ...product,
          price: product.price,
          price2: product.price2,
          avalaible: product.avalaible,
          qtt_stock: product.qtt_stock
        };
      }),
      catchError((error) => {
        console.error('API Error:', error);
        const errorMessage = error.error?.message || 
                           error.statusText || 
                           'Erreur lors du chargement du produit';
        throw new Error(errorMessage);
      })
    );
  }

  deleteProduct(productId: number): Observable<void> {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    };

    return this.http.delete<void>(`${this.apiUrl}/${productId}`, { headers }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        const errorMessage = error.error?.message || 
                           error.statusText || 
                           'Erreur lors de la suppression du produit';
        throw new Error(errorMessage);
      })
    );
  }

  addProduct(product: Product, imageFile: File): Observable<Product> {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price.toString());
    if (product.price2 !== undefined && product.price2 !== null) {
      formData.append('price2', product.price2.toString());
    }
    formData.append('avalaible', product.avalaible ? 'true' : 'false');
    formData.append('qtt_stock', product.qtt_stock.toString());
    formData.append('image', imageFile);

    return this.http.post<Product>(this.addProductUrl, formData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        const errorMessage = error.error?.message || error.statusText || 'Erreur lors de l\'ajout du produit';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateProduct(productId: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.addProductUrl}/${productId}`, formData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        const errorMessage = error.error?.message || error.statusText || 'Erreur lors de la mise à jour du produit';
        return throwError(() => new Error(errorMessage));
      })
    );
  }  
}
