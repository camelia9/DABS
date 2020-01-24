const data = require('./dbdbdata');
const fs = require('fs');
const _ = require('lodash');

const sanitize = v => v.trim().replace(/[ +\/()#*²]/g, '_');
const handleNoValue = (v, classType) => v || ['Other' + classType];

const findBySanitize = (individuals, sanitized) => {
  for (const uniqueName in individuals) {
    if (individuals[uniqueName].sanitized === sanitized) {
      return uniqueName;
    }
  }
  throw new Error('WTF');
};

const getClasses = (dbO, prop) => {
  const entityTypeOfInterest = entitiesOfInterest.find(e0 => e0.prop === prop);
  const values = handleNoValue(dbO[prop], entityTypeOfInterest.classType);
  const proccedValues = values.map(v => {
    const sanitized = fullSanitize(v, entityTypeOfInterest.classType);
    return findBySanitize(entityTypeOfInterest.individuals, sanitized);
  });
  return _.uniq(proccedValues.map(v => ':' + v)).join(', ');
};

const getGeneric = (classInstance, label, classType, dbo = '') =>
    `###  http://www.semanticweb.org/ontologies/databases/tbox/${classInstance}
:${classInstance} rdf:type owl:NamedIndividual ,
                            ${dbo}:${classType} ;
                   rdfs:label "${label}"@en .

`;

const getDB = dbO =>
    `###  http://www.semanticweb.org/ontologies/databases/tbox/${processEntityName(dbO.title, 'DatabaseManagementSystem')[0]}
:${processEntityName(dbO.title, 'DatabaseManagementSystem')[0]} rdf:type owl:NamedIndividual ,
                  :DatabaseManagementSystem ;
         :supportsOperatingSystem ${getClasses(dbO, 'Operating Systems')} ;
         :Supports_Indexing ${getClasses(dbO, 'indexes')} ;
         :hasDataModel ${getClasses(dbO, 'data-model')} ;
         :hasConcurrencyControlMechanism ${getClasses(dbO, 'concurrency-control')} ;
         :supportsQueryLanguage ${getClasses(dbO, 'query-interface')} ;
         :hasStorageModel ${getClasses(dbO, 'storage-model')} ;
         :supportsProgrammingLanguage ${getClasses(dbO, 'Supported languages')} ;
         :hasSoftwareLicense ${getClasses(dbO, 'Licenses')} ;
         rdfs:label "${dbO.title}"@en .

`;

const entitiesOfInterest = [
  {
    prop: 'Operating Systems',
    fn: (os, label) => getGeneric(os, label || os, 'OperatingSystem'),
    individuals: {},
    classType: 'OperatingSystem',
  },
  {
    prop: 'indexes',
    fn: (index, label) => getGeneric(index, label || index, 'Index'),
    individuals: {},
    classType: 'Index',
  },
  {
    prop: 'data-model',
    fn: (dataModel, label) => getGeneric(dataModel, label || dataModel, 'DataModel'),
    individuals: {},
    classType: 'DataModel',
  },
  {
    prop: 'concurrency-control',
    fn: (cC, label) => getGeneric(cC, label || cC, 'ConcurrencyControlMechanism'),
    individuals: {},
    classType: 'ConcurrencyControlMechanism',
  },
  {
    prop: 'query-interface',
    fn: (qI, label) => getGeneric(qI, label || qI, 'QueryLanguage'),
    individuals: {},
    classType: 'QueryLanguage',
  },
  {
    prop: 'storage-model',
    fn: (sM, label) => getGeneric(sM, label || sM, 'StorageModel'),
    individuals: {},
    classType: 'StorageModel',
  },
  {
    // filter here too little usages
    prop: 'Supported languages',
    fn: (sL, label) => getGeneric(sL, label || sL, 'ProgrammingLanguage', 'dbo'),
    individuals: {},
    classType: 'ProgrammingLanguage',
  },
  {
    prop: 'Licenses',
    fn: (license, label) => getGeneric(license, label || license, 'SoftwareLicense'),
    individuals: {},
    classType: 'SoftwareLicense',
  }
];

const includedLanguages = {
  Java: 120,
  Python: 90,
  "C++": 82,
  C: 53,
  JavaScript: 51,
  PHP: 45,
  "C#": 41,
  Go: 41,
  Ruby: 41,
  SQL: 41,
  Perl: 35,
  Scala: 17,
  R: 16,
  Lua: 16,
  "PL/SQL": 14,
  Erlang: 12,
  Delphi: 11,
  Haskell: 11,
  Clojure: 10
};

const databaseIndividuals = [];

const shouldChangeProgLang = (v, classType) => classType === 'ProgrammingLanguage' && !includedLanguages[v.trim()];

const fullSanitize = (v, classType) => {
  const sanitized = sanitize(v);
  const filteredProgramLang = shouldChangeProgLang(v, classType) ? ('Other' + classType) : sanitized;
  return filteredProgramLang;
};

const allEntities = {};
const processEntityName = (v, classType) => {
  const fullSanitized = fullSanitize(v, classType);
  const uniqueName = allEntities[fullSanitized] ? (fullSanitized + classType) : fullSanitized;
  allEntities[uniqueName] = true;
  return [uniqueName, shouldChangeProgLang(v, classType) ? 'Other' : v.trim()];
};

data.forEach(dbO => {
  entitiesOfInterest.forEach(e0 => {
    // if no value, make it OtherClassType
    const valuesList = handleNoValue(dbO[e0.prop], e0.classType);
    valuesList.forEach(v => {
      const [procced, trimmedLabel] = processEntityName(v, e0.classType);
      const fullSanitized = fullSanitize(v, e0.classType);
      e0.individuals[procced] = {
        turtle: e0.fn(procced, trimmedLabel),
        sanitized: fullSanitized
      };
    });
  });

  databaseIndividuals.push(getDB(dbO));
});

entitiesOfInterest.forEach(e0 => {
  const individuals = Object.values(e0.individuals);
  individuals.forEach(i => fs.appendFileSync('./turtle_db.ttl', i.turtle));
});

databaseIndividuals.forEach(i => fs.appendFileSync('./turtle_db.ttl', i));

console.log(entitiesOfInterest);
console.log(databaseIndividuals);


