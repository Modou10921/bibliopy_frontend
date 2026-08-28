import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-gestion-livres',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule ],
  templateUrl: './gestion-livres.html',
  styleUrl: './gestion-livres.css'
})
export class GestionLivresComponent implements OnInit {

  livres: any[] = [];
  livresFiltres: any[] = [];
  recherche = '';
  loading = true;
  erreur = '';
  succes = '';

  // Modal ajout / modification
  showModal = false;
  modeEdition = false;
  livreEnEdition: any = null;

  // 📝 OBJET ALIGNÉ SUR LES CHAMPS DJANGO
  form = {
    isbn: '',
    titre: '',
    auteur: '',
    categorie: '',         // ◄ Corrigé : 'genre' devient 'categorie'
    date_publication: '',   // ◄ Corrigé : 'annee_publication' devient 'date_publication'
    image: ''               // ◄ Optionnel : Ajuste selon ton champ de modèle Django (ex: 'image')
  };

  // Liste des catégories (doit correspondre à tes choix ou aux textes attendus par Django)
  categories = [
    'Oeuvre littéraire', 'Science Fiction', 'Nostalgie, Romantique',
    'Oeuvre culinaire', 'Historique', 'Roman', 'Développement personnel'
  ];

  // Modal suppression
  showModalSuppression = false;
  idASupprimer: number | null = null;

  constructor(
  private adminService: AdminService,
  private router: Router,
  private http: HttpClient,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit() {
    this.chargerLivres();
  }

  chargerLivres() {
  this.loading = true;
  this.http.get<any[]>('https://bibliopy-backend.onrender.com/api/livres/').subscribe({
    next: (data) => {
      this.livres = data;
      this.livresFiltres = data;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.erreur = 'Erreur lors du chargement des livres.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  filtrer() {
    const q = this.recherche.toLowerCase();
    this.livresFiltres = this.livres.filter(l =>
      l.titre.toLowerCase().includes(q) ||
      l.categorie?.toLowerCase().includes(q) ||
      l.auteur?.toLowerCase().includes(q)
    );
  }

  ouvrirAjout() {
    this.modeEdition = false;
    this.livreEnEdition = null;
    this.erreur = '';
    this.form = { 
      isbn: '', 
      titre: '', 
      auteur: '', 
      categorie: '', 
      date_publication: '', 
      image: '' 
    };
    this.showModal = true;
  }

  ouvrirEdition(livre: any) {
    this.modeEdition = true;
    this.livreEnEdition = livre;
    this.erreur = '';
    this.form = {
      isbn: livre.isbn || '',
      titre: livre.titre,
      auteur: livre.auteur,
      categorie: livre.categorie || '',
      date_publication: livre.date_publication || '',
      image: livre.image || ''
    };
    this.showModal = true;
  }

  fermerModal() {
    this.showModal = false;
    this.livreEnEdition = null;
  }

  enregistrer() {
    this.erreur = '';
    
    if (!this.form.titre.trim()) {
      this.erreur = 'Le titre est obligatoire.';
      return;
    }
    if (!this.form.isbn.trim()) {
      this.erreur = "L'ISBN est obligatoire.";
      return;
    }

    if (this.modeEdition && this.livreEnEdition) {
      this.adminService.modifierLivre(this.livreEnEdition.id, this.form).subscribe({
        next: () => {
          this.succes = 'Livre modifié avec succès.';
          this.fermerModal();
          this.chargerLivres();
          setTimeout(() => this.succes = '', 3000);
        },
        error: () => { this.erreur = 'Erreur lors de la modification.'; }
      });
    } else {
      this.adminService.ajouterLivre(this.form).subscribe({
        next: () => {
          this.succes = 'Livre ajouté avec succès.';
          this.fermerModal();
          this.chargerLivres();
          setTimeout(() => this.succes = '', 3000);
        },
        error: () => { this.erreur = "Erreur lors de l'ajout. Vérifiez les champs requis."; }
      });
    }
  }

  demanderSuppression(id: number) {
    this.idASupprimer = id;
    this.showModalSuppression = true;
  }

  confirmerSuppression() {
    if (this.idASupprimer === null) return;
    this.adminService.supprimerLivre(this.idASupprimer).subscribe({
      next: () => {
        this.succes = 'Livre supprimé.';
        this.showModalSuppression = false;
        this.idASupprimer = null;
        this.chargerLivres();
        setTimeout(() => this.succes = '', 3000);
      },
      error: () => { this.erreur = 'Erreur lors de la suppression.'; }
    });
  }

  annulerSuppression() {
    this.showModalSuppression = false;
    this.idASupprimer = null;
  }

  retour() {
    this.router.navigate(['/admin/dashboard']);
  }
}