import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // On s'assure de retirer un éventuel slash final dans apiUrl pour éviter les doubles slashes "//"
  private apiUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  login(email: string, password: string, isAdmin: boolean) {
    return this.http.post<any>(`${this.apiUrl}/login/`, {
      email: email,
      password: password,
      isEtudiant: !isAdmin
    });
  }

  inscrire(data: any) {
    // 🔴 Correction de l'endpoint : /inscription/ au lieu de /register/
    return this.http.post(`${this.apiUrl}/inscription/`, data);
  }

  sauvegarderSession(token: string, user: any) {
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