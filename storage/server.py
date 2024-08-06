# coding=utf-8

import os
import sys
from flasgger import Swagger
from flask import Flask
from flask import request

from common import settings, version
from rest import FacebookFeed, JobsListFeed, QueryListFeed
from rest import QueryFeed, MetadataFeed, MetadataGetFeed
from rest import ExampleFeed, QueryRunFeed, ResultListFeed
from rest import ResultGetFeed, QueryCreateFeed, DatasetListFeed
from rest import QueryUpdateFeed, FilterListFeed, FilterCreateFeed
from rest import FilterUpdateFeed, DatasetUpdateFeed, DatasetCreateFeed
from rest import DatasetRunFeed, DatasetGetFeed, AthleteFeed
from rest import TournamentFeed, ScrapingFeed
from rest import SemrushFeed, TwitterFeed

app = Flask(__name__)

APIVER_MAJOR = 3
APIVER_MINOR = 0

app.template_folder = "./templates/"
app.static_folder = "./templates/"
app.static_path = "./templates/"
app.static_url_path = "./templates/"
app.instance_path = "./templates/"

config = settings.config()
config.read("settings.cfg")
os.umask(0o077)

debug = False
debugMode = config.getKey("debug")
if debugMode is not None:
    app.config['DEBUG'] = True
    debug = True
else:
    app.config['DEBUG'] = False

max_upload = config.getKey("max_upload_size")
if max_upload is None:
    max_upload = "10 * 1024 * 1024"
app.config['MAX_CONTENT_LENGTH'] = max_upload

app.config['SWAGGER'] = {
    "swagger_version": "2.0",
    "uiversion": "2",
    "specs": [
        {
            "version": "%s.%s.%s.%s-%s" % (
                version.MAJOR, version.MINOR, version.BUILD,
                version.RELEASE, version.COMMIT[0:7]),
            "title": "#PAIN internal API: %s.%s.%s.%s-%s" % (
                version.MAJOR, version.MINOR, version.RELEASE, version.BUILD,
                version.COMMIT[0:7]),
            "description": "#PAIN internal API, v%s.%s.%s.%s-%s" % (
                version.MAJOR, version.MINOR, version.RELEASE, version.BUILD,
                version.COMMIT[0:7]),
            "endpoint": 'v3_0',
            "route": '/3.0/spec'
        }
    ]
}


Swagger(app)

# move these imports here to avoid potential circular import issues
from rest import FacebookFeed, JobsListFeed, QueryListFeed
from rest import QueryFeed, MetadataFeed, MetadataGetFeed
from rest import ExampleFeed, QueryRunFeed, ResultListFeed
from rest import ResultGetFeed, QueryCreateFeed, DatasetListFeed
from rest import QueryUpdateFeed, FilterListFeed, FilterCreateFeed
from rest import FilterUpdateFeed, DatasetUpdateFeed, DatasetCreateFeed
from rest import DatasetRunFeed, DatasetGetFeed, AthleteFeed
from rest import TournamentFeed, EventSocialsFeed, ExportFeed


@app.route('/example/update', methods=["POST"])
def example():
    fb = ExampleFeed.ExampleFeed()
    return fb.postWrapper(request)

@app.route('/scraping/update', methods=["POST"])
def scraping():
    fb = ScrapingFeed.ScrapingFeed()
    return fb.postWrapper(request)

@app.route('/export/raw', methods=["POST"])
def export():
    fb = ExportFeed.ExportFeed()
    return fb.postWrapper(request)

@app.route('/tournament/update', methods=["POST"])
def tournament():
    fb = TournamentFeed.TournamentFeed()
    return fb.postWrapper(request)

@app.route('/athlete/update', methods=["POST"])
def athlete():
    fb = AthleteFeed.AthleteFeed()
    return fb.postWrapper(request)

@app.route('/semrush/backlinks/update', methods=["POST"])
def backlinks():
    fb = SemrushFeed.BacklinkFeed()
    return fb.postWrapper(request)

@app.route('/semrush/anchors/update', methods=["POST"])
def anchors():
    fb = SemrushFeed.AnchorFeed()
    return fb.postWrapper(request)

@app.route('/semrush/trafficSources/update', methods=["POST"])
def trafficSources():
    fb = SemrushFeed.TrafficSourceFeed()
    return fb.postWrapper(request)

@app.route('/semrush/trafficDestinations/update', methods=["POST"])
def trafficDestinations():
    fb = SemrushFeed.TrafficDestinationFeed()
    return fb.postWrapper(request)

@app.route('/semrush/organicWordSearch/update', methods=["POST"])
def organicWordSearch():
    fb = SemrushFeed.OrganicWordSearchFeed()
    return fb.postWrapper(request)

@app.route('/semrush/paidWordSearch/update', methods=["POST"])
def paidWordSearch():
    fb = SemrushFeed.PaidWordSearchFeed()
    return fb.postWrapper(request)

@app.route('/semrush/trafficByCountry/update', methods=["POST"])
def trafficByCountry():
    fb = SemrushFeed.TrafficByCountryFeed()
    return fb.postWrapper(request)

@app.route('/semrush/bounceRate/update', methods=["POST"])
def bounceRate():
    fb = SemrushFeed.BounceRateFeed()
    return fb.postWrapper(request)

@app.route('/semrush/pagesPerVisit/update', methods=["POST"])
def pagesPerVisit():
    fb = SemrushFeed.PagesPerVisitFeed()
    return fb.postWrapper(request)

@app.route('/semrush/visitDuration/update', methods=["POST"])
def visitDuration():
    fb = SemrushFeed.AvgVisitDurationFeed()
    return fb.postWrapper(request)

@app.route('/semrush/uniqueVisitors/update', methods=["POST"])
def uniqueVisitors():
    fb = SemrushFeed.UniqueVisitorsFeed()
    return fb.postWrapper(request)

@app.route('/semrush/totalVisitors/update', methods=["POST"])
def totalVisitors():
    fb = SemrushFeed.TotalVisitorsFeed()
    return fb.postWrapper(request)

@app.route('/facebook/update', methods=["POST"])
def facebook():
    fb = FacebookFeed.FacebookFeed()
    return fb.postWrapper(request)

@app.route('/event_socials/update', methods=["POST"])
def event_socials():
    fb = EventSocialsFeed.EventSocialsFeed()
    return fb.postWrapper(request)

@app.route('/twitter/update', methods=["POST"])
def twitter():
    fb = TwitterFeed.TwitterFeed()
    return fb.postWrapper(request)

@app.route('/query', methods=["POST"])
def query():
    qi = QueryFeed.QueryFeed()
    return qi.postWrapper(request)

@app.route('/metadata_refresh', methods=["GET"])
def metadata():
    mf = MetadataFeed.MetadataFeed()
    return mf.getWrapper()

@app.route('/dataset/run', methods=["POST"])
def datasetrun():
    jf = DatasetRunFeed.DatasetRunFeed()
    return jf.postWrapper(request)

@app.route('/query/run', methods=["POST"])
def queryrun():
    jf = QueryRunFeed.QueryRunFeed()
    return jf.postWrapper(request)

@app.route('/results/get', methods=["POST"])
def resultdownload():
    jf = ResultGetFeed.ResultGetFeed()
    return jf.postWrapper(request)

@app.route('/results/list', methods=["POST"])
def resultlist():
    jf = ResultListFeed.ResultListFeed()
    return jf.postWrapper(request)

@app.route('/filter/update', methods=["POST"])
def filterupdate():
    jf = FilterUpdateFeed.FilterUpdateFeed()
    return jf.postWrapper(request)

@app.route('/filter/create', methods=["POST"])
def filtercreate():
    jf = FilterCreateFeed.FilterCreateFeed()
    return jf.postWrapper(request)

@app.route('/query/update', methods=["POST"])
def queryupdate():
    jf = QueryUpdateFeed.QueryUpdateFeed()
    return jf.postWrapper(request)

@app.route('/query/create', methods=["POST"])
def querycreate():
    jf = QueryCreateFeed.QueryCreateFeed()
    return jf.postWrapper(request)

@app.route('/dataset/get', methods=["POST"])
def datasetget():
    jf = DatasetGetFeed.DatasetGetFeed()
    return jf.postWrapper(request)

@app.route('/dataset/update', methods=["POST"])
def datasetupdate():
    jf = DatasetUpdateFeed.DatasetUpdateFeed()
    return jf.postWrapper(request)

@app.route('/dataset/create', methods=["POST"])
def datasetcreate():
    jf = DatasetCreateFeed.DatasetCreateFeed()
    return jf.postWrapper(request)

@app.route('/dataset/list', methods=["POST"])
def datasetlist():
    jf = DatasetListFeed.DatasetListFeed()
    return jf.postWrapper(request)

@app.route('/filter/list', methods=["POST"])
def filterlist():
    jf = FilterListFeed.FilterListFeed()
    return jf.postWrapper(request)

@app.route('/query/list', methods=["POST"])
def querylist():
    jf = QueryListFeed.QueryListFeed()
    return jf.postWrapper(request)

@app.route('/jobs/list', methods=["POST"])
def jobslist():
    jf = JobsListFeed.JobsListFeed()
    return jf.postWrapper(request)

@app.route('/metadata/get', methods=["GET"])
def metadataget():
    mf = MetadataGetFeed.MetadataGetFeed()
    return mf.getWrapper()

@app.route('/service/online', methods=["GET"])
def online():
    return {'status': True, 'version': app.config['SWAGGER']['specs'][0]['version']}

# ---------
if __name__ == '__main__':
    debug = False
    if config.getKey("debug") is not None:
        debug = True

    if (len(sys.argv) > 1 and "--initDB" in sys.argv):
        from util.DBManager import DBManager
        DBManager().initializeDB()
        
    host = config.getKey("bind_port")
    port = int(config.getKey("http_port"))
    app.run(debug=debug, port=port, host=host)

def create_app():
    return app
