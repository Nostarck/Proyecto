import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { LabelComponent } from '../../pages/label/label.component'
import { GroupsComponent } from '../../pages/groups/groups.component';
import { StudentComponent } from '../../pages/students/student.component';
import { StudentProfileComponent} from '../../pages/student-profile/student-profile.component';
import { ProblemasComponent } from '../../pages/problemas/problemas.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material/material.module';
// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [
    LabelComponent,
    StudentProfileComponent,
    ProblemasComponent,
    GroupsComponent,
    StudentComponent
  ]
})

export class AdminLayoutModule {}
