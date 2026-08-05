import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css'
})
export class StatistiquesComponent implements OnInit {

  stats: any = null;
  loading = true;
  empruntsParMois: { label: string; valeur: number; pct: number }[] = [];
  topLivres: string[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerStats();
    this.chargerTopLivres();
    this.chargerStatsMois(); // ✅ ajouté
  }

  chargerStats() {
    this.http.get<any>('http://localhost:8000/api/stats/').subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerTopLivres() {
    this.http.get<any[]>('http://localhost:8000/api/demande-emprunt/').subscribe({
      next: (data) => {
        const compteur: { [key: string]: number } = {};
        data.forEach(d => {
          const titre = d.livre_details?.titre;
          if (titre) {
            compteur[titre] = (compteur[titre] || 0) + 1;
          }
        });
        this.topLivres = Object.entries(compteur)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([titre]) => titre);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  chargerStatsMois() {
    this.http.get<any[]>('http://localhost:8000/api/emprunts-par-mois/').subscribe({
      next: (data) => {
        const max = Math.max(...data.map(d => d.nombre), 1);
        this.empruntsParMois = data.map(d => ({
          label: d.mois,
          valeur: d.nombre,
          pct: Math.round(d.nombre / max * 100)
        }));
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getBarColor(pct: number): string {
    if (pct <= 30) return '#ef4444';
    if (pct <= 50) return '#f97316';
    if (pct <= 70) return '#eab308';
    if (pct <= 85) return '#84cc16';
    return '#22c55e';
  }

  retour() {
    this.router.navigate(['/admin/dashboard']);
  }
}