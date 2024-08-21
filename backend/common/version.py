MAJOR = 3
MINOR = 1
RELEASE = 0
COMMIT = "1e3342a4"
BUILD = "dev"


def getAbbrevVer():
    return "%s.%s.%s.%s" % (MAJOR, MINOR, RELEASE, BUILD)

def getVersion():
    return "%s.%s.%s.%s-%s" % (
        MAJOR, MINOR, RELEASE, BUILD, COMMIT
    )
