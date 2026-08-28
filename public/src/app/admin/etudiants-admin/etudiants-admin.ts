import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-etudiants-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './etudiants-admin.html',
  styleUrls: ['./etudiants-admin.css']
})
export class EtudiantsAdminComponent implements OnInit {

  etudiants: any[] = [];
  estEnChargement: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerEtudiants();
  }

  chargerEtudiants() {
    this.http.get<any[]>(environment.apiUrl + 'etudiants/').subscribe({
      next: (data) => {
        this.etudiants = data;
        this.estEnChargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement étudiants :', err);
        this.estEnChargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  retourDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}