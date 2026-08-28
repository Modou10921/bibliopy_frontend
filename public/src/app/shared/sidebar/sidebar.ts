import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // 🟢 Ajout de HttpClientModule pour le mode Standalone

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HttpClientModule], // 🟢 Ajout de HttpClientModule ici
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  
  nbNotifsNonLues: number = 0;
  listeNotifs: any[] = [];
  dernierNombreNotifs: number = 0; 

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient 
  ) {}

  ngOnInit() {
    // 1. Première vérification immédiate au démarrage pour afficher le badge
    this.verifierNouvellesNotifications();

    // 2. ⏳ SURVEILLANCE AUTOMATIQUE : Re-vérifie toutes les 10 secondes si l'admin a envoyé un message
    setInterval(() => {
      this.verifierNouvellesNotifications();
    }, 10000); 

    // Écoute aussi les actions locales de l'étudiant (Rendre livre, Prolonger)
    window.addEventListener('nouvelle-notification', (event: any) => {
      const nouvelleNotif = {
        message: event.detail, // On utilise 'message' pour s'aligner avec Django
        date_creation: new Date(),
        lu: false
      };
      this.listeNotifs = [nouvelleNotif, ...this.listeNotifs];
      localStorage.setItem('notifications_bibliopy', JSON.stringify(this.listeNotifs));
      this.verifierNouvellesNotifications(); 
    });
  }

  // 🟢 FONCTION DE SYNCHRONISATION AVEC DJANGO (Vérifie les nouveaux messages de l'admin)
  verifierNouvellesNotifications() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24';
    
    this.http.get<any[]>(`${environment.apiUrl}notifications/?etudiant=${etudiantId}`).subscribe({
      next: (data) => {
        // Récupération des notifs locales
        const sauvegarde = localStorage.getItem('notifications_bibliopy');
        const localNotifs = sauvegarde ? JSON.parse(sauvegarde) : [];

        // Compte des messages non lus
        const totalDjangoNonLues = data.filter(n => !n.lu).length;
        const totalLocalNonLues = localNotifs.filter((n: any) => !n.lu).length;
        const totalActuelNonLues = totalDjangoNonLues + totalLocalNonLues;

        // 🔊 JOUER LE SON : Si le compteur augmente, c'est que l'admin a cliqué sur "Envoyer la notification"
        if (totalActuelNonLues > this.dernierNombreNotifs && this.dernierNombreNotifs !== 0) {
          const audio = new Audio('assets/notification.mp3');
          audio.load();
          audio.play().catch(err => console.log("Le navigateur bloque le son sans clic préalable :", err));
        }

        // Mise à jour des compteurs sur la Sidebar
        this.nbNotifsNonLues = totalActuelNonLues;
        this.dernierNombreNotifs = totalActuelNonLues;
      },
      error: (err) => console.error("Erreur de synchronisation Sidebar :", err)
    });
  }

  calculerCompteur() {
    this.nbNotifsNonLues = this.listeNotifs.filter(n => !n.lu).length;
  }

  remettreAZero() {
    this.listeNotifs = this.listeNotifs.map(n => ({ ...n, lu: true }));
    localStorage.setItem('notifications_bibliopy', JSON.stringify(this.listeNotifs));
    this.nbNotifsNonLues = 0;
    this.dernierNombreNotifs = 0;
  }

  deconnecter() {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }
}