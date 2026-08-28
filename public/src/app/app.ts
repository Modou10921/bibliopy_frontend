import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- Vérifiez cet import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <-- Ajoutez-le ici s'il n'y est pas
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'bibliopy-frontend';
}