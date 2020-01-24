import {Component, OnInit} from '@angular/core';
import {Node, Edge} from '@swimlane/ngx-graph';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../environments/environment';
import {flatten} from '@angular/compiler';

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
      'Not Supported',
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
      'Proprietary',
      'Apache v2',
      'MIT',
      'GPL v2',
      'BSD',
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
      'SQL',
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

const RESULTS_DATA = {
  Yaacomo: {
    '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/YaacomoDatabaseManagementSystem',
    '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/DatabaseManagementSystem',
    'Supports indexing': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/OtherIndex',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/Index',
          value: 'OtherIndex'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/Supports_Indexing',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Has Concurrency Control Mechanism': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/OtherConcurrencyControlMechanism',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/ConcurrencyControlMechanism',
          value: 'OtherConcurrencyControlMechanism'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/hasConcurrencyControlMechanism',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Has Data Model': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/Relational',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/DataModel',
          value: 'Relational'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/hasDataModel',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Has Software License': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/Proprietary',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/SoftwareLicense',
          value: 'Proprietary'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/hasSoftwareLicense',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Has Storage Model': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/OtherStorageModel',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/StorageModel',
          value: 'OtherStorageModel'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/hasStorageModel',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Supports Operating System': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/Linux',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/OperatingSystem',
          value: 'Linux'
        },
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/Windows',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/OperatingSystem',
          value: 'Windows'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/supportsOperatingSystem',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Supports Programming Language': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/OtherProgrammingLanguage',
          '@type': 'http://dbpedia.org/ontology/ProgrammingLanguage',
          value: 'Other'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/supportsProgrammingLanguage',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    },
    'Supports Query Language': {
      values: [
        {
          '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/OtherQueryLanguage',
          '@type': 'http://www.semanticweb.org/ontologies/databases/tbox/QueryLanguage',
          value: 'OtherQueryLanguage'
        }
      ],
      '@id': 'http://www.semanticweb.org/ontologies/databases/tbox/supportsQueryLanguage',
      '@type': 'http://www.w3.org/2002/07/owl/ObjectProperty'
    }
  }
} as QueryResultType;

@Component({
  selector: 'dabs-recommend',
  templateUrl: './dabs-recommend.component.html',
  styleUrls: ['./dabs-recommend.component.scss']
})
export class DabsRecommendComponent implements OnInit {
  public Array = Array;
  private req: {};
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

  constructor(private $http: HttpClient, private $cookies: CookieService, private snackBar: MatSnackBar) {


  }

  zoomToFit$: Subject<boolean> = new Subject();

  filters = FILTERS_DATA;

  queryResults = false;

  graphNodes: Array<Node>;
  graphLinks: Array<Edge>;
  panelOpenState: boolean;
  showGraph = false;
  durationInSeconds = 5;


  fitGraph() {
    this.zoomToFit$.next(true);
  }

  toggleTheGraph() {
    this.showGraph = !this.showGraph;
    setTimeout(() => this.fitGraph(), 100);
  }

  ngOnInit() {
    console.log(this.graphNodes);
    console.log(this.graphLinks);
  }

  openSnackBar(message: string) {
    this.snackBar.open(
      message,
      null, {
        duration: this.durationInSeconds * 1000,
        horizontalPosition: 'right',
      });
  }

  performQuery() {

    this.req = {};

    FILTERS_DATA.forEach((filter) => {
      if (filter.variable !== 'None') {
        this.req[filter.property] = sanitizeForBackend(filter.variable);
      }
    });

    if (!Object.keys(this.req).length) {
      this.openSnackBar('Please fill in a filter');
      return;
    }

    // this.$http.get(environment.LAMBDAS_API_ENDPOINT + '/sparql',
    //   {
    //     params: this.req
    //   })
    //   .toPromise()
    //   .then((res: QueryResultType) => {
    const res = RESULTS_DATA;
    console.log(res);
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
            (o) => o.values.map(oV => ({label: oV, id: oV.split('/')[oV.split('/').length - 1]}))
          )) as Array<Node>),
          {id: dbName, label: dbName}
        ] as Array<Node>,
        edges: flatten(properties.map((o) => o.values.map(oV => ({
            source: dbName,
            target: oV.split('/')[oV.split('/').length - 1],
            label: o.label,
            id: oV.split('/')[oV.split('/').length - 1]
          }))
        )) as Array<Edge>,
        jsonLD: dbO
      });
    }


    this.dbData = tempData;
    this.queryResults = true;
    // })
    // .catch((err) => {
    //   console.error(err);
    //   this.openSnackBar('Retrieving user data failed. Try again later.');
    // });
  }


}
