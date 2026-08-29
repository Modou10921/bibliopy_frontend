import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rendre-livre',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './rendre-livre.html',
  styleUrl: './rendre-livre.css'
})
export class RendreLivreComponent implements OnInit {
  idDemande!: string;
  livreDetails: any = null;
  
  dateRetour: string = new Date().toISOString().substring(0, 10); 
  commentaire: string = '';
  note: number = 3;

  private baseUrl = 'https://bibliopy-backend.onrender.com/api';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.idDemande = this.route.snapshot.paramMap.get('id') || '';
    if (this.idDemande && this.idDemande !== 'undefined') {
      this.chargerInfosLivre();
    }
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      const authHeader = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Token ${token}`;
      return new HttpHeaders({ Authorization: authHeader });
    }
    return new HttpHeaders();
  }

  chargerInfosLivre() {
    this.http.get<any>(`${this.baseUrl}/demande-emprunt/${this.idDemande}/`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.livreDetails = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Erreur de chargement du livre :", err);
      }
    });
  }

  attribuerNote(valeur: number) {
    this.note = valeur;
    this.cdr.detectChanges(); 
  }

  soumettreRetour() {
    const payload = {
      statut: 'rendu',
      date_retour_effective: this.dateRetour,
      commentaire: this.commentaire,
      note: this.note
    };

    this.http.patch(`${this.baseUrl}/demande-emprunt/${this.idDemande}/`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        const messageExact = "Formulaire envoyé. Veuillez vous rendre à la bibliothèque de votre université pour la restitution du livre dans les 5 prochains jours.";
        
        // Sauvegarder dans localStorage pour l'affichage local dans notifications
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

        const audio = new Audio('/assets/notification.mp3');
        audio.load();
        audio.play().then(() => {
          this.router.navigate(['/etudiant/notifications']);
        }).catch(() => {
          this.router.navigate(['/etudiant/notifications']);
        });
      },
      error: (err) => {
        console.error("Erreur Django :", err);
        alert("Une erreur est survenue lors de l'envoi de la demande de retour.");
      }
    });
  }
}