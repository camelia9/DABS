import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DabsLoginComponent} from './dabs-login.component';
import {DabsHomeComponent} from './dabs-home.component';
import {IsLoggedInGuard} from './guards/is-logged-in.guard';
import {IsLoggedOutGuard} from './guards/is-logged-out.guard';
import {DabsSignupComponent} from './dabs-signup.component';


const routes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    component: DabsLoginComponent,
    canActivate: [IsLoggedOutGuard]
  },
  {
    path: 'signup',
    pathMatch: 'full',
    component: DabsSignupComponent,
    canActivate: [IsLoggedOutGuard]
  },
  {
    path: '',
    component: DabsHomeComponent,
    canActivate: [IsLoggedInGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
