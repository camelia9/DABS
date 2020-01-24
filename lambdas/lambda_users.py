import json
import uuid
import hashlib
from SPARQLWrapper import SPARQLWrapper, JSON, CSV


def get_all():
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT *
    WHERE {
    ?user rdf:type users:User ;
            users:user_id ?uid ;
            users:name ?name ;
            users:email ?email ;
            users:password ?password ;
    }
    LIMIT 30
    """

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert()
    users = []
    for line in results.decode('utf-8').strip().split('\r\n')[1:]:
        user, uid, name, email, password = line.split(',')
        users.append({
            'user': user,
            'uid': uid,
            'name': name,
            'email': email,
            'password': password,
        })

    return users


def get_user(user_id):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/query")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT *
    WHERE {
    ?user rdf:type users:User ;
            users:user_id "%s" .
    ?user users:user_id ?user_id .
    ?user users:name ?name .
    ?user users:email ?email .
    ?user users:password ?password .
    }
    LIMIT 1
    """ % user_id

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert().strip()
    for line in results.decode('utf-8').split('\r\n')[1:]:
        user_tag, uid, name, email, password = line.split(',')
        return {
            'user': user_tag,
            'user_id': uid,
            'name': name,
            'email': email,
            'password': password
        }

    return None


def get_user_by_email(email):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/query")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT *
    WHERE {
    ?user rdf:type users:User ;
            users:email "%s" .
    ?user users:user_id ?user_id .
    ?user users:name ?name .
    ?user users:email ?email .
    ?user users:password ?password .
    }
    LIMIT 1
    """ % email

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert().strip()
    for line in results.decode('utf-8').split('\r\n')[1:]:
        user_tag, uid, name, email, password = line.split(',')
        return {
            'user': user_tag,
            'user_id': uid,
            'name': name,
            'email': email,
            'password': password
        }

    return None


def insert_user(email, name, password):
    if get_user_by_email(email) != None:
        return None

    obj = email.split('@', 1)[0]
    password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    user_id = str(uuid.uuid4())

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/update")

    query = """
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>

    INSERT DATA {
        users:%s rdf:type users:User ;
        users:email "%s" ;
        users:name "%s" ;
        users:password "%s" ;
        users:user_id "%s" .
    }
    """ % (obj, email, name, password, user_id)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "INSERT"
    fuseki_client.method = "POST"
    fuseki_client.query()
    return user_id


def delete_user(user_id):
    if get_user(user_id) == None:
        return False

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/")
    fuseki_client.queryType = "DELETE"
    fuseki_client.method = "POST"

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>

    DELETE WHERE {
        ?db a preferences:Preference .
        ?db preferences:users ?guy .
        ?guy users:user_id "%s"
    }
    """ % user_id

    fuseki_client.setQuery(query)
    fuseki_client.query()

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    DELETE WHERE {
    ?user a users:User .
    ?user users:user_id "%s" ;
    ?property ?value
    }
    """ % user_id

    fuseki_client.setQuery(query)
    return fuseki_client.query().response.status == 200


def update_user(user_id, data):
    if get_user(user_id) == None:
        return False

    known_keys = {'email', 'name', 'password'}
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/v2/")
    old_user = get_user(user_id)
    delete_block = []
    insert_block = []

    if 'password' in data:
        data['password'] = hashlib.sha256(data['password'].encode('utf-8')).hexdigest()

    for key in data:
        if key not in known_keys:
            raise Exception("Invalid keys in data! Only email, name or password can be changed!")

        delete_block += [f'?s users:{key} "{old_user[key]}" ']
        insert_block += [f'?s users:{key} "{data[key]}" ']

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    DELETE {
        %s
    }
    INSERT {
        %s . 
    }
    WHERE { 
        ?s users:user_id "%s" .
        ?s rdf:type users:User .  
    }
    """ % ('.\n'.join(delete_block), '.'.join(insert_block), user_id)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "INSERT"
    fuseki_client.method = "POST"

    return fuseki_client.query().response.status == 200


def lambda_handler(event, context):
    if event.get('email'):
        response = get_user_by_email(event.get('email'))
        return {
            "headers": {"Access-Control-Allow-Origin": "*"},
            "statusCode": 200,
            "body": response
        }

    http_method = event.get('httpMethod')

    # get user info
    if http_method == 'GET':
        user_id = event.get('queryStringParameters')['user_id']
        response = get_user(user_id)
        if response is None:
            return {
                "statusCode": 404,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": "User not found"
            }
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response)
        }
    # add user
    if http_method == 'POST':
        user = json.loads(event.get('body'))
        response = insert_user(user['email'], user['name'], user['password'])
        if response is None:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": "Bad Request"
            }
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response, indent=2)
        }
    # update
    if http_method == 'PUT':
        user_id = event.get('queryStringParameters')['user_id']
        new_data = json.loads(event.get('body'))
        response = update_user(user_id, new_data)
        if response is None:
            return {
                "statusCode": 404,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": "User not found"
            }
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response, indent=2)
        }
    # delete user
    if http_method == 'DELETE':
        user_id = event.get('queryStringParameters')['user_id']
        response = delete_user(user_id)
        if response is False:
            return {
                "statusCode": 404,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": "User not found"
            }
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response, indent=2)
        }

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": "No matched method"
    }
