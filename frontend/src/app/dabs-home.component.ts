import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'dabs-home',
  templateUrl: './dabs-home.component.html',
  styleUrls: ['./dabs-home.component.scss']
})
export class DabsHomeComponent implements OnInit {
  @ViewChild('dbCanvas', {static: true}) el: ElementRef<HTMLCanvasElement>;
  @ViewChild('envCanvas', {static: true}) elEnv: ElementRef<HTMLCanvasElement>;
  private envChart: Chart;
  private dbChart: Chart;
  private chartColors: any;
  public newsFeed = JSON.parse(localStorage.getItem('CACHED_DATA') || '[]');
  private headers: HttpHeaders;
  durationInSeconds = 5;
  private dbData: { datasets: { backgroundColor: (string)[]; borderColor: string; data: number[]; borderWidth: number }[]; labels: any[] };


  constructor(private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar) {
  }


  renderCharts() {

    // implement request to Metrics API

    this.chartColors = {
      red: 'rgb(255, 99, 132)',
      orange: 'rgb(255, 159, 64)',
      yellow: 'rgb(255, 205, 86)',
      green: 'rgb(75, 192, 192)',
      blue: 'rgb(54, 162, 235)',
      purple: 'rgb(153, 102, 255)',
      grey: 'rgb(201, 203, 207)'
    };

    this.dbData = {
      labels: [],
      datasets: [{
        backgroundColor: [
          this.chartColors.red,
          this.chartColors.green,
          this.chartColors.blue,
          this.chartColors.purple,
          this.chartColors.orange
        ],
        borderColor: this.chartColors.grey,
        borderWidth: 2,
        data: [
          90, 70, 60, 50, 40, 30
        ]
      }]
    };
    // first chart
    this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/metrics')
      .toPromise()
      .then((res: any) => {
        console.log(res);

        this.dbData.labels = Object.keys(res);
        this.dbData.datasets[0].data = Object.values(res);
        console.log(this.dbData);
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Retrieving chart data failed. Try again later.');
      });


    const envData = {
      datasets: [{
        data: [10, 20, 30],
        backgroundColor: [
          this.chartColors.purple,
          this.chartColors.blue,
          this.chartColors.green,
        ],
        borderWidth: 3,
        borderColor: this.chartColors.grey
      }],
      labels: [
        'Desktop',
        'Web',
        'Cloud'
      ]
    };

    this.dbChart = new Chart(this.el.nativeElement, {
      data: this.dbData,
      type: 'bar',
      options: {
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    this.envChart = new Chart(this.elEnv.nativeElement, {
      data: envData,
      type: 'pie',
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
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

  openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  renderNewsFeed() {

    console.log(this.headers);
    this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/newsfeed', {
      headers: {
        'X-Client-ID': this.$cookies.get('user_token')
      }
    })
      .toPromise()
      .then((res: any) => {
        console.log(res);
        const defaults = [
          '../../assets/newsfeed-default-pix.jpg',
          '../../assets/newsfeed-2.jpg',
          '../../assets/newsfeed-3.png',
          '../../assets/newsfeed-4.png',
          '../../assets/newsfeed-5.jpg'
        ];
        this.newsFeed = res.map((item) => {
          const num = Math.floor(Math.random() * 4);
          item.picture = item.hasOwnProperty('picture') ? item.picture : defaults[num];
          return item;
        });
        localStorage.setItem('CACHED_DATA', JSON.stringify(this.newsFeed));
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Retrieving news feed failed. Try again later.');
      });
  }


  ngOnInit(): void {
    this.renderCharts();
    this.renderNewsFeed();
  }


  handleNoIMg(feed: any) {
    const defaults = [
      '../../assets/newsfeed-default-pix.jpg',
      '../../assets/newsfeed-2.jpg',
      '../../assets/newsfeed-3.png',
      '../../assets/newsfeed-4.png',
      '../../assets/newsfeed-5.jpg'
    ];
    const num = Math.floor(Math.random() * 4);

    feed.picture = defaults[num];
  }
}
