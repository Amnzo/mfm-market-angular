import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { ProductsService } from './services/products.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/product-list/products.component';
import { AddProductComponent } from './components/products/add-product/add-product.component';
import { EditProductComponent } from './components/products/edit-product/edit-product.component';
import { UsersListComponent } from './components/users/users-list/users-list.component';
import { CommandeListComponent } from './components/commandes/commande-list/commande-list.component';
import { CommandeEditComponent } from './components/commandes/commande-edit/commande-edit.component';
import { AddUserComponent } from './components/users/add-user/add-user.component';
import { MenuComponent } from './components/menu/menu/menu.component';
import { ClientsListComponent } from './components/clients/clients-list/clients-list.component';
import { CategoriesListComponent } from './components/categories/categories-list/categories-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProductsComponent,
    AddProductComponent,
    EditProductComponent,
    UsersListComponent,
    SidebarComponent,
    HomeComponent,
    CommandeListComponent,
    CommandeEditComponent,
    AddUserComponent,
    ClientsListComponent,
    CategoriesListComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    FontAwesomeModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [ProductsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
