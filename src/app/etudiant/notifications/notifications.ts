import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit {

  notifications: any[] = [];
  notificationsFiltrees: any[] = [];
  recherche = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chargerNotifications();
  }

  chargerNotifications() {
    // 1. On charge d'abord les notifications stockées localement (notre message de retour de livre)
    const sauvegarde = localStorage.getItem('notifications_bibliopy');
    let localNotifs = sauvegarde ? JSON.parse(sauvegarde) : [];

    // On transforme le format local pour qu'il ait une propriété .message comme Django
    localNotifs = localNotifs.map((n: any) => ({
      id: n.id || Date.now(),
      message: n.text, // Aligne 'text' sur 'message' utilisé par ton filtre et ton HTML
      date_creation: n.date || new Date(),
      lu: n.lu
    }));

    // 2. On charge ensuite les notifications depuis ton API Django
    const etudiantId = localStorage.getItem('etudiant_id');
    if (!etudiantId) {
      // Si pas d'étudiant connecté, on affiche au moins les notifs locales
      this.notifications = localNotifs;
      this.notificationsFiltrees = [...localNotifs];
      return;
    }

    this.http.get<any[]>(`http://localhost:8000/api/notifications/?etudiant=${etudiantId}`)
      .subscribe({
        next: (data) => {
          // 3. COMBINAISON : On fusionne les notifs locales ET les notifs de Django !
          // Les plus récentes (locales) apparaissent en premier
          this.notifications = [...localNotifs, ...data];
          this.notificationsFiltrees = [...this.notifications];
          
          this.cdr.detectChanges(); // Force la mise à jour visuelle d'Angular
        },
        error: (err) => {
          console.error('Erreur notifications Django :', err);
          // Même si Django a une erreur, on affiche quand même les locales
          this.notifications = localNotifs;
          this.notificationsFiltrees = [...localNotifs];
          this.cdr.detectChanges();
        }
      });
  }

  filtrer() {
    const q = this.recherche.toLowerCase();
    this.notificationsFiltrees = this.notifications.filter(n =>
      n.message && n.message.toLowerCase().includes(q)
    );
  }
}