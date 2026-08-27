import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIf],
  templateUrl: './inscription.html',
  styleUrls: ['./inscription.css']
})
export class InscriptionComponent implements OnInit {
  
  isAdmin: boolean = false;
  showPassword: boolean = false;

  userData = {
    prenom: '',
    nom: '',
    email: '',
    password: '',
    universite: '',
    ine: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.router.url.includes('admin')) {
      this.isAdmin = true;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onRegister() {
    const backendData = {
      username: this.userData.email,
      email: this.userData.email,
      password: this.userData.password,
      prenom: this.userData.prenom,
      nom: this.userData.nom,
      isAdmin: this.isAdmin,
      universite: this.isAdmin ? '' : this.userData.universite,
      ine: this.isAdmin ? '' : this.userData.ine
    };

    console.log("Données envoyées au backend Django :", backendData);

    // Utilisation de AuthService au lieu de l'URL localhost en dur
    this.authService.inscrire(backendData)
      .subscribe({
        next: (reponse) => {
          console.log("Inscription réussie !", reponse);
          alert("Votre compte a bien été créé !");
          
          if (this.isAdmin) {
            this.router.navigate(['/admin/creer-bibliotheque']);
          } else {
            this.router.navigate(['/connexion']);
          }
        },
        error: (erreur) => {
          console.error("Erreur renvoyée par Django :", erreur);
          
          if (erreur.status === 0) {
            alert("Impossible de joindre le serveur Django. Vérifie que ton backend est lancé et que le CORS est activé !");
          } else if (erreur.error && erreur.error.error) {
            alert("Erreur du serveur : " + erreur.error.error);
          } else {
            alert("Une erreur est survenue lors de l'inscription. Vérifie les logs de la console.");
          }
        }
      });
  }
}