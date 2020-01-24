import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DabsLoginComponent} from './dabs-login.component';
import {DabsHomeComponent} from './dabs-home.component';
import {IsLoggedInGuard} from './guards/is-logged-in.guard';
import {IsLoggedOutGuard} from './guards/is-logged-out.guard';
import {DabsSignupComponent} from './dabs-signup.component';
import {DabsRecommendComponent} from './dabs-recommend.component';
import {DabsPlaygroundComponent} from './dabs-playground.component';
import {DabsMainComponent} from './dabs-main.component';
import {DabsAccountComponent} from './dabs-account.component';


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
    component: DabsMainComponent,
    canActivate: [IsLoggedInGuard],
    children: [
      {
        path: 'home',
        component: DabsHomeComponent
      },
      {
        path: 'recommend',
        component: DabsRecommendComponent
      },
      {
        path: 'playground',
        component: DabsPlaygroundComponent
      },
      {
        path: 'account',
        component: DabsAccountComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
