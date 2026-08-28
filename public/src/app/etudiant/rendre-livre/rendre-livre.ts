import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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

  chargerInfosLivre() {
    this.http.get<any>(`${environment.apiUrl}demande-emprunt/${this.idDemande}/`).subscribe({
      next: (data) => {
        this.livreDetails = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Erreur :", err);
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

    this.http.patch(`${environment.apiUrl}demande-emprunt/${this.idDemande}/`, payload).subscribe({
      next: () => {
        const messageExact = "Formulaire envoyé. Veuillez vous rendre à la bibliothèque de votre université pour la restitution du livre dans les 5 prochains jours.";
        
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

        const audio = new Audio('/assets/notification.mp3');
        audio.load();
        audio.play().then(() => {
          this.router.navigate(['/etudiant/notifications']);
        }).catch(() => {
          this.router.navigate(['/etudiant/notifications']);
        });
      }, // ✅ virgule ici
      error: (err) => {
        console.error("Erreur Django :", err);
      }
    });
  }
}