import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demande-emprunt',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './demande-emprunt.html',
  styleUrls: ['./demande-emprunt.css']
})
export class DemandeEmpruntComponent implements OnInit {

  livre: any = null;
  loading = true;
  erreurChargement = '';

  // Infos étudiant connecté
  etudiantConnecte = {
    nom_complet: '',
    email: ''
  };
  isConnecte = false;
  naissance = '';

  // Dates automatiques
  dateEmprunt: string = new Date().toISOString().split('T')[0];
  dateRetour: string = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  erreurEnvoi = '';
  succes = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    // Vérifier connexion
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/connexion']);
      return;
    }

    // Charger infos utilisateur depuis localStorage
    const userString = localStorage.getItem('user');
    console.log('userString brut:', userString);
    if (userString && userString !== 'undefined') {
      try {
        const user = JSON.parse(userString);
        console.log('user parsé:', user);
        this.etudiantConnecte.nom_complet = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        this.etudiantConnecte.email = user.email || '';
        console.log('nom_complet:', this.etudiantConnecte.nom_complet);
        console.log('email:', this.etudiantConnecte.email);
        this.isConnecte = true;
      } catch(e) {
        console.error('Erreur parsing user:', e);
      }
    }

    // Charger le livre
    const idLivre = this.route.snapshot.paramMap.get('id');
    if (idLivre) {
      this.http.get<any>(`https://bibliopy-backend.onrender.com/api/livres/${idLivre}/`).subscribe({
        next: (data) => {
          this.livre = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement livre :', err);
          this.erreurChargement = 'Impossible de charger les données du livre.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.erreurChargement = 'Livre introuvable.';
      this.loading = false;
    }
  }

  envoyerDemande() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/connexion']);
      return;
    }

    const etudiantId = localStorage.getItem('etudiant_id');
    const donneesEmprunt = {
      etudiant: Number(etudiantId),
      livre: this.livre?.id,
      statut: 'En attente'
    };

    const headers = new HttpHeaders({ Authorization: `Token ${token}` });

    // On réinitialise l'erreur avant l'envoi
    this.erreurEnvoi = '';

    this.http.post('http://localhost:8000/api/demande-emprunt/', donneesEmprunt, { headers }).subscribe({
      next: (reponseBackend: any) => {
        if (reponseBackend && reponseBackend.message) {
          const evenement = new CustomEvent('nouvelle-notification', { detail: reponseBackend.message });
          window.dispatchEvent(evenement);
        }

        // 🔊 Déclenchement du son
        const audio = new Audio('assets/notification.mp3');
        audio.load();
        
        audio.play().then(() => {
          console.log("🔊 Son joué avec succès !");
          this.router.navigate(['/etudiant/notifications']);
        }).catch(err => {
          console.error("❌ Erreur audio :", err);
          this.router.navigate(['/etudiant/notifications']);
        });
      },
      error: (err) => {
        console.error('Erreur envoi demande :', err.status, err.error);
        
        if (err.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          this.router.navigate(['/connexion']);
        } else if (err.status === 400 && err.error && err.error.error) {
          // 🎯 On extrait directement le message propre envoyé par Django
          this.erreurEnvoi = err.error.error;
        } else {
          this.erreurEnvoi = "Une erreur est survenue lors de la validation de votre demande.";
        }
        
        // Force le rafraîchissement de la vue pour afficher l'alerte rouge
        this.cdr.detectChanges();
      }
    });
  }
}