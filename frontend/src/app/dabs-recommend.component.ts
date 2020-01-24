import {Component, OnInit} from '@angular/core';
import {Node, Edge} from '@swimlane/ngx-graph';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../environments/environment';
import {flatten} from '@angular/compiler';
import {PageEvent} from '@angular/material';

const sanitizeForBackend = label => label.replace(/[ +\/()#*²]/g, '_');

const FILTERS_DATA = [
  {
    label: 'Operating System',
    property: 'supportsOperatingSystem',
    options: ['None', 'Linux', 'Windows', 'OS X', 'All OS with Java VM', 'Hosted', 'Solaris', 'BSD', 'iOS', 'Android', 'AIX', 'HP-UX', 'VxWorks', 'z/OS', 'OpenVMS', 'UnixWare', 'DOS', 'OtherOperatingSystem'],
    variable: 'None'
  },
  {
    label: 'Supports Indexing',
    property: 'Supports_Indexing',
    options: [
      'None',
      'B+Tree',
      'Hash Table',
      'Inverted Index (Full Text)',
      'Not SupportedIndex',
      'BitMap',
      'Log-Structured Merge Tree',
      'Skip List',
      'R-Tree',
      'Patricia/Radix Trie',
      'Bw-Tree',
      'AVL-Tree',
      'Red-Black Tree',
      'T-Tree',
      'K-D Tree',
      'Adaptive Radix Tree (ART)',
      'Block Range Index (BRIN)',
      'MassTree',
      'OtherIndex'
    ],
    variable: 'None'
  },
  {
    label: 'Data Schema',
    property: 'hasDataModel',
    options: [
      'None',
      'Relational',
      'Key/Value',
      'Document / XML',
      'Object-Oriented',
      'Graph',
      'Column Family',
      'Object-Relational',
      'Triplestore (RDF)',
      'Array / Matrix',
      'Network',
      'Hierarchical',
      'Multi-Value',
      'Entity-Relationship',
      'Entity-Attribute-Value',
      'OtherDataModel'
    ],
    variable: 'None'
  },
  {
    label: 'License',
    property: 'hasSoftwareLicense',
    options: [
      'None',
      'Proprietary',
      'Apache v2',
      'MIT',
      'GPL v2',
      'BSDSoftwareLicense',
      'AGPL v3',
      'GPL v3',
      'LGPL v2',
      'Mozilla Public License',
      'LGPL v3',
      'Eclipse Public License',
      'PostgreSQL License',
      'Zope Public License',
      'OpenLDAP Public License',
      'Server Side Public License',
      'Open Software License 3.0',
      'Boost Software License',
      'Business Source License',
      'Code Project Open License',
      'Public Domain',
      'VoltDB Proprietary License',
      'ISC License',
      'OtherSoftwareLicense'
    ],
    variable: 'None'
  },
  {
    label: 'Concurrency Control Mechanism',
    property: 'hasConcurrencyControlMechanism',
    options: [
      'None',
      'Multi-version Concurrency Control (MVCC)',
      'Not Supported',
      'Optimistic Concurrency Control (OCC)',
      'Two-Phase Locking (Deadlock Detection)',
      'Two-Phase Locking (Deadlock Prevention)',
      'Deterministic Concurrency Control',
      'Timestamp Ordering',
      'OtherConcurrencyControlMechanism'
    ],
    variable: 'None'
  },
  {
    label: 'Storage Model',
    property: 'hasStorageModel',
    options: [
      'None',
      'N-ary Storage Model (Row/Record)',
      'Decomposition Storage Model (Columnar)',
      'Custom',
      'Hybrid',
      'OtherStorageModel'
    ],
    variable: 'None'
  },
  {
    label: 'Supported Languages',
    property: 'supportsProgrammingLanguage',
    options: [
      'None',
      'Java',
      'Python',
      'C++',
      'C',
      'JavaScript',
      'PHP',
      'C#',
      'Go',
      'Ruby',
      'SQLProgrammingLanguage',
      'Perl',
      'Scala',
      'R',
      'Lua',
      'PL/SQL',
      'Erlang',
      'Delphi',
      'Haskell',
      'Clojure',
      'OtherProgrammingLanguage'
    ],
    variable: 'None'
  },
  {
    label: 'Query Language',
    property: 'supportsQueryLanguage',
    options: [
      'None',
      'SQL',
      'Custom API',
      'HTTP / REST',
      'Command-line / Shell',
      'Stored Procedures',
      'SPARQL',
      'PL/SQL',
      'Gremlin',
      'GraphQL',
      'Cypher',
      'Datalog',
      'XQuery',
      'PartiQL',
      'RDFS++',
      'RPC',
      'QUEL',
      'OtherQueryLanguage'
    ],
    variable: 'None'
  }
] as Array<{
  label: string;
  options: Array<string>;
  property: string;
  variable: string;
}>;

type QueryResultElem = Record<string, string | {
  values: Array<{
    '@id': string;
    '@type': string;
    'value': string;
  }>;
  '@id': string;
  '@type': string;
}>;

type QueryResultType = Record<string, QueryResultElem>;

interface UIDataElem {
  name: string;
  properties: Array<{
    label: string;
    values: Array<{
      valueId: string;
      value: string;
    }>;
    propertyId: string;
  }>;
  nodes: Array<Node>;
  edges: Array<Edge>;
  jsonLD: QueryResultElem;
}

const nodesColorsMappings = {
  'Supports indexing': '#C13FAC',
  'Has Concurrency Control Mechanism': '#22C1C1',
  'Has Data Model': '#FCF6B1',
  'Has Software License': '#F72C25',
  'Has Storage Model': '#006CAF',
  'Supports Operating System': '#54B8F2',
  'Supports Programming Language': '#ABD8AC',
  'Supports Query Language': '#8282DD',
  default: '#FEC925'
};

@Component({
  selector: 'dabs-recommend',
  templateUrl: './dabs-recommend.component.html',
  styleUrls: ['./dabs-recommend.component.scss']
})
export class DabsRecommendComponent implements OnInit {
  public dbData: Array<UIDataElem>;

  public loadingQuery = false;
  public queriedAtLeastOnce = false;

  public readonly PAGE_SIZE = 25;
  public noPages: number;
  public selectedPage = 0;

  constructor(private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar) {


  }

  zoomToFit$: Subject<boolean> = new Subject();
  update$: Subject<boolean> = new Subject();

  filters = FILTERS_DATA;

  showGraphForDB: UIDataElem = null;
  durationInSeconds = 5;


  fitGraph() {
    this.zoomToFit$.next(true);
  }

  toggleTheGraph(dbo) {
    if (dbo === this.showGraphForDB) {
      this.showGraphForDB = null;
      return;
    }
    this.showGraphForDB = dbo;
    setTimeout(() => this.fitGraph(), 100);
  }

  ngOnInit() {
  }

  openSnackBar(message: string) {
    this.snackBar.open(
      message,
      null, {
        duration: this.durationInSeconds * 1000,
        horizontalPosition: 'right',
      });
  }

  private sanitizeNodeId = v => {
    if (v.startsWith('http://')) {
      const splitted = v.split('/');
      return this.sanitizeNodeId(splitted[splitted.length - 1]);
    }
    if (Number.isNaN(+v[0])) {
      return sanitizeForBackend(v);
    }
    return this.sanitizeNodeId('X' + v);
  }

  performQuery() {

    const req = {};

    FILTERS_DATA.forEach((filter) => {
      if (filter.variable !== 'None') {
        req[filter.property] = sanitizeForBackend(filter.variable);
      }
    });

    if (!Object.keys(req).length) {
      this.openSnackBar('Please fill in a filter');
      return;
    }
    this.loadingQuery = true;
    this.queriedAtLeastOnce = true;
    this.$http.post(environment.LAMBDAS_API_ENDPOINT + '/sparql', req)
      .toPromise()
      .then((res: QueryResultType) => {
        this.dbData = [];
        for (const dbName in res) {
          const dbO = res[dbName];
          const properties: UIDataElem['properties'] = [];
          for (const label in dbO) {
            const labelValue = dbO[label];
            if (typeof labelValue === 'string') {
              properties.push({
                label,
                values: [{
                  value: labelValue,
                  valueId: label
                }],
                propertyId: ''
              });
              continue;
            }

            properties.push({
              label,
              values: labelValue.values.map(lVV => ({
                value: lVV.value,
                valueId: lVV['@id']
              })),
              propertyId: labelValue['@id'].split('/')[labelValue['@id'].split('/').length - 1]
            });
          }

          const nodes: Array<Node> = [
            ...(flatten(properties.filter(p => p.label !== '@id' && p.label !== '@type').map(
              (o) => {
                return o.values.map(oV => {
                  return {
                    label: oV.value,
                    id: this.sanitizeNodeId(oV.valueId),
                    data: {myColor: nodesColorsMappings[o.label], property: o.propertyId}
                  };
                });
              }
            )) as Array<Node>),
            {id: dbName, label: dbName, data: {myColor: nodesColorsMappings.default}}
          ];

          const edges: Array<Edge> = flatten(properties.filter(p => p.label !== '@id' && p.label !== '@type')
            .map((o) => o.values.map(oV => ({
                source: dbName,
                target: this.sanitizeNodeId(oV.valueId),
                label: o.label,
                id: this.sanitizeNodeId(oV.valueId)
              }))
            ));

          this.dbData.push({
            name: dbName,
            properties,
            nodes,
            edges,
            jsonLD: dbO
          });
        }
        this.noPages = Math.ceil(this.dbData.length / this.PAGE_SIZE);
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Retrieving user data failed. Try again later.');
      })
      .finally(() => this.loadingQuery = false);
  }


  changePage($event: PageEvent) {
    this.selectedPage = $event.pageIndex;
    this.showGraphForDB = null;
  }

  // add preference
  createPreference(dbName: string) {
    this.$http.post(environment.LAMBDAS_API_ENDPOINT + '/preferences', {label: dbName, user_id: this.$cookies.get('user_id')})
      .toPromise()
      .then(() => {
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Error sending stats for db. Try again later.');
      });
  }

  clickedNode($event: Node) {
    if (!$event.data.property) {
      // root node
      return;
    }
    const dbO = this.showGraphForDB;
    const foundProperty = FILTERS_DATA.find(o => o.property === $event.data.property);
    this.$http.post(environment.LAMBDAS_API_ENDPOINT + '/sparql', {
      [foundProperty.property]: $event.id
    }).toPromise()
      .then((res: QueryResultType) => {
        const MAX_EXTRA_NODES = 3;
        let idx = 0;
        for (const dbName in res) {
          if (dbName === dbO.name) {
            continue;
          }
          if (!dbO.nodes.find(o => o.label === dbName)) {
            if (idx >= MAX_EXTRA_NODES) {
              break;
            }
            dbO.nodes.push({
              id: this.sanitizeNodeId(dbName),
              label: dbName,
              data: {myColor: nodesColorsMappings.default}
            });
            idx++;
          }
          dbO.edges.push({
            source: $event.id,
            target: this.sanitizeNodeId(dbName),
            label: $event.data.property
          });
        }
        this.update$.next(true);
        this.zoomToFit$.next(true);
      })
      .catch((err) => {
        console.error(err);
        this.openSnackBar('Retrieving expanding node data failed. Try again later.');
      });
  }
}
