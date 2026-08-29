import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suivi-emprunts',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule, FormsModule],
  templateUrl: './suivi-emprunts.html',
  styleUrl: './suivi-emprunts.css'
})
export class SuiviEmpruntsComponent implements OnInit {
  listeEmprunts: any[] = [];
  empruntsFiltres: any[] = [];
  termeRecherche: string = '';
  profilEtudiant: any = null;

  private baseUrl = 'https://bibliopy-backend.onrender.com/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerEmprunts();
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

  // 1️⃣ Récupération des livres demandés par l'étudiant
  chargerEmprunts() {
    const etudiantId = localStorage.getItem('etudiant_id');
    if (!etudiantId) return;

    this.http.get<any>(`${this.baseUrl}/demande-emprunt/?etudiant=${etudiantId}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        console.log('Réponse API Emprunts :', data);
        this.listeEmprunts = Array.isArray(data) ? data : (data.results || []);
        this.empruntsFiltres = [...this.listeEmprunts];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de chargement des emprunts :", err);
      }
    });
  }

  // 2️⃣ Récupérer les informations de l'étudiant connecté pour le Header
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
    }
  }

  // 3️⃣ Filtrer les emprunts via la barre de recherche
  filtrerEmprunts() {
    if (!this.termeRecherche.trim()) {
      this.empruntsFiltres = this.listeEmprunts;
    } else {
      this.empruntsFiltres = this.listeEmprunts.filter(demande => {
        const titre = demande.livre_details?.titre?.toLowerCase() || demande.livre?.titre?.toLowerCase() || '';
        return titre.includes(this.termeRecherche.toLowerCase());
      });
    }
  }

  annulerDemande(id: any) {
    if (!id) {
      console.error("Erreur : l'ID de cette demande est indéfini.");
      alert("Impossible d'annuler : l'identifiant de cet emprunt n'est pas reconnu.");
      return;
    }

    if (confirm("Voulez-vous vraiment annuler cette demande d'emprunt ?")) {
      this.http.delete(`${this.baseUrl}/demande-emprunt/${id}/`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          console.log(`Demande ${id} annulée avec succès.`);
          this.listeEmprunts = this.listeEmprunts.filter(demande => demande.id !== id && demande.id_demande !== id && demande.id_emprunt !== id);
          this.empruntsFiltres = this.empruntsFiltres.filter(demande => demande.id !== id && demande.id_demande !== id && demande.id_emprunt !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Erreur lors de la suppression backend :", err);
        }
      });
    }
  }
}