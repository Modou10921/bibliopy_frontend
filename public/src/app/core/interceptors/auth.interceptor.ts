import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupère le token stocké lors du login
    const token = localStorage.getItem('access_token');

    // Si le token est là, on l'injecte dans le header pour Django
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Token ${token}`)
      });
      console.log("Intercepteur : Token ajouté à la requête HTTP !");
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}