import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { JWTTokenService } from './jwttoken.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UniversalAppInterceptor implements HttpInterceptor {
 
  constructor( private authService: JWTTokenService) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    req = req.clone({
      url:  req.url,
      setHeaders: {
        Authorization: `JWT ${token}`
      }
    });
    return next.handle(req);
  }
}