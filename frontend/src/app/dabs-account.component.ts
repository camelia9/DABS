import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'dabs-account',
  templateUrl: './dabs-account.component.html',
  styleUrls: ['./dabs-account.component.scss']
})
export class DabsAccountComponent implements OnInit {

  nameForm: FormGroup;
  emailForm: FormGroup;
  passForm: FormGroup;
  passCfForm: FormGroup;
  durationInSeconds = 5;

  constructor(private _formBuilder: FormBuilder, private $http: HttpClient,  private $cookies: CookieService, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.nameForm = this._formBuilder.group({
      nameCtrl: ['', Validators.required]
    });
    this.emailForm = this._formBuilder.group({
      emailCtrl: ['', Validators.required]
    });
    this.passForm = this._formBuilder.group({
      passCtrl: ['', Validators.required]
    });
    this.passCfForm = this._formBuilder.group({
      passCfCtrl: ['', Validators.required]
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

  updateAccount() {
    // this.$http.put(environment.LAMBDAS_API_ENDPOINT + '/users', {},{
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
    //     this.openSnackBar('Updating user data failed. Try again later.');
    //   });
  }


  deleteAccount() {
    // this.$http.delete(environment.LAMBDAS_API_ENDPOINT + '/users', {
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
    //     this.openSnackBar('Deleting user data failed. Try again later.');
    //   });
  }
}
