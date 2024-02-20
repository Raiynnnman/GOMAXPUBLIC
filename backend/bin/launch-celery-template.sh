
umask 0077
source version.sh || . version.sh
export PYTHON_PATH=$PYTHON_PATH:`pwd`
export PREFIX="prodqueue"

source p/bin/activate || . p/bin/activate
if [ -f bin/get_celery_prefix.pyc ]; then
    SCR=bin/get_celery_prefix.pyc
else
    SCR=bin/get_celery_prefix.py
fi

PREFIX="`python $SCR`"
if [ -f .queue ]; then
    PREFIX="`cat .queue`"
fi

CHDIR=.

for x in $*; do
        case $x in
                --pidfile*)
                        PIDF="`echo $x | awk -F= '{ print $2 }'`"
                ;;
                --logfile*)
                        X="`echo $x | awk -F= '{ print $2 }' | sed 's/logs/sites/g'`"
                        CHDIR="`dirname $X`"
                ;;
                *)
                ;;
        esac
done
if [ ! -z "$PIDF" ] && [ -f "$PIDF" ]; then
        kill -HUP `cat $PIDF`
fi

cd $CHDIR

bash -c "source p/bin/activate && celery -A  processing.run $* -Q $PREFIX -I $I"
