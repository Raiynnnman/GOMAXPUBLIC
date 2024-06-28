#!/bin/sh

# set -x
source p/bin/activate || . p/bin/activate

for x in $*; do
    filename=$(basename -- "$x")
    EXT="${filename#*.}"
    # echo "EXT=$EXT"
	P=$x
	# echo "PROCESS: $P"
	G=`basename $P .$EXT`
    # echo "G=$G"
	K=`dirname $P`
    if [ ! -d __pycache__ ]; then
	    (cd $K && ln -s `basename $P` $G.pyc)
        if [ -f $K/$G.pyc ]; then python $K/$G.pyc; fi 
    elif [ -d `dirname $K`/__pycache__ ]; then
	    (cd $K/.. && ln -s __pycache__/`basename $P` $G.pyc)
        if [ -f $K/$G.pyc ]; then python $K/$G.pyc; fi 
    fi

done
