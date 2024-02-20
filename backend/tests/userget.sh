
curl localhost:8001/user/get \
    -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InBhdWxtYXN6eUBnbWFpbC5jb20iLCJ1c2VyX2lkIjoxMTN9.6-7WtCT7uOn0xLHNwPZhWvzCFazor8PapC0FBWKJ5R0" \
    -XPOST \
    -d'{"location": {"lat": 29.5741419, "lon": -95.2406752}}'
