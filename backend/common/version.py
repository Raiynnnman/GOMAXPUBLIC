MAJOR = 3
MINOR = 0
RELEASE = 0
COMMIT = "e1fde967"
BUILD = "dev"


def getAbbrevVer():
    return "%s.%s.%s.%s" % (MAJOR, MINOR, RELEASE, BUILD)

def getVersion():
    return "%s.%s.%s.%s-%s" % (
        MAJOR, MINOR, RELEASE, BUILD, COMMIT
    )
