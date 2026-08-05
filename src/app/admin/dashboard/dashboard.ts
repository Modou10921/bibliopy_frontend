import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  nomUniversite: string = 'Chargement...';
  logoUrl: string = ''; 

  totalLivres: number = 0;
  livresDisponibles: number = 0;
  empruntsEnCours: number = 0;
  retards: number = 0;

  // 🔔 Notifications
  notificationsOuvert: boolean = false;
  notifications: any[] = [];
  nombreNonLues: number = 0;
  private storageKey: string = '';
  
  private intervalleRafraichissement: any;
  private estInitialise: boolean = false; 

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerStats();
    this.chargerInfosBibliotheque(); 
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminId = user.id || 'default_admin';
    this.storageKey = `admin_notifs_lues_${adminId}`;

    // Premier chargement immédiat
    this.chargerNotifications();

    // 🔄 Rafraîchissement automatique toutes les 10 secondes
    this.intervalleRafraichissement = setInterval(() => {
      this.chargerStats();
      this.chargerNotifications();
    }, 10000); 
  }

  @HostListener('document:click', ['$event'])
  fermerNotifications(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) {
      this.notificationsOuvert = false;
      this.cdr.detectChanges();
    }
  }

  chargerInfosBibliotheque() {
    this.http.get<any>('http://localhost:8000/api/bibliotheque/').subscribe({
      next: (data) => {
        const b = Array.isArray(data) ? data[0] : data;
        if (b) {
          this.nomUniversite = b.nom || b.nom_universite;
          this.logoUrl = b.logo || b.logo_url;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Erreur API Bibliothèque:', err)
    });
  }

  chargerStats() {
    this.http.get<any>('http://localhost:8000/api/stats/').subscribe({
      next: (data) => {
        this.totalLivres = data.total_livres || 0;
        this.livresDisponibles = data.livres_disponibles || 0;
        this.empruntsEnCours = data.emprunts_en_cours || 0;
        this.retards = data.retards || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur API Stats:', err)
    });
  }

  chargerNotifications() {
    let notifsLuesSauvegardees: string[] = [];
    try {
      notifsLuesSauvegardees = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      notifsLuesSauvegardees = [];
    }

    const nouvelleListeConstruite: any[] = [];

    // 👤 1. APPEL ETUDIANTS (Séparé et protégé)
    this.http.get<any[]>('http://localhost:8000/api/etudiants/').subscribe({
      next: (etudiants) => {
        if (etudiants && Array.isArray(etudiants)) {
          [...etudiants].reverse().forEach(e => {
            if (e && e.id) {
              const uniqueId = `etudiant-${e.id}`;
              nouvelleListeConstruite.push({
                id: uniqueId,
                type: 'etudiant',
                icone: '👤',
                message: `Nouvel étudiant inscrit : ${e.prenom || ''} ${e.nom || ''}`,
                lu: notifsLuesSauvegardees.includes(uniqueId), 
                lien: '/admin/etudiants'
              });
            }
          });
        }
        this.appliquerMiseAJourSecurisee(nouvelleListeConstruite);
      },
      error: (err) => console.error('Erreur API Étudiants:', err)
    });

    // 📖 2. APPEL EMPRUNTS (Si Django plante ici, cela ne bloquera plus le reste !)
    this.http.get<any[]>('http://localhost:8000/api/emprunts-en-cours/').subscribe({
      next: (emprunts) => {
        if (emprunts && Array.isArray(emprunts)) {
          [...emprunts].reverse().forEach(e => {
            if (e && e.id) {
              let icone = '📖';
              let messageTxt = '';
              const statutBrut = e.statut || e.status || 'Inconnu';
              const cleanStatut = statutBrut.toLowerCase().trim();
              const uniqueId = `emprunt-${e.id}-${cleanStatut.replace(/\s+/g, '')}`;

              if (cleanStatut.includes('retard')) {
                icone = '⚠️';
                messageTxt = `Retard : "${e.livre_titre || 'Livre'}" — ${e.etudiant_nom || 'Étudiant'}`;
              } else if (cleanStatut.includes('accept') || cleanStatut.includes('approv')) {
                icone = '🟢';
                messageTxt = `Demande acceptée : "${e.livre_titre || 'Livre'}" pour ${e.etudiant_nom || 'Étudiant'}`;
              } else if (cleanStatut.includes('refus')) {
                icone = '🔴';
                messageTxt = `Demande refusée : "${e.livre_titre || 'Livre'}" (${e.etudiant_nom || 'Étudiant'})`;
              } else if (cleanStatut.includes('rendu') || cleanStatut.includes('retour')) {
                icone = '✅';
                messageTxt = `Livre rendu : "${e.livre_titre || 'Livre'}" par ${e.etudiant_nom || 'Étudiant'}`;
              } else {
                icone = 'ℹ️';
                messageTxt = `Mouvement (${statutBrut}) : "${e.livre_titre || 'Livre'}" — ${e.etudiant_nom || 'Étudiant'}`;
              }

              nouvelleListeConstruite.push({
                id: uniqueId,
                type: 'emprunt',
                icone: icone,
                message: messageTxt,
                lu: notifsLuesSauvegardees.includes(uniqueId),
                lien: '/admin/gestion-emprunts'
              });
            }
          });
        }
        this.appliquerMiseAJourSecurisee(nouvelleListeConstruite);
      },
      error: (err) => {
        console.warn('⚠️ L\'API Emprunts de Django est en panne (Erreur 500), mais le dashboard continue de tourner !');
      }
    });
  }

  appliquerMiseAJourSecurisee(nouvelleListe: any[]) {
    const ancienNombre = this.nombreNonLues;
    const anciensIds = this.notifications.map(n => n.id);
    let aUnNouveauMessageFrais = false;

    nouvelleListe.forEach(n => {
      if (!anciensIds.includes(n.id) && !n.lu) {
        aUnNouveauMessageFrais = true;
      }
    });

    this.notifications = nouvelleListe;
    this.nombreNonLues = this.notifications.filter(n => !n.lu).length;

    if (this.estInitialise && aUnNouveauMessageFrais && this.nombreNonLues > ancienNombre) {
      this.jouerSonNotification();
    }

    this.estInitialise = true; 
    this.cdr.detectChanges();
  }

  jouerSonNotification() {
    const audio = new Audio('assets/notification.mp3');
    audio.load();
    audio.play().catch(err => {
      console.warn("🔊 Son en attente d'une action utilisateur.", err);
    });
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.notificationsOuvert = !this.notificationsOuvert;
    this.cdr.detectChanges();
  }

  toutMarquerLu() {
    let notifsLuesSauvegardees: string[] = [];
    try {
      notifsLuesSauvegardees = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      notifsLuesSauvegardees = [];
    }
    
    this.notifications.forEach(n => {
      n.lu = true;
      if (!notifsLuesSauvegardees.includes(n.id)) {
        notifsLuesSauvegardees.push(n.id);
      }
    });

    localStorage.setItem(this.storageKey, JSON.stringify(notifsLuesSauvegardees));
    this.nombreNonLues = 0;
    this.cdr.detectChanges();
  }

  marquerUneLue(notif: any) {
    notif.lu = true;
    let notifsLuesSauvegardees: string[] = [];
    try {
      notifsLuesSauvegardees = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      notifsLuesSauvegardees = [];
    }
    
    if (!notifsLuesSauvegardees.includes(notif.id)) {
      notifsLuesSauvegardees.push(notif.id);
      localStorage.setItem(this.storageKey, JSON.stringify(notifsLuesSauvegardees));
    }

    this.nombreNonLues = this.notifications.filter(n => !n.lu).length;
    this.cdr.detectChanges();
  }

  allerVersLien(notif: any) {
    this.marquerUneLue(notif);
    this.notificationsOuvert = false;
    this.router.navigate([notif.lien]);
  }

  ngOnDestroy() {
    if (this.intervalleRafraichissement) {
      clearInterval(this.intervalleRafraichissement);
    }
  }

  allerAuProfilAdmin() { this.router.navigate(['/admin/profil']); }
  allerAGestionLivres() { this.router.navigate(['/admin/gestion-livres']); }
  allerAuxStatistiques() { this.router.navigate(['/admin/statistiques']); }
  allerALaBibliotheque() { this.router.navigate(['/']); }
  allerVers(route: string) { this.router.navigate(['/admin', route]); }
  allerAuxRetards() { this.router.navigate(['/admin/retards']); }
}