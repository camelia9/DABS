import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'dabs-playground',
  templateUrl: './dabs-playground.component.html',
  styleUrls: ['./dabs-playground.component.scss']
})
export class DabsPlaygroundComponent implements OnInit, AfterViewInit {

  constructor(private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar) {
  }

  dbType = 'MongoDB';
  command = '';
  urlEndpoint = '';
  durationInSeconds = 5;


  @ViewChild('term', {static: true}) child: NgTerminal;

  openSnackBar(message: string) {
    this.snackBar.open(
      message,
      null, {
        duration: this.durationInSeconds * 1000,
        horizontalPosition: 'right',
      });
  }

  ngAfterViewInit() {
    this.child.write('\r\n' +
      ' /$$      /$$  /$$$$$$  /$$$$$$$                  /$$$$$$$            /$$                \r\n' +
      '| $$  /$ | $$ /$$__  $$| $$__  $$                | $$__  $$          | $$                \r\n' +
      '| $$ /$$$| $$| $$  \\ $$| $$  \\ $$  /$$$$$$       | $$  \\ $$  /$$$$$$ | $$$$$$$   /$$$$$$$\r\n' +
      '| $$/$$ $$ $$| $$$$$$$$| $$  | $$ /$$__  $$      | $$  | $$ |____  $$| $$__  $$ /$$_____/\r\n' +
      '| $$$$_  $$$$| $$__  $$| $$  | $$| $$$$$$$$      | $$  | $$  /$$$$$$$| $$  \\ $$|  $$$$$$ \r\n' +
      '| $$$/ \\  $$$| $$  | $$| $$  | $$| $$_____/      | $$  | $$ /$$__  $$| $$  | $$ \\____  $$\r\n' +
      '| $$/   \\  $$| $$  | $$| $$$$$$$/|  $$$$$$$      | $$$$$$$/|  $$$$$$$| $$$$$$$/ /$$$$$$$/\r\n' +
      '|__/     \\__/|__/  |__/|_______/  \\_______/      |_______/  \\_______/|_______/ |_______/ \r\n' +
      '                                                                                         \r\n' +
      '                                                                                         \r\n' +
      '                                                                                         \r\n');
    this.child.write('\r\n');
    this.child.write('Welcome to Dabs Playground! You can test one of the ' +
      'dropdown databases by giving specific commands.');
    if (this.dbType === 'PostgreSQL') {
      this.child.write('\r\nType \\help to get started!');
    } else {
      this.child.write('\r\nType help to get started!');
    }

    this.child.write('\r\n\r\n$ ');

    this.child.keyEventInput.subscribe(e => {
      console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        // send data to backend

        if (this.dbType === 'MongoDB') {
          this.urlEndpoint = environment.PLAYGROUND_API_ENDPOINT + '/mongo';
        }

        if (this.dbType === 'Redis') {
          this.urlEndpoint = environment.PLAYGROUND_API_ENDPOINT + '/redis';
        }

        if (this.dbType === 'PostgreSQL') {
          this.urlEndpoint = environment.PLAYGROUND_API_ENDPOINT + '/psql';
        }

        // should replace with user token
        this.$http.post(this.urlEndpoint, {command: this.command, authorizationToken: this.$cookies.get('user_token')})
          .toPromise()
          .then((res: any) => {
            console.log(res);
            this.child.write('\r\n');
            this.child.write(res.data);
            this.child.write('\r\n$ ');
            this.command = '';
          })
          .catch((err) => {
            console.error(err);
            this.openSnackBar('Command could not be executed. Try again later.');
            this.child.write('\r\n$ ');
            this.command = '';
          });
      } else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (this.child.underlying.buffer.cursorX > 2) {
          this.child.write('\b \b');
        }
      } else if (printable) {
        this.command += e.key;
        this.child.write(e.key);
      }
    });
  }

  ngOnInit() {
  }

  clearTerminal() {
    this.child.underlying.clear();
    this.child.write('\r\n' +
      ' /$$      /$$  /$$$$$$  /$$$$$$$                  /$$$$$$$            /$$                \r\n' +
      '| $$  /$ | $$ /$$__  $$| $$__  $$                | $$__  $$          | $$                \r\n' +
      '| $$ /$$$| $$| $$  \\ $$| $$  \\ $$  /$$$$$$       | $$  \\ $$  /$$$$$$ | $$$$$$$   /$$$$$$$\r\n' +
      '| $$/$$ $$ $$| $$$$$$$$| $$  | $$ /$$__  $$      | $$  | $$ |____  $$| $$__  $$ /$$_____/\r\n' +
      '| $$$$_  $$$$| $$__  $$| $$  | $$| $$$$$$$$      | $$  | $$  /$$$$$$$| $$  \\ $$|  $$$$$$ \r\n' +
      '| $$$/ \\  $$$| $$  | $$| $$  | $$| $$_____/      | $$  | $$ /$$__  $$| $$  | $$ \\____  $$\r\n' +
      '| $$/   \\  $$| $$  | $$| $$$$$$$/|  $$$$$$$      | $$$$$$$/|  $$$$$$$| $$$$$$$/ /$$$$$$$/\r\n' +
      '|__/     \\__/|__/  |__/|_______/  \\_______/      |_______/  \\_______/|_______/ |_______/ \r\n' +
      '                                                                                         \r\n' +
      '                                                                                         \r\n' +
      '                                                                                         \r\n');
    this.child.write('\rWelcome to Dabs Playground! You can test one of the ' +
      'dropdown databases by giving specific commands.');
    if (this.dbType === 'PostgreSQL') {
      this.child.write('\r\nType \\help to get started!');
    } else {
      this.child.write('\r\nType help to get started!');
    }
    this.child.write('\r\n\r\n$ ');
  }

}
