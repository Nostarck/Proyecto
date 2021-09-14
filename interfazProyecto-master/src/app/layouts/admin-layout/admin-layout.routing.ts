import { Routes } from '@angular/router';

import { LabelComponent } from '../../pages/label/label.component'
import { GroupsComponent } from '../../pages/groups/groups.component';
import { StudentComponent } from '../../pages/students/student.component';
import { StudentProfileComponent } from '../../pages/student-profile/student-profile.component'
import { ProblemasComponent } from '../../pages/problemas/problemas.component';
import { AuthorizeGuard } from '../../services/authorize-guard.service';

// export const AdminLayoutRoutes: Routes = [
//     { path: 'labels',      component: LabelComponent },
//     { path: 'student-profile',   component: StudentProfileComponent },
//     { path: 'problemas',         component: ProblemasComponent },
//     { path: 'groups',          component: GroupsComponent },
//     { path: 'students',           component: StudentComponent }
// ];

export const AdminLayoutRoutes: Routes = [
    { path: 'labels',      component: LabelComponent, canActivate: [AuthorizeGuard] },
    { path: 'student-profile/:id',   component: StudentProfileComponent, canActivate: [AuthorizeGuard] },
    { path: 'problemas',         component: ProblemasComponent, canActivate: [AuthorizeGuard] },
    { path: 'groups',          component: GroupsComponent, canActivate: [AuthorizeGuard] },
    { path: 'students',           component: StudentComponent, canActivate: [AuthorizeGuard] }
];
