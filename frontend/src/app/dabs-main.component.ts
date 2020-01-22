import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'dabs-main',
  templateUrl: './dabs-main.component.html',
  styleUrls: ['./dabs-main.component.scss']
})
export class DabsMainComponent {
  constructor(public $router: Router, private $http: HttpClient, public $cookies: CookieService, private snackBar: MatSnackBar) {
  }

  authType = this.$cookies.get('auth_type');
  durationInSeconds = 5;


  @ViewChild('sidenav', {static: false}) sidenav: MatSidenav;

  openSnackBar(message: string) {
    this.snackBar.open(
      message,
      null, {
        duration: this.durationInSeconds * 1000,
        horizontalPosition: 'right',
      });
  }

  close() {
    this.sidenav.close().then();
  }

  logOut() {
    this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/logout', {
      headers: {
        'X-Client-ID': this.$cookies.get('user_token')
      },
      params: {
        user_token: this.$cookies.get('user_token')
      }
    })
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.$cookies.delete('user_token');
        this.$router.navigate(['/login'])
          .then();
        console.log('Logged Out');
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Log out failed. Try again later.');
      });

  }

}
