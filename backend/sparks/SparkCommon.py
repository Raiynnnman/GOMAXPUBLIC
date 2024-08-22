#!/usr/bin/python

import os
import sys
from util import calcdate, encryption 
import base64
from datetime import datetime
from datetime import timedelta
import math
import json
from common import settings 
from sparks.SparkBase import SparkBase

# FRAMES=["m", "d", "y"]
FRAMES=["d"]

config = settings.config()
config.read("settings.cfg")

class SparkCommon(SparkBase):

    def __init__(self):
        super().__init__()

    def getHoursCalc(self, hours, start):
        if start is None:
            start = datetime.now()

        myformat = "%Y-%m-%d %H"
        if hours <= 24:
            myformat = "%Y-%m-%d %H"
            
        r = {}
        end = calcdate.getTimeIntervalAddSecondsRaw(
            start, hours * 3600 * -1
        )
        myseconds = hours * 3600
        bucket = math.ceil(myseconds / 25)
        c = myseconds 
        me = end
        while c > 0:
            c -= bucket
            me = calcdate.getTimeIntervalAddSecondsRaw(start, c * -1)
            t = me.strftime(myformat)
            if me < end:
                continue
            r[t] = 0
        return r
            
    def bucketTime(self, r, d, val):
        mykeys = sorted(r.keys(), reverse=True)
        c = 0
        while c < len(mykeys) - 1:
            k = mykeys[c]
            c0 = calcdate.sysParseDate(mykeys[c])
            c1 = calcdate.sysParseDate(mykeys[c + 1])
            if c0 < d > c1:
                r[k] += val
                c = len(mykeys) + 1
            c += 1
        return r

    def sortTimedateKeys(self, r):
        ret = []
        if not isinstance(r, dict):
            print("sortTimedateKeys: required to be dict")
        mykeys = sorted(r.keys())
        for n in mykeys:
            ret.append({n:r[n]})
        return ret

    def linreg(self, X, Y):
        """
        return a,b in solution to y = ax + b such that root mean square distance between trend line and original points is minimized
        """
        N = len(X)
        Sx = Sy = Sxx = Syy = Sxy = 0.0
        for x, y in zip(X, Y):
            Sx = Sx + x
            Sy = Sy + y
            Sxx = Sxx + x*x
            Syy = Syy + y*y
            Sxy = Sxy + x*y
        det = Sxx * N - Sx * Sx
        return (Sxy * N - Sy * Sx)/det, (Sxx * Sy - Sx * Sxy)/det

