import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs'; 
import { JWTTokenService } from './jwttoken.service';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router'
// import { LoginService } from './login.service';
 
@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {
  constructor(//private loginService: LoginService,
              private authStorageService: LocalStorageService,
              private jwtService: JWTTokenService,
              private router: Router) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> | Promise<any> | boolean {
      if (this.jwtService.getToken() == null){
        this.jwtService.setToken(this.authStorageService.get('token'));
      }
      if (this.jwtService.getUserName()) {
          if (this.jwtService.isTokenExpired()) {
            this.router.navigate(['/login']);
            // Should Redirect Sig-In Page
          } else {
            return true;
          }
      } 
      else {
        return this.router.navigate(['/login']);
      }
  }
}