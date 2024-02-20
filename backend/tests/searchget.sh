
curl localhost:8001/search/get \
-XPOST \
-d'{"procedure": 36, "location": {"lat": 29.5741419, "lon": -95.2406752}, "selected": 0, "zipcode": "77089"}'
