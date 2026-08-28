import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LivreService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLivres() {
    return this.http.get<any[]>(`${this.apiUrl}/livres/`);
  }

  getLivre(id: number) {
    return this.http.get(`${this.apiUrl}/livres/${id}/`);
  }

  ajouterLivre(data: any) {
    return this.http.post(`${this.apiUrl}/livres/`, data);
  }

  modifierLivre(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/livres/${id}/`, data);
  }

  supprimerLivre(id: number) {
    return this.http.delete(`${this.apiUrl}/livres/${id}/`);
  }

  getStats() {
    return this.http.get(`${this.apiUrl}/stats/`);
  }
}