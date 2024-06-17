
curl localhost:8000/chat \
    -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InBtYXN6eUBkaXJlY3RoZWFsdGhkZWxpdmVyeS5jb20iLCJ1c2VyX2lkIjoxMDB9.TwKSnMlJJiT8BIymLcD_NQ1aNIfH0RFxWmwp5RHQMBg" \
    -H "Content-Type: application/json" \
    -XPOST -d'{"limit":10000,"offset":0}'
