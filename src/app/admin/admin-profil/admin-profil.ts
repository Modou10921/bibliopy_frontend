import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profil',
  templateUrl: './admin-profil.html',
  styleUrls: ['./admin-profil.css']
})
export class AdminProfilComponent implements OnInit {
  
  prenomAdmin: string = ''; 
  nomAdmin: string = '';
  emailAdmin: string = '';
  motDePasseMasque: string = '............';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.chargerDonneesAdmin();
  }

  chargerDonneesAdmin() {
    // On cherche sous absolument TOUTES les clés possibles de session
    const userString = localStorage.getItem('user') || 
                       localStorage.getItem('currentUser') || 
                       localStorage.getItem('auth_user') || 
                       localStorage.getItem('session_user');
    
    if (userString) {
      const user = JSON.parse(userString);
      console.log("Lecture du profil de l'utilisateur :", user);

      this.emailAdmin = user.email || '';

      // Extraction des propriétés natives Django
      this.prenomAdmin = user.first_name || user.prenom || '';
      this.nomAdmin = user.last_name || user.nom || '';
      
      // 🛠️ ALGORITHME DE SECOURS AUTOMATIQUE
      if (!this.prenomAdmin || this.prenomAdmin === 'Admin') {
        const partieGauche = this.emailAdmin.split('@')[0]; 
        
        if (partieGauche.includes('.')) {
          const morceaux = partieGauche.split('.');
          this.prenomAdmin = morceaux[0].charAt(0).toUpperCase() + morceaux[0].slice(1);
          this.nomAdmin = morceaux[1].toUpperCase();
        } else {
          this.prenomAdmin = partieGauche.charAt(0).toUpperCase() + partieGauche.slice(1);
          this.nomAdmin = "Administrateur";
        }
      }
    } else {
      // 🚨 VALEURS PAR DÉFAUT CORRIGÉES : On n'affiche plus l'ancien nom pour éviter les confusions
      this.prenomAdmin = "Admin";
      this.nomAdmin = "Connecté";
      this.emailAdmin = "oluodomm@gmail.com"; 
    }
  }

  // 📥 AJOUTE CETTE MÉTHODE POUR LA FLÈCHE DE RETOUR (←)
  retourAuDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  // 📥 AJOUTE CETTE MÉTHODE POUR LE BOUTON ROUGE DE DÉCONNEXION
  seDeconnecter() {
    console.log("Déconnexion de l'administrateur...");
    localStorage.clear(); // Supprime les données de session proprement
    this.router.navigate(['/connexion']); 
  }
}