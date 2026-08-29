import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'; 
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
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

  private baseUrl = 'https://bibliopy-backend.onrender.com/api';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit() {
    this.chargerMesLivres();
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

  chargerMesLivres() {
    const etudiantId = localStorage.getItem('etudiant_id');
    if (!etudiantId) return;

    this.http.get<any>(`${this.baseUrl}/demande-emprunt/?etudiant=${etudiantId}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        const resultats = Array.isArray(data) ? data : (data.results || []);
        
        // Filtre tous les statuts valides/acceptés/prolongés
        this.listeLivres = resultats.filter((emprunt: any) => {
          const st = emprunt.statut?.toLowerCase();
          return st === 'disponible' || st === 'accepte' || st === 'accepté' || st === 'valide' || st === 'validé' || st === 'prolonge' || st === 'prolongé';
        });

        this.livresFiltres = [...this.listeLivres];
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur de chargement des livres :", err)
    });
  }

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

  filtrerLivres() {
    if (!this.termeRecherche.trim()) {
      this.livresFiltres = this.listeLivres;
    } else {
      this.livresFiltres = this.listeLivres.filter(emprunt => {
        const titre = emprunt.livre_details?.titre?.toLowerCase() || emprunt.livre?.titre?.toLowerCase() || '';
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
      const empruntEnCours = this.listeLivres.find(e => (e.id || e.id_demande) === idDemande);
      const titreLivre = empruntEnCours?.livre_details?.titre || empruntEnCours?.livre?.titre || 'votre livre';

      this.http.patch(`${this.baseUrl}/demande-emprunt/${idDemande}/`, { statut: 'prolonge' }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          const messageExact = `Votre demande de prolongation pour le livre "${titreLivre}" a bien été acceptée par le système.`;
          
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
        },
        error: (err) => {
          console.error("Erreur Django :", err);
          alert("Erreur ! Le serveur n'a pas pu prolonger l'emprunt.");
        }
      });
    }
  }
}