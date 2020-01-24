import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppModule} from './app.module';
import {sha256} from 'js-sha256';
import {Validators} from '@angular/forms';
import {environment} from '../environments/environment';


@Component({
  selector: 'dabs-login',
  templateUrl: './dabs-login.component.html',
  styleUrls: ['./dabs-login.component.scss']
})


export class DabsLoginComponent {

  durationInSeconds = 5;
  private headers: HttpHeaders;

  constructor(private $http: HttpClient, private $cookies: CookieService, private $router: Router, private snackBar: MatSnackBar) {
  }

  authFormModel = {
    email: '',
    password: ''
  };

  private req: { password: any; email: any };

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
      password: this.authFormModel.password
    };

    console.log(this.req);


    this.$http.post(environment.LAMBDAS_API_ENDPOINT + '/login', this.req)
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.$cookies.set('user_token', res.user_token);
        this.$cookies.set('user_id', res.user_id);
        this.$router.navigate(['/'])
          .then();
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Login failed. Try again later.');
      });
  }
}
