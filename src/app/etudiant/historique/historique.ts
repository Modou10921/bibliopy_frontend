import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './historique.html',
  styleUrl: './historique.css'
})
export class HistoriqueComponent implements OnInit {
  historiqueLivres: any[] = [];
  profilEtudiant: any = null;

  private baseUrl = 'https://bibliopy-backend.onrender.com/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerHistorique();
    this.chargerProfilUtilisateur();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      const authHeader = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Token ${token}`;
      return new HttpHeaders({ Authorization: authHeader });
    }
    return new HttpHeaders();
  }

  // Récupère l'historique des livres rendus auprès de Django
  chargerHistorique() {
    const etudiantId = localStorage.getItem('etudiant_id');
    if (!etudiantId) return;

    this.http.get<any>(`${this.baseUrl}/demande-emprunt/?etudiant=${etudiantId}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        const resultats = Array.isArray(data) ? data : (data.results || []);
        
        // Filtre : Ne garder que les emprunts "rendu" (minuscules ou majuscules)
        this.historiqueLivres = resultats.filter((emprunt: any) => 
          emprunt.statut?.toLowerCase() === 'rendu' || emprunt.statut?.toLowerCase() === 'terminé'
        );
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur lors du chargement de l'historique :", err)
    });
  }

  // Charge les infos de l'étudiant pour le header
  chargerProfilUtilisateur() {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        this.profilEtudiant = {
          prenom: user.first_name || user.prenom || '',
          nom: user.last_name || user.nom || ''
        };
      } catch (e) {
        console.error("Erreur parse user:", e);
      }
    } else {
      const etudiantId = localStorage.getItem('etudiant_id');
      if (etudiantId) {
        this.http.get<any>(`${this.baseUrl}/profil/?id=${etudiantId}`, { headers: this.getHeaders() }).subscribe({
          next: (data) => {
            this.profilEtudiant = data;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }
}