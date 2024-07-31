from __future__ import print_function  # Use print() instead of print
from flask import url_for
import time

from util.DBManager import DBManager
import time

    
def test_systems(client):
    
    
    conn_count = {}
    i = 0
    times = DBManager()._pool_size * 2 + 1
    start = time.time()
    while i < times:
    
        mydb = DBManager().getConnection()
        # count the unique connections
        conn_id = mydb._open_connection.__hash__()
        conn_count[conn_id] = conn_count.get(conn_id, 0) + 1
        mydb.close()
        i += 1
 
    end = time.time() - start
    max_reuse = 0
    for conn in conn_count:
        if max_reuse < conn_count[conn]:
            max_reuse = conn_count[conn]
    print ("seconds to get %s connections: %s.  max reuse: %s" % (len(conn_count), end, max_reuse))
    #confirm we did reuse connections
    assert len(conn_count) <= DBManager()._pool_size
    assert max_reuse > 2

     
    
    
def test_urls(client):

    response = client.get('/service/online', follow_redirects=True)
    assert response.status_code==200
    assert 'status' in response.json
    
