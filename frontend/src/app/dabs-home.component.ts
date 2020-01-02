import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';

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
  private newsFeed: any;


  constructor() {
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

    const dbData = {
      labels: ['Redis', 'MongoDB', 'OracleDB', 'MySQL', 'GraphDB'],
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
      data: dbData,
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

  openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  renderNewsFeed() {
    // implement request to NewsFeed API

    this.newsFeed = [
      {
        picture: 'https://miro.medium.com/max/2760/1*kPKoXmHBDmGthbah-0549A.png',
        title: 'What happened to Hadoop',
        shortDescription: 'Hadoop was often called ‘the next big thing’ in enterprise IT, until it wasn’t. ' +
          'A former write for Gigaom takes a high level look at the trends that pushed Hadoop out of the spotlight.',
        url: 'https://architecht.io/what-happened-to-hadoop-211aa52a297'
      },
      {
        picture: 'https://community-cdn-digitalocean-com.global.ssl.fastly.net/assets/tutorials/images/large/' +
          'Database-Mostov_v4.1_twitter-_-facebook.png?1549487063',
        title: 'Understanding Database Sharding',
        shortDescription: 'Goes over what sharding is, some of its main benefits and drawbacks, and also a few common sharding approaches.',
        url: 'https://www.digitalocean.com/community/tutorials/understanding-database-sharding'
      },
      {
        picture: '../../assets/newsfeed-default-pix.jpg',
        title: 'Comparing Database Types: How Database Types Evolved to Meet Different Needs',
        shortDescription: 'NoSQL, relational, NewSQL, graph, and more.. Many types of databases exist, ' +
          'each with their own benefits. This post compares different approaches and what makes each one tick.',
        url: 'https://www.prisma.io/blog/comparison-of-database-models-1iz9u29nwn37'
      }
    ];
  }


  ngOnInit(): void {
    this.renderCharts();
    this.renderNewsFeed();
  }


}
