#!/bin/bash

umask 0002 # Set this so that we make it group writable
check_error() {
    if [ $1 != "0" ]; then
            echo "$2"
            exit 1
    fi
}

help() {
    echo "$0 -d <site> -a <archive> -x <database>"
    echo "-d: where to deploy"
    echo "-a: where the API is deployed (external facing)"
    echo "-e: domain"
}

MYDIR=`pwd`
if [ -z "$BASE" ]; then
    BASE=/u01/sites
fi
TODAY=`date +"%Y%j%H%M"`

if [ -z "$CONFIGDIR" ]; then
    CONFIGDIR=/u01/vassals
fi
if [ -z "$LOGDIR" ]; then
    LOGDIR=/u01/logs
fi
TARBALL=install.tar.gz

# Grab it from ENV, set it if not set
if [ -z "$PROCESSES" ]; then PROCESSES=5; fi

while [ $1 ]; do
    case $1 in
            -d*)
                SITEDIR=$2
                shift
                ;;
            -a)
                APINAME=$2
                shift
                ;;
            -e)
                DOMAIN=$2
                shift
                ;;
            -h)
                help
                exit 1
                ;;
            *)
                echo "unknown arg $1"
                help
                exit 1
                ;;

    esac
    shift
done

if [ -z "$DOMAIN" ]; then
    echo "Missing domain"
    help
    exit 1
fi

if [ -z "$SITEDIR" ]; then
    echo "Missing sitedir"
    help
    exit 1
fi
if [ -z "$APINAME" ]; then
    echo "Missing APINAME"
    help
    exit 1
fi

SITENAME="`basename $SITEDIR`"
APIDOMAIN="$APINAME.$DOMAIN"

### Already exists in production
if [ -z "$NOCOPYTAR"] && [ -d $SITEDIR ]; then
    echo "ERROR: Site already exists"
    exit 1
fi

mkdir -p $SITEDIR
check_error $? "make sitedir"

(cd $SITEDIR && tar xfz $MYDIR/$TARBALL)
check_error $? "untar site"

cd $SITEDIR
check_error $? "cd sitedir"

### Turn off python for the front ui
if [ -f .front-ui ]; then
    rm -f requirements.txt
fi

if [ -f requirements.txt ]; then 
    python3 -m venv p
    check_error $? "generate virtual environment"

    source p/bin/activate

    pip3 install -r requirements.txt
    check_error $? "get requirements"
fi


## For internal processes, dont want to enable https
## if its data services, remove the https redirect
(
cat <<EOF
server {
    listen  80;
    # listen  443 ssl;

    # ssl on;
    # ssl_certificate /etc/nginx/ssl/fullchain.pem;
    # ssl_certificate_key /etc/nginx/ssl/fullchain.pem.key;

    server_name $SITENAME;
    access_log $LOGDIR/$SITENAME/nginx-access.log;
    error_log $LOGDIR/$SITENAME/nginx-error.log;
    client_max_body_size 500M;
    uwsgi_connect_timeout 600s;
    uwsgi_request_buffering on;
    uwsgi_send_timeout    600s;
    uwsgi_read_timeout    600s;

    location /assets/ {
        root $SITEDIR/;
    }
    location /css/ {
        root $SITEDIR/;
    }
    location / {
# back_ui        root            $SITEDIR/templates/;
# front_ui        root            $SITEDIR/dist/;
# back_ui        include         uwsgi_params;
# back_ui        uwsgi_pass      unix:/var/lib/nginx/sockets/$SITENAME.sock;
# front_ui        try_files       \$uri \$uri/ /index.html;
    }
}

EOF
) > nginx.conf.tmpl

(
cat <<EOF
[uwsgi]
project=$SITENAME
base=$BASE
chdir = %(base)/%(project)
home = %(base)/%(project)/p/
# wsgi-file = %(base)/%(project)/server.py
module = server
post-buffering=65535
plugins = python3
master = true
processes = $PROCESSES
stats = /var/lib/nginx/sockets/%(project)-stats.sock
socket = /var/lib/nginx/sockets/%(project).sock
chmod-socket = 664
vacuum = true
daemonize = $LOGDIR/%(project)/uwsgi-@(exec://date +%%Y-%%m-%%d).log
log-reopen = true
env = LANG='en_US.UTF-8'
callable = app
buffer-size = 32768
enable-threads = true
thunder-lock = true
max-requests = 5000
thread-stacksize = 512
reload-on-rss = 125
EOF
) > uwsgi.ini.tmpl


echo "mydir=$MYDIR"
if [ -f $MYDIR/settings.cfg ]; then
    if [ "$MYDIR" != "$SITEDIR" ]; then
            cp $MYDIR/settings.cfg $SITEDIR
            check_error $? "copy configuration"
            cp $SITEDIR/settings.cfg $SITEDIR/settings.cfg.2
            G="$SITENAME.$DOMAIN"
### Replace customer specific strings
            cat $SITEDIR/settings.cfg.2 | sed -e "s/__MYDOMAIN__/$G/g" > $SITEDIR/settings.cfg
            STRIPEKEY="`grep stripe_pub_key settings.cfg | awk -F= '{ print $2 }'`"
            ENCKEY="`grep encryption_key settings.cfg | awk -F= '{ print $2 }'`"
            if [ -z "$STRIPEKEY" ]; then STRIPEKEY="UNKNOWN"; fi
            if [ -z "$ENCKEY" ]; then ENCKEY="OMGYESNOKEYLOL"; fi
            rm -f $SITEDIR/settings.cfg.2 
            rm -f $SITEDIR/settings.cfg.tmpl
            if [ -d dist ]; then
                for x in dist/*; do
                    if [ -d $x ]; then continue; fi
                    cp $x $x.2
                    cat $x.2 | sed -e "s/__DOMAIN__/$DOMAIN/g" \
                                   -e "s/__MYAPIDOMAIN__/https:\/\/$APIDOMAIN/g" \
                                   -e "s/__MYENCRYPTIONKEY__/$ENCKEY/g" \
                                   -e "s/__MYSTRIPEKEY__/$STRIPEKEY/g" > $x
                    rm -f $x.2
                done
                rm -f settings.cfg.2
            fi
    fi

    if [ -f $SITEDIR/.celery-process ]; then
        echo "smart-attach-daemon = $LOGDIR/%(project)/celery.pid bash bin/launch-celery.sh worker " \
                    "-l info -B --pidfile=$LOGDIR/%(project)/celery.pid -n worker1.%h " \
                    " --schedule=$LOGDIR/%(project)/celery-schedule.db " \
                    " --logfile=$LOGDIR/%(project)/celery-%(project)-@(exec://date +%%Y-%%m-%%d).log " \
            " --autoscale=1,3" >> $SITEDIR/uwsgi.ini.tmpl
        if [ -f "$LOGDIR/$SITENAME.$DOMAIN/celery.pid" ]; then
            kill -9 `cat $LOGDIR/$SITENAME.$DOMAIN/celery.pid`
            rm -f $LOGDIR/$SITENAME.$DOMAIN/celery.pid
        fi
    fi

    # Front end doesnt use python anymore. Strip it
    if [ -f .front-ui ]; then
        rm -f $SITEDIR/uwsgi.ini.tmpl
    fi

    # Mechanic to deal with nginx issues and turning off features
    # for background APIs
    if [ -f .front-ui ]; then
        cp $SITEDIR/nginx.conf.tmpl $SITEDIR/nginx.conf.tmpl.2
        sed 's/# front_ui//g' $SITEDIR/nginx.conf.tmpl.2 > $SITEDIR/nginx.conf.tmpl
        rm -f $SITEDIR/nginx.conf.tmpl.2
    else
        cp $SITEDIR/nginx.conf.tmpl $SITEDIR/nginx.conf.tmpl.2
        sed 's/# back_ui//g' $SITEDIR/nginx.conf.tmpl.2 > $SITEDIR/nginx.conf.tmpl
        rm -f $SITEDIR/nginx.conf.tmpl.2
    fi

    if [ -f $SITEDIR/uwsgi.ini.tmpl ]; then
        ln -s $SITEDIR/uwsgi.ini.tmpl $SITEDIR/uwsgi.ini
        check_error $? "link uwsgi"
    fi

    ln -s $SITEDIR/nginx.conf.tmpl $SITEDIR/nginx.conf
    check_error $? "link nginx"

    mkdir -p $LOGDIR/$SITENAME
    check_error $? "make logging directory"

    mkdir -p $LOGDIR/$SITENAME/temporary
    check_error $? "make temporary directory"

    echo "user = $USER"
    if [ "$USER" = "root" ]; then
        chown jenkins:jenkins $LOGDIR/$SITENAME $SITEDIR/.
    fi
fi

if [ -f "$WORKSPACE/ipmapping.db" ] && [ -d "$SITEDIR/handlers/data" ]; then
    cp $WORKSPACE/ipmapping.db $SITEDIR/handlers/data/ipmapping.db
fi

### everything is good, activate the site
if [ -d $CONFIGDIR ]; then
    if [ -f $CONFIGDIR/$SITENAME.ini ]; then rm -f $CONFIGDIR/$SITENAME.ini; fi
    if [ -f $SITEDIR/uwsgi.ini ]; then ln -s $SITEDIR/uwsgi.ini $CONFIGDIR/$SITENAME.ini; fi
fi

exit 0


