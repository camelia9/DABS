import {Component, OnInit} from '@angular/core';
import {Node, Edge} from '@swimlane/ngx-graph';
import {Subject} from 'rxjs';

@Component({
  selector: 'dabs-recommend',
  templateUrl: './dabs-recommend.component.html',
  styleUrls: ['./dabs-recommend.component.scss']
})
export class DabsRecommendComponent implements OnInit {

  constructor() {
  }


  zoomToFit$: Subject<boolean> = new Subject();

  filters = [
    {
      label: 'Supports Typing',
      options: [
        true, false
      ],
      variable: true
    },
    {
      label: 'Supports Index',
      options: [true, false],
      variable: true
    },
    {
      label: 'Data Schema',
      options: [
        'Relational',
        'Key/Value'
      ],
      variable: 'Relational'
    },
    {
      label: 'License',
      options: [
        'Apache',
        'MIT',
        'OpenSource'
      ],
      variable: 'Apache'
    },
    {
      label: 'Platform',
      options: [
        'Linux',
        'MacOS',
        'Microsoft'
      ],
      variable: 'Linux'
    },
    {
      label: 'Environment',
      options: [
        'Cloud',
        'Desktop',
        'Docker'
      ],
      variable: 'Cloud'
    },
    {
      label: 'Specific Usages',
      options: [
        'Desktop Applications',
        'Web Application',
        'Standalone'
      ],
      variable: 'Web Application'
    },
    {
      label: 'Query Language',
      options: [
        'XQuery',
        'SQL',
        'GraphQL'
      ],
      variable: 'GraphQL'
    }
  ];

  results = [{
    label: 'MongoDB',
    tags: {
      hasDataModel: 'DocumentDataModel',
      hasDataSchema: 'Flexible',
      hasLicense: 'OpenSource',
      supportsIndexing: 'true1',
      hasReplicationProtocol: 'PeerToPeerAsynchronousReplication',
      supportsTyping: 'true2',
      platform: 'Linux',
      environment: 'Cloud'
    }
  }].map(o => ({...o, tags: Object.entries(o.tags)}));

  graphNodes = [
    ...this.results[0].tags.map((o) => ({label: o[1], id: o[1]})),
    {id: 'MongoDB', label: 'MongoDB'}
  ] as Array<Node>;
  graphLinks = this.results[0].tags.map((o) => ({source: 'MongoDB', target: o[1], label: o[0], id: o[0]})) as Array<Edge>;
  panelOpenState: boolean;
  showGraph = false;

  fitGraph() {
    this.zoomToFit$.next(true);
  }

  toggleTheGraph() {
    this.showGraph = !this.showGraph;
    this.fitGraph();
  }

  ngOnInit() {
    console.log(this.graphNodes);
    console.log(this.graphLinks);
  }


}
