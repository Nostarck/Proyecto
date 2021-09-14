import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { JWTTokenService } from '../../services/jwttoken.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  public returnUrl: string;
  public username: string;

  constructor(
    location: Location, 
    private element: ElementRef, 
    private router: Router, 
    private userService: UserService, 
    private jwtService: JWTTokenService
  ) {
    this.location = location;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    this.username = this.jwtService.getUserName().toUpperCase();
  }

  getTitle(){
    var title = "";
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    if (titlee.split("/")[1] == "student-profile"){
      title = "Perfil de estudiante"
    }
    return title;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
