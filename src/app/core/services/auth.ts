import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, isAdmin: boolean) {
    return this.http.post<any>(`${this.apiUrl}/login/`, {
      email: email,
      password: password,
      isEtudiant: !isAdmin // 🟢 Si c'est un admin, isEtudiant sera 'false', exactement ce qu'attend Django !
    });
  }

  inscrire(data: any) {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  sauvegarderSession(token: string, user: any) {
    // 🛠️ CORRECTION : Harmonisation des noms de clé avec isLoggedIn() et getToken()
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user)); 
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('etudiant_id');
    localStorage.removeItem('etudiant_nom');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.is_admin === true;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
}
