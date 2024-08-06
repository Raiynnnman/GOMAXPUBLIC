from __future__ import print_function  # Use print() instead of print
# from flask import url_for
import json
from common import settings

limits = json.dumps(dict(limit=15, page=0))
config = settings.config()
headers = {"Content-Type": "application/json"}
    
def test_query_urls(client):
        
    response = client.post('/query/list', 
                             data=limits)
    assert response.status_code==200
    assert "data" in response.json
    assert "total" in response.json['data']
    initial_count = response.json['data']['total'][0]['total']
    
    data = {"groupby": [], 
            "name": "backend test query",
            "columns": [
              {
                "alias": "fcbomet",
                "column": "commenter_id",
                "id": "id-commenter_id",
                "name": "commenter_id",
                "opid": "o-1",
                "opname": "VALUE",
                "table": "facebook_comments",
                "type": "string"
              }
            ],          
            "orderby": [],
            "tables": [{"name": "facebook_post", "alias": "fcbos"}],
            "where": []}

    response = client.post('/query/create', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200
    assert "success" in response.json['data']
    
    response = client.post('/query/list', 
                             data=limits)
    assert response.status_code==200
    assert initial_count + 1 == response.json['data']['total'][0]['total'] 

    data = response.json['data']['queries'][0]

    if 'test' in config.getKey("mysql_db"):
        data['orderby'] = ["name",]   
    response = client.post('/query/update', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200
    assert "success" in response.json['data']
    
    # TODO test change with get
    
    

def test_dataset_urls(client):
        
    response = client.post('/dataset/list', 
                             data=limits)
    assert response.status_code==200
    assert "data" in response.json
    assert "total" in response.json['data']
    initial_count = response.json['data']['total'][0]['total']

    # create a query, so we can use the ID
    data = {"groupby": [], 
            "name": "backend test query",
            "columns": [
              {
                "alias": "fcbomet",
                "column": "commenter_id",
                "id": "id-commenter_id",
                "name": "commenter_id",
                "opid": "o-1",
                "opname": "VALUE",
                "table": "facebook_comments",
                "type": "string"
              }
            ],          
            "orderby": [],
            "tables": [{"name": "facebook_post", "alias": "fcbos"}],
            "where": []}
    response = client.post('/query/create', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200

    response = client.post('/query/list', 
                             data=limits)
    assert response.status_code==200
    query = response.json['data']['queries'][0]

    data = {
        "datasets": [
          {
            "name": "test dataset", 
            "script": "ls -l"
          }
        ], 
        "name": "Athlete Profiles Update", 
        "is_active": 1,
        "query_id": query['id']
    }

    response = client.post('/dataset/create', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200
    assert "success" in response.json['data']
    
    response = client.post('/dataset/list', 
                             data=limits)
    assert response.status_code==200
    assert initial_count + 1 == response.json['data']['total'][0]['total'] 

    data = response.json['data']['dataset'][0]
    
    # TODO fixup response to match update
    data['datasets'] = data['dataset']
    data['is_active'] = data['isActive']
    

    if 'test' in config.getKey("mysql_db"):
        data['name'] = "Updated Athlete Profiles"   
    response = client.post('/dataset/update', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200
    assert "success" in response.json['data']
    
    # response = client.post('/dataset/run', follow_redirects=True,
                           # data=json.dumps(data))
    # assert response.status_code==200          #TODO create valid dataset that can be run
    # assert "success" in response.json['data']
    
    # TODO test change with get


def test_filter_urls(client):
        
    response = client.post('/filter/list', 
                             data=limits)
    assert response.status_code==200
    assert "data" in response.json
    assert "total" in response.json['data']
    initial_count = response.json['data']['total'][0]['total']
    
    data = {
        "database": "facebook",
        "filters": [{"name": "test filter script", "script": "ls -l"}],
        "name": "test filter"
    }
    response = client.post('/filter/create', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200
    assert "success" in response.json['data']
    
    response = client.post('/filter/list', 
                             data=limits)
    assert response.status_code==200
    assert initial_count + 1 == response.json['data']['total'][0]['total'] 

    data = response.json['data']['filters'][0]
    
    # TODO fixup response to match update
    data['is_active'] = data['isActive']
    

    if 'test' in config.getKey("mysql_db"):
        data['name'] = "Updated test filter"   
    response = client.post('/filter/update', follow_redirects=True,
                           data=json.dumps(data))
    assert response.status_code==200
    assert "success" in response.json['data']
    
    # TODO test change with get

def test_results_urls(client):
        
    response = client.post('/results/list', 
                             data=limits)
    assert response.status_code==200
    assert "data" in response.json
    assert "total" in response.json['data']
    initial_count = response.json['data']['total'][0]['total']
    
    # TODO test change with get
    
def test_jobs_urls(client):
        
    response = client.post('/jobs/list', 
                             data=limits)
    assert response.status_code==200
    assert "data" in response.json
    assert "total" in response.json['data']
    initial_count = response.json['data']['total'][0]['total']
    
    # TODO test change with get
    
    
def test_metadata_urls(client):
        
    response = client.get('/metadata/get')
    assert response.status_code==200
    assert "data" in response.json
    assert 2 <= len(response.json['data'])
    names = [ name['name'] for name in response.json['data'][1]['columns'] ]
    assert 2 <= len(names)
    assert 'facebook' in names         # might be a bit brittle as the second array could change in test/prod db

    #  TODO Spark based
    # response = client.get('/metadata_refresh')
    # assert response.status_code==200
    # assert "data" in response.json
    
    
    
def mtest_spark_urls(client):    #TODO work on these tests
    
    data = {
        "id": 1, 
        "name":"paul"
    }
    response = client.post('/facebook/update', follow_redirects=True,
                           data=json.dumps(data))
    print (response.data)
    assert response.status_code==200
    
    
