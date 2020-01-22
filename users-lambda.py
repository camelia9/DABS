import json
from SPARQLWrapper import SPARQLWrapper, JSON, CSV

def get_all():
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/users/query")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT *
    WHERE {
    ?user rdf:type owl:NamedIndividual ;
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
        try:
            user, uid, name, email, password = line.split(',')
            users.append({
                'user': user,
                'uid': uid,
                'name': name,
                'email': email,
                'password': password,
            })
        except:
            print('ERR:', line)
            
    print(users)
    return users


def get_user(user):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/users/query")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT *
    WHERE {
    ?user rdf:type owl:NamedIndividual ;
            users:user_d %s .
    ?user users:user_id ?user_id .
    ?user users:name ?name .
    ?user users:email ?email .
    ?user users:password ?password .
    ?user users:preference ?pref .
    }
    LIMIT 10
    """ % user

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert().strip()
    user = {}
    for idx, line in enumerate(results.decode('utf-8').split('\r\n')[1:]):
        try:
            user_tag, uid, name, email, password, pref = line.split(',')
            if idx == 0:
                user['user'] = user_tag
                user['user_id'] = uid
                user['name'] = name
                user['email'] = email
                user['password'] = password
                user['preferences'] = [pref]
            else:
                user['preferences'].append(pref)
        except Exception as exc:
            print(exc, line)

    return user
    
    
def get_user_by_email(user_email):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/users/query")
    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT *
    WHERE {
    ?user rdf:type owl:NamedIndividual ;
            users:email "%s" .
    ?user users:user_id ?user_id .
    ?user users:name ?name .
    ?user users:email ?email .
    ?user users:password ?password .
    ?user users:preference ?pref .
    }
    LIMIT 10
    """ % user_email

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert().strip()
    user = {}
    for idx, line in enumerate(results.decode('utf-8').split('\r\n')[1:]):
        try:
            user_tag, uid, name, email, password, pref = line.split(',')
            if idx == 0:
                user['user'] = user_tag
                user['user_id'] = uid
                user['name'] = name
                user['email'] = email
                user['password'] = password
                user['preferences'] = [pref]
            else:
                user['preferences'].append(pref)
        except Exception as exc:
            print(exc, line)
            
    return {
    "statusCode": 200,
    "body": user}        


def insert_user(user_dict):
    email = user_dict.get('email', '')
    name = user_dict.get('name', '')
    password = user_dict.get('password', '')
    preference = user_dict.get('preference', '')
    user_id = user_dict.get('user_id', '')

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/users/update")

    query = """
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>

    INSERT DATA {
    users:%s rdf:type owl:NamedIndividual ;
            users:email "%s" ;
            users:name "%s" ;
            users:password "%s" ;
            users:preference "%s" ;
            users:user_id %s .
        }
    """ % (name, email, name, password, preference, user_id)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "INSERT"
    fuseki_client.method = "POST"
    results = fuseki_client.query().convert()
    return results


def delete_user(user_id):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/users/")

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    DELETE WHERE { 
    ?user users:user_id %s;
    ?property ?value
    }
    """ % user_id

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "DELETE"
    fuseki_client.method = "POST"
    results = fuseki_client.query().convert()

    return results


def update_user(user_id, new_data):
    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/users/")
    old_user = get_user(user_id)
    # user['user'] = user_tag
    # user['user_id'] = uid
    # user['name'] = name
    # user['email'] = email
    # user['password'] = password
    # user['preferences'] = [pref]
    delete_block = []
    insert_block = []
    for key in new_data:
        delete_block += [f'?s users:{key} "{old_user[key]}" ']
        insert_block += [f'?s users:{key} "{new_data[key]}" ']

    query = """
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    DELETE {
        %s
    }
    INSERT {
        %s ;
        rdf:type owl:NamedIndividual .  
    }
    WHERE { 
        ?s users:user_id %s . 
    }
    """ % ('.\n'.join(delete_block),
           '.'.join(insert_block), user_id)

    fuseki_client.setQuery(query)
    fuseki_client.queryType = "DELETE"
    fuseki_client.method = "POST"
    results = fuseki_client.query().convert()

    return results

def lambda_handler(event, context):
    if event.get('email'):
        return get_user_by_email(event.get('email'))
    
    method = event.get(httpMethod)
    
    event_type = event.get('EventType')
    if event_type == 'GetAll':
        get_all()
# print(get_all())
# print(get_user('993322116677'))
# print(get_user('993322116677'))

# print(insert_user({'email': 'kozyzo@wade.com', 'name': 'Kozmin',
#                    'password': 'pentest', 'preference': 'oneplus6t',
#                    'user_id': '182581295912'}))

# print(delete_user('182581295912'))


# print(update_user('182581295912', {'name': 'Cosmin'}))
