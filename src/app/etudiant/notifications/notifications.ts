import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    // 1. Charger les notifications stockées en local
    const sauvegarde = localStorage.getItem('notifications_bibliopy');
    let localNotifs = sauvegarde ? JSON.parse(sauvegarde) : [];

    localNotifs = localNotifs.map((n: any) => ({
      id: n.id || Date.now(),
      message: n.text || n.message,
      date_creation: n.date || new Date(),
      lu: n.lu
    }));

    // 2. Charger depuis l'API Render
    const etudiantId = localStorage.getItem('etudiant_id');
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (!etudiantId) {
      this.notifications = localNotifs;
      this.notificationsFiltrees = [...localNotifs];
      return;
    }

    // Préparation des headers de sécurité si un token existe
    let headers = new HttpHeaders();
    if (token) {
      const authHeader = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Token ${token}`;
      headers = headers.set('Authorization', authHeader);
    }

    // ✅ URL mise à jour sur Render
    this.http.get<any[]>(`https://bibliopy-backend.onrender.com/api/notifications/?etudiant=${etudiantId}`, { headers })
      .subscribe({
        next: (data) => {
          // 3. Fusion des notifications
          this.notifications = [...localNotifs, ...data];
          this.notificationsFiltrees = [...this.notifications];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur notifications Django :', err);
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