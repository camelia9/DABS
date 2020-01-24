import json
import uuid
import hashlib
from SPARQLWrapper import SPARQLWrapper, JSON, CSV
from collections import Counter


def get_db_labels(reversed=False):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/dbs/")
    query = """
    PREFIX : <http://www.semanticweb.org/ontologies/databases/tbox/>
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT * WHERE {
    ?x a :DatabaseManagementSystem ;
        rdfs:label ?label
    }
    """

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert()
    prefs = {}

    for line in results.decode('utf-8').strip().split('\r\n')[1:]:
        tag, label = line.split(',')
        if reversed:
            prefs[tag.rsplit('/', 1)[-1]] = label
        else:
            prefs[label] = tag.rsplit('/', 1)[-1]

    return prefs


def get_preferences():
    db_labels = get_db_labels(reversed=True)
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?db ?user_id ?views
    WHERE {
    ?db rdf:type preferences:Preference .
    optional {
        ?db preferences:views_count ?views .
    }
    optional {
        ?db preferences:users ?user .
        ?user users:user_id ?user_id .
    }
	}
    """

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert()
    prefs = {}

    for line in results.decode('utf-8').strip().split('\r\n')[1:]:
        label, uid, views = line.split(',')
        label = label.rsplit('#', 1)[-1]
        label = db_labels[label]
        if label not in prefs:
            prefs[label] = {
                'views': views,
                'user_ids': []
            }
        if len(uid) > 0:
            prefs[label]['user_ids'].append(uid)

    return prefs


def get_stats1():
    prefs = get_preferences()
    ctr = {}

    for key in prefs:
        ctr[key] = int(prefs[key].get('views'))

    sum_all = sum(ctr.values())

    for key in ctr:
        ctr[key] = int(10000 * ctr[key] / sum_all) / 100

    result = {}
    for k, v in sorted(list(ctr.items()), key=lambda x: x[1], reverse=True)[:4]:
        result[k] = v

    result['Others'] = int((100 - sum(result.values())) * 100) / 100

    return result


def get_stats2():
    prefs = get_preferences()
    db_labels = get_db_labels()
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/dbs/")
    languages = Counter()
    for pref in prefs:
        query = """
        PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX users: <http://www.semanticweb.org/ontologies/users#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX : <http://www.semanticweb.org/ontologies/databases/tbox/>

        SELECT ?label
        WHERE {
        :%s a :DatabaseManagementSystem  ;
        :supportsProgrammingLanguage ?prg .
        ?prg rdfs:label ?label
        }
        """ % db_labels[pref]

        fuseki_client.setQuery(query)
        fuseki_client.method = "POST"
        fuseki_client.setReturnFormat(CSV)
        results = fuseki_client.query().convert()

        for line in results.decode('utf-8').strip().split('\r\n')[1:]:
            languages[line.strip()] += 1

    sum_all = sum(languages.values())

    for key in languages:
        languages[key] = int(10000 * languages[key] / sum_all) / 100

    result = {}
    for k, v in sorted(list(languages.items()), key=lambda x: x[1], reverse=True)[:9]:
        result[k] = v

    return result


def lambda_handler(event, context):
    http_method = event.get('httpMethod')

    # get preferences or preference
    if http_method == 'GET':
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({'stats1': get_stats1(),
                                'stats2': get_stats2()})
        }
