import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './mon-compte.html',
  styleUrl: './mon-compte.css'
})
export class MonCompteComponent implements OnInit {
  profil: any = null;
  estEnChargement: boolean = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.chargerProfil();
  }

  chargerProfil() {
    const etudiantId = localStorage.getItem('etudiant_id') || '24';
    
    this.http.get<any>(`${environment.apiUrl}profil/?id=${etudiantId}`).subscribe({
      next: (data) => {
        this.profil = data;
        this.estEnChargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur API profil :", err);
        this.estEnChargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  deconnecter() {
    localStorage.removeItem('etudiant_id');
    localStorage.removeItem('etudiant_nom');
    localStorage.removeItem('etudiant_prenom');
    this.router.navigate(['/connexion']);
  }
}