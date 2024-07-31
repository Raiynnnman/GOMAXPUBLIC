#!/bin/sh

source p/bin/activate

export PYTHON_PATH=$PYTHON_PATH:`pwd`
for x in `grep app.task */*.py | awk -F: '{ print $1 }' | uniq`; 
    do T=`echo $x | sed -e 's/\.py//g' -e 's%\/%\.%g'`; I="$I$T,"; 
done
I="`echo $I | sed 's/,$//g'`"
echo $I

if [ -f bin/get_celery_prefix.pyc ]; then
    SCR=bin/get_celery_prefix.pyc
else
    SCR=bin/get_celery_prefix.py
fi

PREFIX="`python $SCR`"
if [ -z "$PREFIX" ]; then PREFIX="dev-$USER-queue"; fi
echo "PREFIX=$PREFIX"

bash -c "source p/bin/activate && watchmedo auto-restart \
        --directory=./ --pattern=*.py --recursive \
        -- celery -A processing.run worker -c 2 -Q $PREFIX -l info \
        --include=$I"
