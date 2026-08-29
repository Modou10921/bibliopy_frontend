import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil-etudiant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profil-etudiant.html',
  styleUrls: ['./profil-etudiant.css']
})
export class ProfilEtudiantComponent implements OnInit {
  profil: any = null;
  chargement: boolean = true;
  modeEdition: boolean = false;
  message: string = '';
  erreur: string = '';

  formulaire = {
    nom: '',
    prenom: '',
    email: '',
    nouveau_mot_de_passe: ''
  };

  private baseUrl = 'https://bibliopy-backend.onrender.com/api';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit(): void {
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

  allerAAccueil(): void {
    this.router.navigate(['/']);
  }

  chargerProfil(): void {
    const id = localStorage.getItem('etudiant_id');
    const endpoint = id 
      ? `${this.baseUrl}/profil/?id=${id}` 
      : `${this.baseUrl}/profil/`;

    this.http.get<any>(endpoint, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.profil = data;
          this.formulaire.nom = data.nom || data.last_name || '';
          this.formulaire.prenom = data.prenom || data.first_name || '';
          this.formulaire.email = data.email || '';
          this.chargement = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur chargement profil :", err);
          this.erreur = 'Impossible de charger le profil.';
          this.chargement = false;
          this.cdr.detectChanges();
        }
      });
  }

  sauvegarder(): void {
    const id = localStorage.getItem('etudiant_id');
    const endpoint = id 
      ? `${this.baseUrl}/profil/modifier/?id=${id}` 
      : `${this.baseUrl}/profil/modifier/`;

    this.http.put<any>(endpoint, this.formulaire, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.message = '✅ Profil mis à jour avec succès !';
          this.erreur = '';
          this.modeEdition = false;
          this.chargerProfil();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur modification profil :", err);
          this.erreur = '❌ Erreur lors de la mise à jour.';
          this.message = '';
          this.cdr.detectChanges();
        }
      });
  }
}