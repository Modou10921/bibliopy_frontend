import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

// Composants Publics
import { AccueilComponent } from './public/accueil/accueil';
import { ConnexionComponent } from './public/connexion/connexion';
import { InscriptionComponent } from './public/inscription/inscription';
import { DetailLivreComponent } from './public/detail-livre/detail-livre';
import { DemandeEmpruntComponent } from './demande-emprunt/demande-emprunt';

// Composants Étudiant
import { MonCompteComponent } from './etudiant/mon-compte/mon-compte';
import { ProfilEtudiantComponent } from './profil-etudiant/profil-etudiant';
import { SuiviEmpruntsComponent } from './etudiant/suivi-emprunts/suivi-emprunts';
import { HistoriqueComponent } from './etudiant/historique/historique';
import { Notifications } from './etudiant/notifications/notifications';
import { MesLivresComponent } from './mes-livres/mes-livres';
import { RendreLivreComponent } from './etudiant/rendre-livre/rendre-livre'; 
import { StatistiquesComponent } from './admin/statistiques/statistiques';
import { GestionEmpruntsComponent } from './admin/gestion-emprunts/gestion-emprunts';
import { GestionLivresComponent } from './admin/gestion-livres/gestion-livres';
import { AdminProfilComponent } from './admin/admin-profil/admin-profil';
import { DashboardComponent } from './admin/dashboard/dashboard';
import { CreerBibliothequeComponent } from './creer-bibliotheque/creer-bibliotheque';
import { RetardsComponent } from './admin/retards/retards';
import { EtudiantsAdminComponent } from './admin/etudiants-admin/etudiants-admin';

export const routes: Routes = [
  // 1️⃣ Routes Publiques de basec
  { path: '', component: AccueilComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent }, 
  { path: 'livre/:id', component: DetailLivreComponent },
  { path: 'reserver/:id', component: DemandeEmpruntComponent },

  // 2️⃣ Espace Étudiant (Protégé par authGuard)
  {
    path: 'etudiant',
    canActivate: [authGuard],
    children: [
      { path: 'mon-compte', component: MonCompteComponent },
      { path: 'profil', component: ProfilEtudiantComponent },
      { path: 'suivi-emprunts', component: SuiviEmpruntsComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: 'notifications', component: Notifications },
      { path: 'mes-livres', component: MesLivresComponent },
      
      // 🛠️ CORRECTION ICI : On retire "etudiant/" car il est déjà hérité du parent !
      { path: 'rendre-livre/:id', component: RendreLivreComponent }
    ]
  },

  // 3️⃣ Espace Administration
  {
    path: 'admin',
    children: [
      { path: 'inscription', component: InscriptionComponent },
      { path: 'creer-bibliotheque', component: CreerBibliothequeComponent },

      // Toutes les autres pages admin sécurisées
      { 
        path: '', 
        canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardComponent },
          { path: 'profil', component: AdminProfilComponent },
          { path: 'retards', component: RetardsComponent },
          { path: 'gestion-livres', component: GestionLivresComponent },
          { path: 'gestion-emprunts', component: GestionEmpruntsComponent },
          { path: 'statistiques', component: StatistiquesComponent },
          { path: 'etudiants', component: EtudiantsAdminComponent }  // ← ajoute
        ]
      }
    ]
  },

  // 🚨 Gestion des erreurs de frappe (TOUJOURS EN DERNIER)
  { path: '**', redirectTo: '' }
];