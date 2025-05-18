import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './components/products/product-list/products.component';
import { AddProductComponent } from './components/products/add-product/add-product.component';
import { EditProductComponent } from './components/products/edit-product/edit-product.component';
import { LoginComponent } from './login/login.component';
import { UsersListComponent } from './components/users/users-list/users-list.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { CommandeListComponent } from './components/commandes/commande-list/commande-list.component';
import { AddUserComponent } from './components/users/add-user/add-user.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'produits', component: ProductsComponent },
  { path: 'produits/ajouter', component: AddProductComponent },
  { path: 'produits/edit/:id', component: EditProductComponent },
  { path: 'commande', component: CommandeListComponent },
  { path: 'utilisateurs', component: UsersListComponent },
  { path: 'utilisateurs/ajouter', component: AddUserComponent },
  { path: 'utilisateurs/:id/editer', component: SidebarComponent },
  { path: 'paiement', component: SidebarComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
