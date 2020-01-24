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

@Component({
  selector: 'dabs-recommend',
  templateUrl: './dabs-recommend.component.html',
  styleUrls: ['./dabs-recommend.component.scss']
})
export class DabsRecommendComponent implements OnInit {
  public dbData: Array<{
    name: string;
    properties: Array<{
      label: string;
      values: Array<string>;
    }>
    nodes: Array<Node>;
    edges: Array<Edge>;
    jsonLD: QueryResultElem;
  }>;

  public loadingQuery = false;
  public queriedAtLeastOnce = false;

  public readonly PAGE_SIZE = 25;
  public noPages: number;
  public selectedPage = 0;

  constructor(private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar) {


  }

  zoomToFit$: Subject<boolean> = new Subject();

  filters = FILTERS_DATA;

  showGraphForDB = false;
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
        const tempData = [];
        for (const dbName in res) {
          const dbO = res[dbName];
          const properties = [];
          for (const label in dbO) {
            const labelValue = dbO[label];
            if (typeof labelValue === 'string') {
              properties.push({
                label,
                values: [labelValue]
              });
              continue;
            }

            properties.push({
              label,
              values: labelValue.values.map(lVV => lVV.value)
            });
          }
          tempData.push({
            name: dbName,
            properties,
            nodes: [
              ...(flatten(properties.map(
                (o) => o.values.map(oV => ({label: oV, id: this.sanitizeNodeId(oV)}))
              )) as Array<Node>),
              {id: dbName, label: dbName}
            ] as Array<Node>,
            edges: flatten(properties.map((o) => o.values.map(oV => ({
                source: dbName,
                target: this.sanitizeNodeId(oV),
                label: o.label,
                id: this.sanitizeNodeId(oV)
              }))
            )) as Array<Edge>,
            jsonLD: dbO
          });
        }
        this.dbData = tempData;
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
}
