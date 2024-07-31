# coding=utf-8

import unittest
from datetime import datetime
from datetime import timedelta
from dateutil import parser


def getTimestampNow():
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def getTimestampUTC():
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")

def getYearMonth():
    return datetime.utcnow().strftime("%Y-%m")

def getYearMonthDayHour():
    return datetime.utcnow().strftime("%Y-%m-%d-%H")

def getTimestampUTCMonth():
    return datetime.utcnow().strftime("%Y-%m")

def getTimeIntervalAddSecondsRaw(d, seconds):
    if d is None:
        d = datetime.utcnow()
    n = d + timedelta(seconds=seconds)
    return n

def getTimeIntervalAddMonths(d, m):
    if d is None:
        d = datetime.utcnow()
    n = d + timedelta(days=(m*30))
    return n

def getTimeIntervalAddSeconds(d, seconds):
    if d is None:
        d = datetime.utcnow()
    n = d + timedelta(seconds=seconds)
    return n.strftime("%Y-%m-%dT%H:%M:%S.%f")

def getTimeIntervalAddHoursRaw(d, hours):
    if d is None:
        d = datetime.utcnow()
    n = d + timedelta(hours=hours)
    return n


def getHoursFromNowRaw(hours):
    j = datetime.now() + timedelta(hours=hours)
    return j

def getHoursFromNow(hours):
    j = getHoursFromNowRaw(hours)
    return j.strftime("%Y-%m-%dT%H:%M:%S.%f")

def getFormat(s):
    mys = s
    myformat = "%Y-%m-%dT%H:%M:%S"
    # Remove the + from timestamps
    if isinstance(s, int):
        myformat = "%s"
        return myformat
    if '+' in s:
        mys = s.split("+")[0]

    if 'T' not in mys:
        myformat = "%Y-%m-%d"
    elif 'Z' in mys and '.' in mys:
        myformat = "%Y-%m-%dT%H:%M:%S.%fZ"
    elif 'Z' in mys:
        myformat = "%Y-%m-%dT%H:%M:%SZ"
    elif '.' in mys:
        myformat = "%Y-%m-%dT%H:%M:%S.%f"

    return myformat

def sysParseDate(s):
    q = parser.parse(s)
    return q

def parseDate(s):
    q = s
    if isinstance(s, int):
        return s
    if s is None:
        return datetime.utcnow()
    else:
        if isinstance(s, str) and '+' in s:
            s = s.split("+")[0]
        n = getFormat(s)
        try:
            q = datetime.strptime(s, n)
        except:
            pass
    return q


def isPastDateTime(start, end):
    if start is None:
        start = datetime.utcnow()
    # TODO: Anticipate different formats here
    myformat = "%Y-%m-%dT%H:%M:%S.%f"

    end = datetime.strptime(end, myformat)
    if start > end:
        return True
    return False

def hoursDiff(s, e):
    if s is None:
        s = datetime.utcnow()
    if type(s) is str:
        myformat = getFormat(s)
    if type(e) is str:
        myformat = getFormat(e)

    if type(s) == str:
        s = datetime.strptime(s, myformat)
    if type(e) == str:
        e = datetime.strptime(e, myformat)
    sec = (e - s).seconds
    ret = sec / 3600
    return ret

