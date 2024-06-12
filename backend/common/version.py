MAJOR = 3
MINOR = 0
RELEASE = 0
COMMIT = "59274e1e"
BUILD = "dev"


def getAbbrevVer():
    return "%s.%s.%s.%s" % (MAJOR, MINOR, RELEASE, BUILD)

def getVersion():
    return "%s.%s.%s.%s-%s" % (
        MAJOR, MINOR, RELEASE, BUILD, COMMIT
    )
