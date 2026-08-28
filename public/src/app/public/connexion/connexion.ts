import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth'; 

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIf],
  templateUrl: './connexion.html',
  styleUrls: ['./connexion.css']
})
export class ConnexionComponent {

  credentials = {
    email: '',
    password: '',
    isEtudiant: true
  };

  erreurMessage = '';
  showPassword: boolean = false; // Gère l'état d'affichage du mot de passe

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    console.log('Tentative de connexion avec :', this.credentials);

    const isAdmin = !this.credentials.isEtudiant;

    this.authService.login(this.credentials.email, this.credentials.password, isAdmin)
      .subscribe({
        next: (reponse: any) => { 
          console.log('REPONSE COMPLETE :', JSON.stringify(reponse));
          const token = reponse.token || reponse.access;
          
          const utilisateur = {
            first_name: reponse.user?.prenom || reponse.user?.first_name || '',
            last_name: reponse.user?.nom || reponse.user?.last_name || '',
            email: reponse.user?.email || this.credentials.email,
            is_admin: reponse.user?.is_admin || reponse.user?.is_staff || reponse.user?.is_superuser || false
          };

          this.authService.sauvegarderSession(token, utilisateur);
          localStorage.setItem('access_token', token);
          localStorage.setItem('user', JSON.stringify(utilisateur));

          if (utilisateur.is_admin || isAdmin) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            localStorage.setItem('etudiant_id', reponse.user?.id || '');
            localStorage.setItem('etudiant_nom', reponse.user?.nom || reponse.user?.last_name || '');
            this.router.navigate(['/']); 
          }
        },
        error: (erreur: any) => { 
          console.error('Erreur de connexion rencontrée :', erreur);
          if (erreur.status === 0) {
            this.erreurMessage = "Le serveur Django est injoignable.";
          } else {
            this.erreurMessage = erreur.error?.error || 'Identifiants ou rôle incorrects !';
          }
        }
      });
  }
}