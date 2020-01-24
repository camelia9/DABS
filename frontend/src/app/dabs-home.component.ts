import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material/snack-bar';

interface MyChartOptions {
  datasets: { backgroundColor: (string)[]; borderColor: string; data: number[]; borderWidth: number }[];
  labels: any[];
}

@Component({
  selector: 'dabs-home',
  templateUrl: './dabs-home.component.html',
  styleUrls: ['./dabs-home.component.scss']
})
export class DabsHomeComponent implements OnInit {
  @ViewChild('dbCanvas', {static: true}) el: ElementRef<HTMLCanvasElement>;
  @ViewChild('envCanvas', {static: true}) elEnv: ElementRef<HTMLCanvasElement>;
  private readonly MAX_DBS = 4;
  private envChart: Chart;
  private dbChart: Chart;
  private chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };
  public newsFeed = JSON.parse(localStorage.getItem('CACHED_DATA') || '[]');
  private headers: HttpHeaders;
  durationInSeconds = 5;
  private dbData: MyChartOptions = {
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
      data: []
    }],
  };
  private envData: MyChartOptions = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#C13FAC',
        '#F72C25',
        '#ABD8AC',
        '#FEC925',
        this.chartColors.purple,
        this.chartColors.orange,
        this.chartColors.red,
        this.chartColors.green,
        this.chartColors.blue,
      ],
      borderWidth: 2,
      borderColor: this.chartColors.grey
    }],
  };


  constructor(private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar) {
  }


  renderCharts() {
    this.dbChart = new Chart(this.el.nativeElement, {
      data: this.dbData,
      type: 'bar',
      options: {
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                suggestedMin: 0
              }
            }
          ]
        }
      },
    });

    this.envChart = new Chart(this.elEnv.nativeElement, {
      data: this.envData,
      type: 'pie',
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: 'right'
        }
      }
    });

    // first chart
    this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/metrics')
      .toPromise()
      .then((res: { stats1: Record<string, number>, stats2: Record<string, number> }) => {
        const sortedData = Object.entries(res.stats1).sort(([aK, aV], [bK, bV]) => bV - aV);
        const filteredData = [
          ...sortedData.slice(0, this.MAX_DBS),
          ['Other', sortedData.slice(this.MAX_DBS).reduce((accum, current) => accum + current[1], 0)]
        ] as Array<[string, number]>;
        this.dbData.labels = filteredData.map(([dK, dV]) => dK);
        this.dbData.datasets[0].data = filteredData.map(([dK, dV]) => dV);

        this.envData.labels = Object.keys(res.stats2);
        this.envData.datasets[0].data = Object.values(res.stats2);

        this.dbChart.update();
        this.envChart.update();
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Retrieving chart data failed. Try again later.');
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
