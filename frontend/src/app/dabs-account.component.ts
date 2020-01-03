import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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

  constructor(private _formBuilder: FormBuilder) {
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


  updateAccount() {

  }

}
