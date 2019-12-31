import {Component} from '@angular/core';

@Component({
  selector: 'dabs-signup',
  templateUrl: './dabs-signup.component.html',
  styleUrls: ['./dabs-signup.component.scss']
})
export class DabsSignupComponent {

  constructor() {
  }

  signFormModel = {
    name: '',
    email: '',
    password: '',
    cfPassword: ''
  };

  goSignUp() {
    console.log('Signed up');
  }
}
