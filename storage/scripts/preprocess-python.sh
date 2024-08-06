#!/bin/sh

set -x

for x in $*; do
    filename=$(basename -- "$x")
    EXT="${filename#*.}"
    echo "EXT=$EXT"
	P=$x
	echo "PROCESS: $P"
	G=`basename $P .$EXT`
    echo "G=$G"
	K=`dirname $P`
    if [ ! -d __pycache__ ]; then
	    (cd $K && ln -s `basename $P` $G.pyc)
    elif [ -d `dirname $K`/__pycache__ ]; then
	    (cd $K/.. && ln -s __pycache__/`basename $P` $G.pyc)
    fi

done
