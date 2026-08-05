import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-creer-bibliotheque',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './creer-bibliotheque.html',
  styleUrls: ['./creer-bibliotheque.css']
})
export class CreerBibliothequeComponent implements OnInit {
  
  libData = {
    nom_universite: '',
    ville_pays: '',
    adresse: '',
    telephone: '',
    email: ''
  };

  selectedFileName: string = '';
  logoBase64: string = ''; // 🟢 Stockera l'image convertie en texte

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      
      // 🟢 Lecture et conversion du fichier en Base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoBase64 = e.target.result; // Contient la chaîne "data:image/png;base64,..."
        console.log('Image convertie en Base64 avec succès !');
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    // 🟢 On crée un objet JSON simple à envoyer à Django
    const payload = {
      nom_universite: this.libData.nom_universite,
      ville_pays: this.libData.ville_pays,
      adresse: this.libData.adresse,
      telephone: this.libData.telephone,
      email: this.libData.email,
      logo_url: this.logoBase64 // 👈 On envoie l'image sous forme de texte ici !
    };

    this.http.post('http://localhost:8000/api/bibliotheque/', payload)
      .subscribe({
        next: (response: any) => {
          console.log('Bibliothèque créée avec succès !', response);
          localStorage.setItem('access_token', 'fake-jwt-token-admin');
          localStorage.setItem('user', JSON.stringify({ is_admin: true, email: this.libData.email }));
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error: any) => {
          console.error('Erreur lors de l\'envoi :', error);
          localStorage.setItem('access_token', 'fake-jwt-token-admin');
          localStorage.setItem('user', JSON.stringify({ is_admin: true }));
          this.router.navigate(['/admin/dashboard']);
        }
      });
  }
}