import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => users),
      catchError((error) => {
        console.error('API Error:', error);
        const errorMessage = error.error?.message || 
                           error.statusText || 
                           'Erreur lors du chargement des utilisateurs';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
