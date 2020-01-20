import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'dabs-main',
  templateUrl: './dabs-main.component.html',
  styleUrls: ['./dabs-main.component.scss']
})
export class DabsMainComponent {
  constructor(public $router: Router, public $cookies: CookieService) {
  }

  authType = this.$cookies.get('auth_type');

  @ViewChild('sidenav', {static: false}) sidenav: MatSidenav;

  close() {
    this.sidenav.close().then();
  }

  logOut() {
    // this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/logout', {
    //   headers: {
    //     'X-Client-ID': this.$cookies.get('user_token')
    //   }
    // })
    //   .toPromise()
    //   .then((res: any) => {
    //     console.log(res);
    //     // format chart data
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     this.openSnackBar('Log out failed. Try again later.');
    //   });
    this.$cookies.delete('user_token');
    this.$router.navigate(['/login'])
      .then();
    console.log('Logged Out');
  }

}
