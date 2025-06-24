import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
declare var bootstrap: any;

interface User {
  id: number;
  name: string;
  email: string;
  telephone: string;
  level: number | null;
  user_level: string;
  actif: boolean;
  password: string
}

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User = this.createEmptyUser();
  showModal: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`)
      .subscribe(response => {
        this.users = response;
      });
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user }; // clone pour éviter la modification directe
    const modal = new bootstrap.Modal(document.getElementById('editUserModal')!);
    modal.show();
  }

  closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal')!);
    if (modal) {
      modal.hide();
    }
  }

  submitEdit() {
    if (this.selectedUser && this.selectedUser.id) {
      // Préparer les données à envoyer
      const userData = {
        name: this.selectedUser.name,
        email: this.selectedUser.email,
        password: this.selectedUser.password,
        user_level: this.selectedUser.user_level,
        actif: this.selectedUser.actif
      };

      // Faire l'appel API pour mettre à jour l'utilisateur
      this.http.put(`${environment.apiUrl}/admin/update-user/${this.selectedUser.id}`, userData)
        .subscribe(response => {
          console.log('Utilisateur mis à jour avec succès:', response);
          
          // Mettre à jour l'utilisateur dans la liste
          const index = this.users.findIndex(u => u.id === this.selectedUser.id);
          if (index !== -1) {
            this.users[index] = { ...this.selectedUser };
          }
          
          // Fermer le modal
          this.closeModal();
          
          // Rafraîchir la liste des utilisateurs
          this.loadUsers();
        }, error => {
          console.error('Erreur lors de la mise à jour:', error);
          // Gérer l'erreur (afficher un message à l'utilisateur, etc.)
        });
    }
  }

  private createEmptyUser(): User {
    return {
      id: 0,
      name: '',
      email: '',
      telephone: '',
      level: null,
      user_level: '',
      actif: false,
      password: ''
    };
  }
}
