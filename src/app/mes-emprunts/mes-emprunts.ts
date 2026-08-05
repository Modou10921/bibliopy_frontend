import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mes-emprunts',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule, FormsModule],
  templateUrl: './mes-emprunts.html',
  styleUrl: './mes-emprunts.css'
})
export class MesEmpruntsComponent implements OnInit {
  listeLivres: any[] = [];
  livresFiltres: any[] = [];
  termeRecherche: string = '';
  profilEtudiant: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerMesLivres();
    this.chargerProfilUtilisateur();
  }

  chargerMesLivres() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24'; // ID récupéré de vos logs

    this.http.get<any>(`http://localhost:8000/api/demande-emprunt/?etudiant=${etudiantId}`).subscribe({
      next: (data) => {
        console.log('Livres reçus :', data);
        const resultats = Array.isArray(data) ? data : (data.results || []);
        
        // On affiche uniquement les livres acceptés ou récupérés (statut disponible ou accepté)
        this.listeLivres = resultats.filter((emprunt: any) => 
          emprunt.statut === 'disponible' || emprunt.statut === 'accepte' || emprunt.statut === 'Valide'
        );
        
        this.livresFiltres = [...this.listeLivres];
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur de chargement des livres :", err)
    });
  }

  chargerProfilUtilisateur() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24';
    this.http.get<any>(`http://localhost:8000/api/profil/?id=${etudiantId}`).subscribe({
      next: (data) => {
        this.profilEtudiant = data;
        this.cdr.detectChanges();
      }
    });
  }

  filtrerLivres() {
    if (!this.termeRecherche.trim()) {
      this.livresFiltres = this.listeLivres;
    } else {
      this.livresFiltres = this.listeLivres.filter(emprunt => {
        const titre = emprunt.livre_details?.titre?.toLowerCase() || '';
        return titre.includes(this.termeRecherche.toLowerCase());
      });
    }
  }

  rendreLivre(id: number) {
    if (confirm("Voulez-vous rendre ce livre ?")) {
      this.http.patch(`http://localhost:8000/api/demande-emprunt/${id}/`, { statut: 'rendu' }).subscribe({
        next: () => this.chargerMesLivres()
      });
    }
  }
}