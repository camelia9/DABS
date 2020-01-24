import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

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
  private reqBody: { password: FormGroup; name: FormGroup; email: FormGroup };
  public userJSONLD: any;

  constructor(private _formBuilder: FormBuilder, private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar, private $router: Router) {
  }

  ngOnInit() {

    this.nameForm = this._formBuilder.group({
      nameCtrl: ['', Validators.nullValidator]
    });
    this.emailForm = this._formBuilder.group({
      emailCtrl: ['', Validators.nullValidator]
    });
    this.passForm = this._formBuilder.group({
      passCtrl: ['', Validators.nullValidator]
    });
    this.passCfForm = this._formBuilder.group({
      passCfCtrl: ['', Validators.nullValidator]
    });
    // make request to get user data
    this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/users',
      {
        params: {
          user_id: this.$cookies.get('user_id')
        }
      })
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.userJSONLD = {
          '@context': 'http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2',
          '@type': 'User'
        };
        this.userJSONLD.email = res.email;
        this.userJSONLD.name = res.name;
        this.nameForm.get('nameCtrl').patchValue(res.name);
        this.emailForm.get('emailCtrl').patchValue(res.email);
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Retrieving user data failed. Try again later.');
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

    if (this.passForm.value.passCtrl !== this.passCfForm.value.passCfCtrl) {
      this.openSnackBar('Please make sure passwords correspond.');
      return;
    }

    if (!this.emailForm.value.emailCtrl && !this.nameForm.value.nameCtrl && !this.passForm.value.passCtrl) {
      this.openSnackBar('Fill in some fields in order to update your data.');
      return;
    }

    this.reqBody = {
      name: this.nameForm.value.nameCtrl,
      email: this.emailForm.value.emailCtrl,
      password: this.passForm.value.passCtrl
    };

    if (!this.emailForm.value.emailCtrl) {
      delete this.reqBody.email;
    }

    if (!this.nameForm.value.nameCtrl) {
      delete this.reqBody.name;
    }

    if (!this.passForm.value.passCtrl) {
      delete this.reqBody.password;
    }

    this.$http.put(environment.LAMBDAS_API_ENDPOINT + '/users?user_id=' + this.$cookies.get('user_id'), this.reqBody, {
      headers: {
        'X-Client-ID': this.$cookies.get('user_token')
      }
    })
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.openSnackBar('Updating user succeeded.');
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Updating user data failed. Try again later.');
      });
  }


  deleteAccount() {
    this.$http.delete(environment.LAMBDAS_API_ENDPOINT + '/users?user_id=' + this.$cookies.get('user_id'), {
      headers: {
        'X-Client-ID': this.$cookies.get('user_token')
      }
    })
      .toPromise()
      .then((res: any) => {
        console.log(res);
        this.openSnackBar('Deleting user succeeded.');
        this.$cookies.delete('user_token');
        this.$cookies.delete('user_id');
        this.$router.navigate(['/login'])
          .then();
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Deleting user data failed. Try again later.');
      });
  }
}
