import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-retards',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './retards.html',
  styleUrl: './retards.css'
})
export class RetardsComponent implements OnInit {
  retards: any[] = [];
  retardsFiltres: any[] = [];
  recherche: string = '';
  loading: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerRetards();
  }

  chargerRetards() {
    this.loading = true;
    this.http.get<any[]>(environment.apiUrl + 'demande-emprunt/').subscribe({
      next: (data) => {
        // 🔴 On ne garde QUE les retards
        this.retards = data.filter(e => e.statut === 'En retard');
        this.retardsFiltres = [...this.retards];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrer() {
    const q = this.recherche.toLowerCase();
    this.retardsFiltres = this.retards.filter(e =>
      e.livre_details?.titre?.toLowerCase().includes(q) ||
      e.etudiant_nom?.toLowerCase().includes(q)
    );
  }

  envoyerNotification(emprunt: any) {
    const titre = emprunt.livre_details?.titre || 'livre';
    const message = `URGENT : Merci de rendre le livre "${titre}" immédiatement. Vous êtes en retard.`;

    this.http.post(environment.apiUrl + 'notifications/', {
      etudiant: emprunt.etudiant,
      livre: emprunt.livre,
      message: message
    }).subscribe({
      next: () => alert('Relance envoyée !'),
      error: () => alert('Erreur lors de l\'envoi.')
    });
  }

  retour() { this.router.navigate(['/admin/dashboard']); }
}