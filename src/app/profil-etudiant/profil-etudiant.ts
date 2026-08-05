import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // 👈 1. Importation du Router Angular

@Component({
  selector: 'app-profil-etudiant',
  standalone: true,
  imports: [CommonModule, FormsModule], // Pas besoin de charger RouterLink ici puisqu'on utilise un (click)
  templateUrl: './profil-etudiant.html',
  styleUrls: ['./profil-etudiant.css']
})
export class ProfilEtudiantComponent implements OnInit {
  profil: any = null;
  chargement: boolean = true;
  modeEdition: boolean = false;
  message: string = '';
  erreur: string = '';

  formulaire = {
    nom: '',
    prenom: '',
    email: '',
    nouveau_mot_de_passe: ''
  };

  // 👈 2. Injection du service "router" dans le constructeur
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.chargerProfil();
  }

  // 👈 3. Fonction déclenchée par le clic sur ta flèche HTML
  allerAAccueil(): void {
    this.router.navigate(['/']);
  }

  chargerProfil(): void {
    const id = localStorage.getItem('etudiant_id') || '19';
    this.http.get<any>(`http://localhost:8000/api/profil/?id=${id}`)
      .subscribe({
        next: (data) => {
          this.profil = data;
          this.formulaire.nom = data.nom;
          this.formulaire.prenom = data.prenom;
          this.formulaire.email = data.email;
          this.chargement = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erreur = 'Impossible de charger le profil.';
          this.chargement = false;
          this.cdr.detectChanges();
        }
      });
  }

  sauvegarder(): void {
    const id = localStorage.getItem('etudiant_id') || '19';
    this.http.put<any>(`http://localhost:8000/api/profil/modifier/?id=${id}`, this.formulaire)
      .subscribe({
        next: () => {
          this.message = '✅ Profil mis à jour avec succès !';
          this.erreur = '';
          this.modeEdition = false;
          this.chargerProfil();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erreur = '❌ Erreur lors de la mise à jour.';
          this.message = '';
          this.cdr.detectChanges();
        }
      });
  }
}