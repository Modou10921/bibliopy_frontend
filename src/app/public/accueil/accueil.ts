import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HttpClientModule],
  templateUrl: './accueil.html',
  styleUrls: ['./accueil.css']
})
export class AccueilComponent implements OnInit {

  tousLesLivres: any[] = [];
  livresFiltres: any[] = [];
  categories: string[] = [];
  filieres: string[] = [];

  termeRecherche: string = '';
  categorieSelectionnee: string | null = null;
  filiereSelectionnee: string | null = null;

  menuCategorieOuvert: boolean = false;
  menuFiliereOuvert: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.chargerLivres();
  }

  @HostListener('document:click', ['$event'])
  fermerMenus(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.menuCategorieOuvert = false;
      this.menuFiliereOuvert = false;
      this.cdr.detectChanges();
    }
  }

  chargerLivres() {
    this.http.get<any[]>('https://bibliopy-backend.onrender.com/api/livres/').subscribe({
      next: (donnees) => {
        this.tousLesLivres = donnees;
        this.livresFiltres = donnees;

        this.categories = [...new Set(
          donnees.map(l => l.categorie).filter(c => c && c.trim() !== '')
        )] as string[];

        this.filieres = [...new Set(
          donnees.map(l => l.filiere).filter(f => f && f.trim() !== '')
        )] as string[];

        console.log('Catégories trouvées :', this.categories);
        console.log('Filières trouvées :', this.filieres);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement livres :', err);
      }
    });
  }

  appliquerFiltrage() {
    this.livresFiltres = this.tousLesLivres.filter(livre => {
      const matchRecherche = !this.termeRecherche ||
        livre.titre?.toLowerCase().includes(this.termeRecherche.toLowerCase()) ||
        livre.auteur?.toLowerCase().includes(this.termeRecherche.toLowerCase());

      const matchCategorie = !this.categorieSelectionnee ||
        (livre.categorie?.toLowerCase().trim() === this.categorieSelectionnee.toLowerCase().trim());

      const matchFiliere = !this.filiereSelectionnee ||
        (livre.filiere?.toLowerCase().trim() === this.filiereSelectionnee.toLowerCase().trim());

      return matchRecherche && matchCategorie && matchFiliere;
    });
    this.cdr.detectChanges();
  }

  estConnecte(): boolean {
    return localStorage.getItem('etudiant_id') !== null;
  }

  toggleMenuCategorie() {
    this.menuCategorieOuvert = !this.menuCategorieOuvert;
    this.menuFiliereOuvert = false;
    console.log('menu ouvert:', this.menuCategorieOuvert);
  }

  toggleMenuFiliere() {
    this.menuFiliereOuvert = !this.menuFiliereOuvert;
    this.menuCategorieOuvert = false;
  }

  filtrerParCategorie(cat: string | null) {
    this.categorieSelectionnee = cat;
    this.menuCategorieOuvert = false;
    this.appliquerFiltrage();
  }

  filtrerParFiliere(fil: string | null) {
    this.filiereSelectionnee = fil;
    this.menuFiliereOuvert = false;
    this.appliquerFiltrage();
  }

  surRechercheChangement() {
    this.appliquerFiltrage();
  }
}