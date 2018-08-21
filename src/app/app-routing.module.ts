import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './services/auth-guard';
import { InitGuard } from './services/init-guard';
import {DiveComponent} from './dive/dive.component';
import {DivesComponent} from './dives/dives.component';
import {PermitComponent} from './permit/permit.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {ProfileFormComponent} from './profile-form/profile-form.component';
const routes: Routes = [{
  path: '',
  canActivate: [InitGuard],
  children: [{
    path: 'login',
    component: LoginComponent
  }, {
    path: 'register',
    component: RegisterComponent
  }, {
    path: 'permit',
    component: PermitComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'profile',
    component: ProfileFormComponent,
    canActivate: [AuthGuard]
  }
    , {
      path: 'statistics',
      component: StatisticsComponent,
      canActivate: [AuthGuard]
    }, {
      path: 'dive',
      component: DiveComponent,
      canActivate: [AuthGuard]
    }
    , {
      path: 'dive/:id',
      component: DiveComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'dives',
      component: DivesComponent,
      canActivate: [AuthGuard]
    },
    {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
    canActivate: [AuthGuard]
  }]
},
{ path: '**', redirectTo: '' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
