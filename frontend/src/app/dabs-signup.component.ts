import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {sha256} from 'js-sha256';
import {AppModule} from './app.module';
import {environment} from '../environments/environment';

@Component({
  selector: 'dabs-signup',
  templateUrl: './dabs-signup.component.html',
  styleUrls: ['./dabs-signup.component.scss']
})
export class DabsSignupComponent {

  durationInSeconds = 5;
  private headers: HttpHeaders;

  constructor(private $http: HttpClient, private $cookies: CookieService, private $router: Router, private snackBar: MatSnackBar) {
  }

  private req: { password: any; name: string; email: any };

  signFormModel = {
    name: '',
    email: '',
    password: '',
    cfPassword: ''
  };

  goSignUp() {

    if (!this.signFormModel.password || !this.signFormModel.password || !this.signFormModel.email || !this.signFormModel.name){
      this.openSnackBar('Please fill in all the fields.');
      return;
    }

    if (this.signFormModel.password !== this.signFormModel.cfPassword) {
      this.openSnackBar('Confirm password does not match. Make sure they are the same.');
      return;
    }

    this.req = {
      email: this.signFormModel.email,
      password: this.signFormModel.password,
      name: this.signFormModel.name
    };

    console.log(this.req);

    this.$http.post(environment.LAMBDAS_API_ENDPOINT + '/users', this.req)
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.openSnackBar('Signed up.. Redirecting to login...');
        setTimeout(() => {
              this.$router.navigate(['/login'])
                .then();
            }, 6000);
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Creating user failed. Try again later.');
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(
      message,
      null, {
        duration: this.durationInSeconds * 1000,
        horizontalPosition: 'right',
      });
  }

}
