import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent {
  categories: any[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  filteredCategories: any[] = [];
  addCategoryModal = false;
  editCategoryModal = false;
  editCategoryData: any = null;
  addCategoryForm: FormGroup;
  editCategoryForm: FormGroup;
  apiUrl = 'https://railwayaapi-production.up.railway.app/mobile/categories';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loadCategories();
    this.initForms();
  }

  initForms() {
    this.addCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      actif: [true]
    });

    this.editCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      actif: [true]
    });
  }

  loadCategories() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (response) => {
        this.categories = response;
        this.filteredCategories = [...this.categories];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des catégories';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openAddCategoryModal() {
    this.addCategoryModal = true;
  }

  closeAddCategoryModal() {
    this.addCategoryModal = false;
    this.addCategoryForm.reset();
  }

  openEditCategoryModal(category: any) {
    this.editCategoryData = category;
    this.editCategoryForm.patchValue({
      name: category.name,
      actif: category.actif
    });
    this.editCategoryModal = true;
  }

  closeEditCategoryModal() {
    this.editCategoryModal = false;
    this.editCategoryForm.reset();
    this.editCategoryData = null;
  }

  onAddCategorySubmit() {
    if (this.addCategoryForm.valid) {
      const categoryData = this.addCategoryForm.value;
      this.http.post('admin/add-category', categoryData).subscribe({
        next: () => {
          this.closeAddCategoryModal();
          this.loadCategories();
          alert('Catégorie ajoutée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout', error);
          alert('Erreur lors de l\'ajout de la catégorie');
        }
      });
    }
  }

  onEditCategorySubmit() {
    if (this.editCategoryForm.valid && this.editCategoryData) {
      const categoryData = this.editCategoryForm.value;
      this.http.put(`admin/categories/${this.editCategoryData.id}`, categoryData).subscribe({
        next: () => {
          this.closeEditCategoryModal();
          this.loadCategories();
          alert('Catégorie modifiée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la modification', error);
          alert('Erreur lors de la modification de la catégorie');
        }
      });
    }
  }

  deleteCategory(category: any) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.http.delete(`admin/categories/${category.id}`).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }
}
