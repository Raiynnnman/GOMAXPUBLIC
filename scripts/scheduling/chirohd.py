
import os
import sys
import json
import requests
from datetime import datetime,timedelta

sys.path.append(os.getcwd())  # noqa: E402
from common import settings
from util import encryption,calcdate
import argparse

config = settings.config()
config.read("settings.cfg")

parser = argparse.ArgumentParser()
parser.add_argument('--user', dest="user", action="store")
args = parser.parse_args()

BASE="https://www.chirohd.com/api"
EP="/users/me"
AUTH="eyJraWQiOiJvdXZ3R2tCaTNBZk8zR3ZFaEE5MWt4RVBYYkVrWVZmNnF5ZElsUU1ERk5vPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiMWQ5OGZhMi02NTcyLTQwMmYtYmUxMy1hNTgwNjhjNTMyZDMiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfemxxd2s1N3ZHIiwiY29nbml0bzp1c2VybmFtZSI6ImIxZDk4ZmEyLTY1NzItNDAyZi1iZTEzLWE1ODA2OGM1MzJkMyIsImN1c3RvbTpsb2NhdGlvbiI6ImRiXzFcL25ldHdvcmtfNTQyXC8qXC9sb2NhdGlvbl8xIiwiYXVkIjoiNmswazV0dHRlMzhoajliYmpsbjY3YXV1aGEiLCJldmVudF9pZCI6ImU4M2I3NzhkLTMwNzktNGMyMS1hYmQ4LTgxYjk1OWJkOGJhNCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzI2NzU3NDMwLCJwaG9uZV9udW1iZXIiOiIrMDE4MzI2OTM4OTk4IiwiZXhwIjoxNzI2NzYxMDMwLCJpYXQiOjE3MjY3NTc0MzAsImVtYWlsIjoicGF1bEBwb3VuZHBhaW4uY29tIn0.llxAnD4-uAFu6AXknxn3BTYb5hzYKdkxJSgBEumZVrnZbMFCmsVawMesKBC-_QOEA8BJRuHvTb9tTJWvlrrs5qFTjcJw3RpKmnkMnnrM734OVq5Wsihb_13tKd0a8oHlK7OXbnK2WgmG-i4-9tbsH0KteBBQ5NwYQBMzXMouDNjVcCTHtEqEKBA0JTTHW6RBNAkGkjXeE64yIx6rDf6OR2Z0BzaM8wdsr5gGXKRfvvaTfiEZoXpkr2TIbUqkrLo1zZM4t71HHOmJuenyDsCj3g6YEcQrmEsJajLYHqv8Ptsv5MwpXYObGt3ZfpkCcxfuRmIOrHVoKCBt6cnEVVZORQ"

URL = "%s%s" % (BASE,EP)
headers = {'Authorization':AUTH}
r = requests.get("%s%s" % (BASE,EP),headers=headers)
print(r.text)

obj = {
    "id": None,
    "name": "TEST-PPAIN01",
    "referral_id": "1",
    "email_template_id": None,
    "referral_category_id": "3",
    "allow_in_person": True,
    "allow_virtual": None,
    "expenses_amount": None,
    "location_id": "1",
    "start_timestamp": "2024-09-22T14:20:00Z",
    "end_timestamp": "2024-09-22T15:20:00Z"
}

EP="/events"
r = requests.post("%s%s" % (BASE,EP),headers=headers,json=obj)
print(r.text)
