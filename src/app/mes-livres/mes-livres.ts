import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mes-livres',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule, FormsModule],
  templateUrl: './mes-livres.html',
  styleUrl: './mes-livres.css', 
})
export class MesLivresComponent implements OnInit {
  listeLivres: any[] = [];
  livresFiltres: any[] = [];
  termeRecherche: string = '';
  profilEtudiant: any = null;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit() {
    this.chargerMesLivres();
    this.chargerProfilUtilisateur();
  }

  chargerMesLivres() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24'; 
    this.http.get<any>(`http://localhost:8000/api/demande-emprunt/?etudiant=${etudiantId}`).subscribe({
      next: (data) => {
        const resultats = Array.isArray(data) ? data : (data.results || []);
        this.listeLivres = resultats.filter((emprunt: any) => 
          emprunt.statut === 'disponible' || emprunt.statut === 'accepte' || 
          emprunt.statut === 'Valide' || emprunt.statut === 'prolonge'
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

  rendreLivre(idDemande: any) {
    if (!idDemande) {
      alert("Erreur : Impossible de lire l'identifiant de la demande.");
      return;
    }
    this.router.navigate(['/etudiant/rendre-livre', idDemande]);
  }

  prolongerEmprunt(idDemande: any) {
    if (!idDemande) {
      alert("Erreur : Impossible de lire l'identifiant de la demande.");
      return;
    }
    
    if (confirm("Voulez-vous prolonger la durée de cet emprunt ?")) {
      const empruntEnCours = this.listeLivres.find(e => e.id_demande === idDemande);
      const titreLivre = empruntEnCours?.livre_details?.titre || 'votre livre';

      this.http.patch(`http://localhost:8000/api/demande-emprunt/${idDemande}/`, { statut: 'prolonge' }).subscribe({
        next: () => {
          const messageExact = `Votre demande de prolongation pour le livre "${titreLivre}" a bien été acceptée par le système.`;
          
          // ✅ Sauvegarder dans localStorage
          const sauvegarde = localStorage.getItem('notifications_bibliopy');
          const notifs = sauvegarde ? JSON.parse(sauvegarde) : [];
          notifs.unshift({
            id: Date.now(),
            text: messageExact,
            date: new Date().toISOString(),
            lu: false
          });
          localStorage.setItem('notifications_bibliopy', JSON.stringify(notifs));

          const evenement = new CustomEvent('nouvelle-notification', { detail: messageExact });
          window.dispatchEvent(evenement);

          const audio = new Audio('assets/notification.mp3');
          audio.load();
          audio.play().then(() => {
            this.router.navigate(['/etudiant/notifications']);
          }).catch(() => {
            this.router.navigate(['/etudiant/notifications']);
          });
        }, // ✅ virgule ici
        error: (err) => {
          console.error("Erreur Django :", err);
          alert("Erreur ! Le serveur n'a pas pu prolonger l'emprunt.");
        }
      });
    }
  }
}