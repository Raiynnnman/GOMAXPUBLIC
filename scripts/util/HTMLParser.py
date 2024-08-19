
from html.parser import HTMLParser

class HTMLParser(HTMLParser):
    __DATA__ = []
    __CUR__ = {}
    def handle_starttag(self, tag, attrs):
        self.__CUR__ = {'tag':tag,'attrs':attrs,'data':[]}

    def handle_endtag(self, tag):
        self.__DATA__.append(self.__CUR__)

    def handle_data(self, data):
        self.__CUR__['data'].append(data)

    def get(self):
        return self.__DATA__
