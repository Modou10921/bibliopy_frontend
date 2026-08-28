import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Token ${token}` }) };
  }

  // --- BIBLIOTHEQUE ---
  creerBibliotheque(data: any) {
    return this.http.post(`${this.apiUrl}/bibliotheque/`, data, this.getHeaders());
  }
  getBibliotheque() {
    return this.http.get(`${this.apiUrl}/bibliotheque/`, this.getHeaders());
  }

  // --- DASHBOARD STATS ---
  getStats() {
    return this.http.get<{
      total_livres: number;
      livres_disponibles: number;
      emprunts_en_cours: number;
      retards: number;
    }>(`${this.apiUrl}/stats/`, this.getHeaders());
  }

  // --- LIVRES ---
  getLivres() {
    return this.http.get<any[]>(`${this.apiUrl}/livres/`, this.getHeaders());
  }
  getLivre(id: number) {
    return this.http.get<any>(`${this.apiUrl}/livres/${id}/`, this.getHeaders());
  }
  ajouterLivre(data: any) {
    return this.http.post(`${this.apiUrl}/livres/`, data, this.getHeaders());
  }
  modifierLivre(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/livres/${id}/`, data, this.getHeaders());
  }
  supprimerLivre(id: number) {
    return this.http.delete(`${this.apiUrl}/livres/${id}/`, this.getHeaders());
  }

  // --- EMPRUNTS ---
  getEmprunts() {
    return this.http.get<any[]>(`${this.apiUrl}/emprunts/`, this.getHeaders());
  }
  validerEmprunt(id: number) {
    return this.http.patch(`${this.apiUrl}/emprunts/${id}/valider/`, {}, this.getHeaders());
  }
  rejeterEmprunt(id: number) {
    return this.http.patch(`${this.apiUrl}/emprunts/${id}/rejeter/`, {}, this.getHeaders());
  }

  // --- STATISTIQUES ---
  getStatistiques() {
    return this.http.get<any>(`${this.apiUrl}/statistiques/`, this.getHeaders());
  }
}