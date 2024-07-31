
import glob
import json
import os
import sys
from datetime import date
import argparse
import requests

'''Load settings.cfg'''
sys.path.append(os.getcwd())  # noqa: E402

from common import settings

rmvFilts = "DELETE * FROM filters"
rmvFilts_list = "DELETE * FROM filter_list"

insertString = '''

insert into dstoolkit.filters (tblname, dstoolkit.filters.name) values('%s', '%s');
insert into dstoolkit.filter_list (dstoolkit.filter_list.filters_id, dstoolkit.filter_list.script, dstoolkit.filter_list.name) Values
(LAST_INSERT_ID(),

'
%s
',
'');

'''