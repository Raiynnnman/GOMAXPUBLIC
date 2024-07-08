
#!/usr/bin/python

import os
import random
import traceback
import sys
from datetime import datetime, timedelta
import time
import json
import pandas as pd
from nameparser import HumanName

sys.path.append(os.getcwd())  # noqa: E402


H=open("sm_contacts.json","r")
js=H.read()
H.close()
js = json.loads(js)

FIN = []
for x in js:
    FIN.append(js[x])

frame = pd.DataFrame.from_dict(FIN)
t = frame.to_csv()
H=open("output.csv","w")
H.write(t)
H.close()
