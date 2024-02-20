
if [ -f common/version.py ]; then rm -f common/version.py; fi

if [ -d common ]; then
    touch common/version.py
fi

if [ -f ../version ]; then
	source ../version
fi
if [ -f ../../version ]; then
	source ../../version
fi

if [ -z "$BUILD" ]; then BUILD="dev"; fi

if [ -z "$BUILD_NUMBER" ]; then 
    BUILD="dev"; 
else
    BUILD=$BUILD_NUMBER; 
fi

COMMIT=`git log -n 1 | head -n 1 | awk '{ print $2 }' | cut -c 1-8`

if [ -z "$MAJOR" ]; then 
	echo "Error: No major found";
	exit 1; 
fi

if [ -d common ]; then
(
cat <<EOF
MAJOR = $MAJOR
MINOR = $MINOR
RELEASE = $RELEASE
COMMIT = "$COMMIT"
BUILD = "$BUILD"


def getAbbrevVer():
    return "%s.%s.%s.%s" % (MAJOR, MINOR, RELEASE, BUILD)

def getVersion():
    return "%s.%s.%s.%s-%s" % (
        MAJOR, MINOR, RELEASE, BUILD, COMMIT
    )
EOF
) > common/version.py
fi

if [ -f server.js ]; then
(
cat <<EOF

export const getVersion = function() { 
    var MAJOR=$MAJOR;
    var MINOR=$MINOR;
    var RELEASE=$RELEASE;
    var COMMIT="$COMMIT";
    var BUILD="$BUILD";
    return MAJOR + "." + MINOR + "." + RELEASE + "." + BUILD + "-" + COMMIT; 
}

export default getVersion;
EOF
) > version.js
fi

if [ -d src/ ]; then
(
cat <<EOF

export const getVersion = function() { 
    var MAJOR=$MAJOR;
    var MINOR=$MINOR;
    var RELEASE=$RELEASE;
    var COMMIT="$COMMIT";
    var BUILD="$BUILD";
    return MAJOR + "." + MINOR + "." + RELEASE + "." + BUILD + "-" + COMMIT; 
}

export default getVersion;
EOF
) > src/version.js
fi


(
cat <<EOF

export MAJOR=$MAJOR
export MINOR=$MINOR
export RELEASE=$RELEASE
export COMMIT="$COMMIT"
export BUILD="$BUILD"

EOF
) > ../version.sh

(
cat <<EOF

MAJOR=$MAJOR
MINOR=$MINOR
RELEASE=$RELEASE
BUILD=$BUILD
COMMIT=$COMMIT

EOF
) > ../version.ini
