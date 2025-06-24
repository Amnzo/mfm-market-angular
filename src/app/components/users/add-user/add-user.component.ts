import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  userForm: FormGroup;
  userLevels = ['vendeur', 'gros', 'livreur'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telephone: ['', Validators.required],
      user_level: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      // URL de l'API
      const apiUrl = 'admin/add-user';

      // Envoyer la requête POST
      this.http.post(apiUrl, userData).subscribe({
        next: (response) => {
          console.log('Utilisateur ajouté avec succès', response);
          alert('Utilisateur ajouté avec succès');

          // Rediriger vers la liste des utilisateurs
          this.router.navigate(['/utilisateurs']);
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de l\'utilisateur', error);
          alert('Erreur lors de l\'ajout de l\'utilisateur. Veuillez réessayer.');
        }
      });
    }
  }
}
