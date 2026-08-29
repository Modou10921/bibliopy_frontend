import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './mon-compte.html',
  styleUrl: './mon-compte.css'
})
export class MonCompteComponent implements OnInit {
  profil: any = null;
  estEnChargement: boolean = true;

  private baseUrl = 'https://bibliopy-backend.onrender.com/api';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerProfil();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      const authHeader = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Token ${token}`;
      return new HttpHeaders({ Authorization: authHeader });
    }
    return new HttpHeaders();
  }

  chargerProfil() {
    // 1. Tente de récupérer les infos depuis le localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        this.profil = {
          prenom: user.first_name || user.prenom || '',
          nom: user.last_name || user.nom || '',
          email: user.email || '',
          filiere: user.filiere || '',
          naissance: user.naissance || ''
        };
      } catch (e) {
        console.error("Erreur parse local user:", e);
      }
    }

    // 2. Récupère les données fraîches depuis le backend Render
    const etudiantId = localStorage.getItem('etudiant_id');
    const endpoint = etudiantId 
      ? `${this.baseUrl}/profil/?id=${etudiantId}` 
      : `${this.baseUrl}/profil/`;

    this.http.get<any>(endpoint, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Fusionne les données API avec le profil local
        this.profil = { ...this.profil, ...data };
        this.estEnChargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur API profil :", err);
        this.estEnChargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  deconnecter() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('etudiant_id');
    localStorage.removeItem('etudiant_nom');
    localStorage.removeItem('etudiant_prenom');
    
    this.router.navigate(['/connexion']);
  }
}