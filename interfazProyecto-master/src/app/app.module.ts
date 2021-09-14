import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { DasbhoardComponent } from './dasbhoard/dasbhoard.component';
import { ExpansionComponent } from './dashboard/expansion/expansion.component';
import { MaterialModule } from './material/material.module';

import { GroupsService } from './services/groups.service';
import { LabelsService } from './services/labels.service';
import { ProblemsService } from './services/problems.service';
import { StudentsService } from './services/students.service';
import { UserService } from './services/user.service';

import { AuthorizeGuard } from './services/authorize-guard.service';
import { JWTTokenService } from './services/jwttoken.service';
import { LocalStorageService } from './services/local-storage.service';
import { UniversalAppInterceptor } from './services/universal-app-interceptor.service';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    DasbhoardComponent,
    ExpansionComponent
  ],
  providers: [
    NgbActiveModal,
    GroupsService,
    ProblemsService,
    StudentsService,
    UserService,
    AuthorizeGuard,
    JWTTokenService,
    LocalStorageService,
    { provide: HTTP_INTERCEPTORS, useClass: UniversalAppInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
