import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService } from '../../services/user.service';

import { LocalStorageService } from '../../services/local-storage.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private localStorageService: LocalStorageService
  ) {
    // redirect to home if already logged in
    if (this.userService.userValue && !this.userService.isTokenExpired()) { 
        this.router.navigate(['/groups']);
    }
    this.userService.userValue = false;
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/groups';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.userService.login(this.f.username.value, this.f.password.value)
        .pipe(first())
        .subscribe(
            data => {
              this.localStorageService.set('token', data.token);
              this.userService.userValue = true;
              this.loading = false;
            },
            error => {
                this.error = "El nombre de usuario o la contraseña son inválidas";
                console.log(error);
                this.loading = false;
            },
            () => {
              this.router.navigate([this.returnUrl]);
            }
          );
  }

  ngOnDestroy() {
  }

}
