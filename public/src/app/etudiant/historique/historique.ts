import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule],
  templateUrl: './historique.html',
  styleUrl: './historique.css' // Assure-toi que l'extension correspond (.css ou .scss)
})
export class HistoriqueComponent implements OnInit {
  historiqueLivres: any[] = [];
  profilEtudiant: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerHistorique();
    this.chargerProfilUtilisateur();
  }

  // Récupère l'historique des livres rendus auprès de Django
  chargerHistorique() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24';

    this.http.get<any>(`${environment.apiUrl}demande-emprunt/?etudiant=${etudiantId}`).subscribe({
      next: (data) => {
        const resultats = Array.isArray(data) ? data : (data.results || []);
        
        // 💡 FILTRE CRUCIAL : On ne garde que les emprunts qui ont été "rendu"
        this.historiqueLivres = resultats.filter((emprunt: any) => emprunt.statut === 'rendu');
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur lors du chargement de l'historique :", err)
    });
  }

  // Charge les infos de l'étudiant pour le header
  chargerProfilUtilisateur() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24';
    this.http.get<any>(`${environment.apiUrl}profil/?id=${etudiantId}`).subscribe({
      next: (data) => {
        this.profilEtudiant = data;
        this.cdr.detectChanges();
      }
    });
  }
}