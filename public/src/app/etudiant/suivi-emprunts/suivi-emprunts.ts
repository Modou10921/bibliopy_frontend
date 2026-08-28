import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerEmprunts();
    this.chargerProfilUtilisateur();
  }

  // 1️⃣ Récupération des livres demandés par l'étudiant depuis Django
  chargerEmprunts() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24';

    this.http.get<any>(`${environment.apiUrl}demande-emprunt/?etudiant=${etudiantId}`).subscribe({
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
    const user = JSON.parse(userString);
    this.profilEtudiant = {
      prenom: user.first_name || user.prenom || '',
      nom: user.last_name || user.nom || ''
    };
  }
}

  // 3️⃣ Filtrer les emprunts via la barre de recherche
  filtrerEmprunts() {
    if (!this.termeRecherche.trim()) {
      this.empruntsFiltres = this.listeEmprunts;
    } else {
      this.empruntsFiltres = this.listeEmprunts.filter(demande => {
        const titre = demande.livre_details?.titre?.toLowerCase() || '';
        return titre.includes(this.termeRecherche.toLowerCase());
      });
    }
  }

  annulerDemande(id: any) {
  // 🎯 Sécurité : Si l'id est introuvable ou mal lu par Angular, on le signale
  if (!id) {
    console.error("Erreur : l'ID de cette demande est indéfini (undefined).");
    alert("Impossible d'annuler : l'identifiant de cet emprunt n'est pas reconnu.");
    return;
  }

  if (confirm("Voulez-vous vraiment annuler cette demande d'emprunt ?")) {
    this.http.delete(`${environment.apiUrl}demande-emprunt/${id}/`).subscribe({
      next: () => {
        console.log(`Demande ${id} annulée avec succès.`);
        
        // Supprime instantanément le livre de l'affichage de l'écran
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