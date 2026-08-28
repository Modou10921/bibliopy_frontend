import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpruntService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEmprunts() {
    return this.http.get<any[]>(`${this.apiUrl}/emprunts/`);
  }

  getEmprunt(id: number) {
    return this.http.get(`${this.apiUrl}/emprunts/${id}/`);
  }

  creerEmprunt(data: any) {
    return this.http.post(`${this.apiUrl}/emprunts/`, data);
  }

  rendrelivre(id: number) {
    return this.http.patch(`${this.apiUrl}/emprunts/${id}/rendre/`, {});
  }

  prolongerEmprunt(id: number) {
    return this.http.patch(`${this.apiUrl}/emprunts/${id}/prolonger/`, {});
  }
}
