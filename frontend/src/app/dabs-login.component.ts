import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppModule} from './app.module';
import { sha256 } from 'js-sha256';
import {Validators} from '@angular/forms';


@Component({
  selector: 'dabs-login',
  templateUrl: './dabs-login.component.html',
  styleUrls: ['./dabs-login.component.scss']
})


export class DabsLoginComponent {

  durationInSeconds = 5;

  constructor(private $http: HttpClient, private $cookies: CookieService, private $router: Router, private snackBar: MatSnackBar) {
  }

  authFormModel = {
    email: '',
    password: ''
  };

  private req: { password: any; auth_type: string; email: any };

  openSnackBar(message: string) {
    this.snackBar.open(
      message,
      null, {
        duration: this.durationInSeconds * 1000,
        horizontalPosition: 'right',
      });
  }

  goSignUp() {
    this.$router.navigate(['/signup'])
      .then();
  }

  goHome() {

    this.req = {
      email: this.authFormModel.email,
      password: sha256(this.authFormModel.password),
      auth_type: 'own'
    };

    console.log(this.req);

    this.$http.post(AppModule.API_ENDPOINT + '/login', this.req)
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.$cookies.set('user_token', res.user_token);
        this.$router.navigate(['/'])
          .then();
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Login failed. Try again later.');
      });
  }
}
