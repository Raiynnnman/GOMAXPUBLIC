# coding=utf-8

import os
import json
import unittest
from flask import request, jsonify

from rest.RestBase import RestBase
from processing.SemrushDataRequest import *

class BacklinkFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = BacklinkDataRequest()
        ret = fdr.process(args[0])
        return ret

class AnchorFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = AnchorDataRequest()
        ret = fdr.process(args[0])
        return ret

class TrafficSourceFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = TrafficSourceDataRequest()
        ret = fdr.process(args[0])
        return ret

class TrafficDestinationFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = TrafficDestinationDataRequest()
        ret = fdr.process(args[0])
        return ret

class OrganicWordSearchFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = OrganicWordSearchDataRequest()
        ret = fdr.process(args[0])
        return ret

class PaidWordSearchFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = PaidWordSearchDataRequest()
        ret = fdr.process(args[0])
        return ret

class TrafficByCountryFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = TrafficByCountryDataRequest()
        ret = fdr.process(args[0])
        return ret

class BounceRateFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = BounceRateDataRequest()
        ret = fdr.process(args[0])
        return ret

class PagesPerVisitFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = PagesPerVisitDataRequest()
        ret = fdr.process(args[0])
        return ret

class AvgVisitDurationFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = AvgVisitDurationDataRequest()
        ret = fdr.process(args[0])
        return ret

class UniqueVisitorsFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = UniqueVisitorsDataRequest()
        ret = fdr.process(args[0])
        return ret
        
class TotalVisitorsFeed(RestBase):

    def post(self, *args, **kwargs):
        fdr = TotalVisitorsDataRequest()
        ret = fdr.process(args[0])
        return ret