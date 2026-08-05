import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-gestion-emprunts',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-emprunts.html',
  styleUrl: './gestion-emprunts.css'
})
export class GestionEmpruntsComponent implements OnInit {

  emprunts: any[] = [];
  empruntsFiltres: any[] = [];
  recherche: string = '';
  loading: boolean = true;
  erreur: string = '';
  succes: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerEmprunts();
  }

  chargerEmprunts() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8000/api/demande-emprunt/').subscribe({
      next: (data) => {
        this.emprunts = data;
        this.empruntsFiltres = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement des emprunts.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrer() {
    const q = this.recherche.toLowerCase();
    this.empruntsFiltres = this.emprunts.filter(e =>
      e.livre_details?.titre?.toLowerCase().includes(q) ||
      e.statut?.toLowerCase().includes(q)
    );
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'accepte': return 'badge-green';
      case 'refuse': return 'badge-red';
      case 'En attente': return 'badge-amber';
      default: return 'badge-gray';
    }
  }

  envoyerNotification(emprunt: any) {
    if (!emprunt.date_retour_prevue) {
      this.erreur = "Impossible de calculer le délai : aucune date de retour prévue.";
      this.cdr.detectChanges();
      return;
    }

    const titre = emprunt.livre_details?.titre || 'ce livre';
    
    // 🕐 Dates pour le calcul de l'écart
    const maintenant = new Date();
    const dateRetour = new Date(emprunt.date_retour_prevue);
    
    // Calcul de la différence en millisecondes
    const differenceMs = dateRetour.getTime() - maintenant.getTime();
    
    // Conversions temporelles
    const unJourEnMs = 1000 * 60 * 60 * 24;
    const uneHeureEnMs = 1000 * 60 * 60;
    
    let message = '';

    if (differenceMs > unJourEnMs) {
      // 📅 Cas 1 : Il reste plus de 24 heures (on compte en jours)
      const joursRestants = Math.floor(differenceMs / unJourEnMs);
      message = `Rappel : Il vous reste ${joursRestants} jour(s) pour rendre le livre "${titre}". Le retour est prévu le ${dateRetour.toLocaleDateString('fr-FR')}.`;
    
    } else if (differenceMs > 0) {
      // ⏰ Cas 2 : Il reste moins de 24 heures (on compte en heures) -> Corrigé ici !
      const heuresRestantes = Math.floor(differenceMs / uneHeureEnMs);
      message = `Attention ! Il ne vous reste que ${heuresRestantes} heure(s) pour rendre le livre "${titre}". Merci de le restituer rapidement !`;
    
    } else {
      // ⚠️ Cas 3 : La date est dépassée (l'étudiant est en retard)
      const joursRetard = Math.floor(Math.abs(differenceMs) / unJourEnMs);
      message = `Urgent : Vous avez un retard de ${joursRetard} jour(s) pour le retour du livre "${titre}". Merci de le rendre immédiatement au guichet.`;
    }

    // 🚀 Envoi de la notification personnalisée à Django
    this.http.post('http://localhost:8000/api/notifications/', {
      etudiant: emprunt.etudiant,
      livre: emprunt.livre,
      message: message
    }).subscribe({
      next: () => {
        this.succes = `Notification de rappel envoyée avec succès !`;
        this.erreur = '';
        this.cdr.detectChanges();
        setTimeout(() => { this.succes = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err: any) => {
        console.error("Erreur API notifications:", err);
        this.erreur = "Erreur lors de l'envoi de la notification à l'étudiant.";
        this.cdr.detectChanges();
      }
    });
  }

  retour() {
    this.router.navigate(['/admin/dashboard']);
  }
}