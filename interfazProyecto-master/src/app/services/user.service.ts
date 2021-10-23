import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { JWTTokenService } from './jwttoken.service';
import { LocalStorageService } from './local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  userValue: Boolean = false;

  constructor(private http: HttpClient, private jwtService: JWTTokenService, private localStorageService: LocalStorageService) { }

  login(username: string, password: string): Observable<any> {
    const body = { username: username, password: password };
    return this.http.post<any>('http://localhost:3000/user/login', body);
  }

  isTokenExpired() {
    return this.jwtService.isTokenExpired();
  }

  logout() {
    this.userValue = false;
    this.jwtService.removeToken();
    this.localStorageService.remove('token');
  }
}
