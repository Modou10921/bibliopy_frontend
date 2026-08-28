import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-livre',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './detail-livre.html',
  styleUrls: ['./detail-livre.css']
})
export class DetailLivreComponent implements OnInit {
  livre: any = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const idLivre = this.route.snapshot.paramMap.get('id');
    if (idLivre) {
      this.http.get<any>(`${environment.apiUrl}livres/${idLivre}/`).subscribe({
        next: (donnees) => {
          this.livre = donnees;
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Erreur de chargement :", err)
      });
    }
  }

  reserverLivre() {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (token) {
      console.log("✅ Étudiant connecté. Redirection vers la route 'reserver'...");
      // ✨ Corrigé : on utilise le chemin exact défini dans ton fichier de routage
      this.router.navigate(['/reserver', this.livre.id]);
    } else {
      console.warn("❌ Aucun token trouvé. Redirection vers la connexion.");
      this.router.navigate(['/connexion']);
    }
  }
}