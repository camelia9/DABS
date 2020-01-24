import re
import json
import uuid
import hashlib
from pprint import pprint
from SPARQLWrapper import SPARQLWrapper, JSON, CSV
from collections import Counter



regex = r"[ +\/()#*²]"
subst = "_"


def run_query(mapping):
    query_params = ''

    for key in mapping:
        val = re.sub(regex, subst, mapping[key], 0)
        query_params += f'?db :{key} :{val} .'

    query = """
    PREFIX : <http://www.semanticweb.org/ontologies/databases/tbox/>
    PREFIX users: <http://www.semanticweb.org/ontologies/users#>
    PREFIX preferences: <http://www.semanticweb.org/milut/ontologies/preferences#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select ?db ?db_label ?op ?op_label ?value ?value_label ?value_type where {
    ?db a :DatabaseManagementSystem .
    %s
    ?db rdfs:label ?db_label .
    ?db ?op ?value .
    ?op rdfs:label ?op_label .
    ?op a owl:ObjectProperty .
    ?value rdfs:label ?value_label .
    ?value a ?value_type
    }
    """ % query_params

    fuseki_client = SPARQLWrapper("http://ec2-54-93-236-36.eu-central-1.compute.amazonaws.com:3030/dbs/")

    fuseki_client.setQuery(query)
    fuseki_client.method = "POST"
    fuseki_client.setReturnFormat(CSV)
    results = fuseki_client.query().convert()
    dbs = {}

    for line in results.decode('utf-8').strip().split('\r\n')[1:]:
        db, db_label, op, op_label, value, value_label, value_type = line.split(',')
        if value_type.endswith('NamedIndividual'):
            continue

        dbs[db_label] = dbs.get(db_label, {})
        
        if '@id' not in dbs[db_label]:
            dbs[db_label]['@id'] = db
            dbs[db_label]['@type'] = 'http://www.semanticweb.org/ontologies/databases/tbox/DatabaseManagementSystem'
        
        if op_label not in dbs[db_label]:
            dbs[db_label][op_label] = {'values': []}
            dbs[db_label][op_label]['@id'] =  op
            dbs[db_label][op_label]['@type'] =  'http://www.w3.org/2002/07/owl/ObjectProperty'

        dbs[db_label][op_label]['values'].append({
            '@id': value,
            '@type': value_type,
            'value': value_label
        })
    
    return dbs

def tests():
    items = run_query({
        'supportsOperatingSystem': 'Windows'
    })

    print(json.dumps(items, indent=2))
        

def lambda_handler(event, context):
    http_method = event.get('httpMethod')

    if http_method == 'POST':
        mapping = json.loads(event.get('body'))
        response = run_query(mapping)
        if response is None:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": "Bad Request"
            }
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response, indent=1)
        }

    return {
        "statusCode": 400,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": "No matched method"
    }
