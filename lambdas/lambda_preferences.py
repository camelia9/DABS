import json
import uuid
import hashlib
from SPARQLWrapper import SPARQLWrapper, JSON, CSV
from collections import Counter


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


def insert_preference(label, views_count=0):
    supported_dbs = get_db_labels()
    pref = get_preference(label)

    if label not in supported_dbs or pref is not None:
        return False

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/update")

    query = """
    PREFIX :      <http://www.semanticweb.org/ontologies/databases/tbox/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    INSERT DATA {
        preferences:%s rdf:type preferences:Preference ;
        preferences:database_id :%s ;
        preferences:views_count %d
    }
    """ % (supported_dbs[label], supported_dbs[label], views_count)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "INSERT"
    fuseki_client.method = "POST"
    fuseki_client.query()
    return True


def delete_preference(label):
    db_labels = get_db_labels()
    if label not in db_labels:
        return False

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/update")

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>

    DELETE WHERE {
    preferences:%s a preferences:Preference ;
    ?property ?value
    }
    """ % db_labels[label]

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "DELETE"
    fuseki_client.method = "POST"
    fuseki_client.query()
    return True


def get_preference(label):
    db_labels = get_db_labels()
    if label not in db_labels:
        return None

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/")

    query = """
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT ?ctr ?val
    WHERE {
    preferences:%s a preferences:Preference .
    optional {
    preferences:%s preferences:views_count ?ctr .  
    }
    optional {
    preferences:%s preferences:users ?user .
    ?user users:user_id ?val
    }
    }
    """ % (db_labels[label], db_labels[label], db_labels[label])

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert()
    pref = {}

    for idx, line in enumerate(results.decode('utf-8').strip().split('\r\n')[1:]):
        views_count, user = line.split(',')
        if idx == 0:
            pref['views_count'] = views_count
            pref['user_ids'] = [user] if len(user) > 0 else []
        else:
            pref['user_ids'].append(user)

    if len(pref) == 0:
        return None

    return pref


def add_user_preference(preference_label, user_id):
    db_label = get_db_labels()
    insert_preference(preference_label)

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/update")

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    INSERT {
        preferences:%s preferences:users ?s .
    }
    WHERE { 
        ?s rdf:type users:User .  
        ?s users:user_id "%s" . 
    }
    """ % (db_label[preference_label], user_id)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "INSERT"
    fuseki_client.method = "POST"
    fuseki_client.query()
    return True

def remove_user_preference(preference_label, user_id):
    db_labels = get_db_labels()
    if preference_label not in db_labels:
        return False

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/update")

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>

    DELETE {
        preferences:%s preferences:users ?x
    }
    WHERE {
        ?x users:user_id "%s"
    }
    """ % (db_labels[preference_label], user_id)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "DELETE"
    fuseki_client.method = "POST"
    fuseki_client.query()

    return True


def update_preference(label, views_count):
    db_labels = get_db_labels()

    if label not in db_labels:
        return False

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/")

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>

    DELETE WHERE {
        preferences:%s preferences:views_count ?x
    }
    """ % db_labels[label]

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "DELETE"
    fuseki_client.method = "POST"
    fuseki_client.query()

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>

    INSERT DATA {
        preferences:%s preferences:views_count %d
    }
    """ % (db_labels[label], views_count)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "INSERT"
    fuseki_client.method = "POST"
    fuseki_client.query()

    return True


def tests():
    pass
    # print(get_db_labels().keys())

    # print(get_preferences())
    
    # print(delete_preference("Cassandra"))
    # print(delete_preference("Neo4j"))
    # print(delete_preference("Redis"))
    # print(delete_preference("MongoDB"))
    # print(delete_preference("HBase"))

    # print(get_preference('Redis'))

    # print(insert_preference('HBase', 12))

    # print(add_user_preference('ZeroDB', 'bd576b0f-7f91-40d3-93ce-9ec202d38a3c'))

    # print(remove_user_preference('Oracle', '38325f1f-3176-40b0-a3bf-2b653c9f3c8d'))

    # print(update_preference('Redis', 25))


def lambda_handler(event, context):
    http_method = event.get('httpMethod')

    # get preferences or preference
    if http_method == 'GET':
        label = event.get('queryStringParameters').get('label', None)
        if label is None:
            response = get_preferences()
        else:
            response = get_preference(label)
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response)
        }
    # add user preference
    if http_method == 'POST':
        body = json.loads(event.get('body'))
        response = add_user_preference(body['label'], body['user_id'])
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response)
        }
    # update views count
    if http_method == 'PUT':
        new_data = json.loads(event.get('body'))
        response = update_preference(new_data['label'], new_data['views_count'])
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response)
        }
    # delete preference
    if http_method == 'DELETE':
        new_data = json.loads(event.get('body'))
        response = delete_preference(new_data['label'])
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": response
        }

    return {
        "statusCode": 400,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": "No matched method"
    }
