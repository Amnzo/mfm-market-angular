import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/product-list/products.component';
import { AddProductComponent } from './components/products/add-product/add-product.component';
import { EditProductComponent } from './components/products/edit-product/edit-product.component';
import { UsersListComponent } from './components/users/users-list/users-list.component';
import { AppRoutingModule } from './app-routing.module';

// Add Font Awesome icons
library.add(fas);

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'produits', component: ProductsComponent },
  { path: 'produits/ajouter', component: AddProductComponent },
  { path: 'produits/edit/:id', component: EditProductComponent },
  { path: 'commande', component: SidebarComponent },
  { path: 'utilisateurs', component: UsersListComponent },
  { path: 'utilisateurs/ajouter', component: SidebarComponent },
  { path: 'utilisateurs/:id/editer', component: SidebarComponent },
  { path: 'paiement', component: SidebarComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    HomeComponent,
    ProductsComponent,
    AddProductComponent,
    EditProductComponent,
    UsersListComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    FontAwesomeModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
