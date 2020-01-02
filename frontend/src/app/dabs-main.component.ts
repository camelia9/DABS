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

  @ViewChild('sidenav', {static: false}) sidenav: MatSidenav;

  close() {
    this.sidenav.close().then();
  }

  logOut() {
    this.$cookies.delete('user_token');
    this.$router.navigate(['/login'])
      .then();
    console.log('Logged Out');
  }

}
