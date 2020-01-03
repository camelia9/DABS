import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';

@Component({
  selector: 'dabs-playground',
  templateUrl: './dabs-playground.component.html',
  styleUrls: ['./dabs-playground.component.scss']
})
export class DabsPlaygroundComponent implements OnInit, AfterViewInit {
  dbType = 'MongoDB';

  @ViewChild('term', {static: true}) child: NgTerminal;

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
    if (this.dbType === 'MongoDB') {
      this.child.write('\r\nType mongo --help to get started!');
    }
    if (this.dbType === 'Redis') {
      this.child.write('\r\nType redis-cli --help to get started!');
    }
    if (this.dbType === 'PostgreSQL') {
      this.child.write('\r\nType psql --help to get started!');
    }
    this.child.write('\r\n\r\n$ ');

    this.child.keyEventInput.subscribe(e => {
      console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        // send data to backend
        this.child.write('\r\n$ ');
      } else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (this.child.underlying.buffer.cursorX > 2) {
          this.child.write('\b \b');
        }
      } else if (printable) {
        this.child.write(e.key);
      }
    });
  }

  constructor() {
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
    if (this.dbType === 'MongoDB') {
      this.child.write('\r\nType mongo --help to get started!');
    }
    if (this.dbType === 'Redis') {
      this.child.write('\r\nType redis-cli --help to get started!');
    }
    if (this.dbType === 'PostgreSQL') {
      this.child.write('\r\nType psql --help to get started!');
    }
    this.child.write('\r\n\r\n$ ');
  }

}
