#!/bin/sh

CONF=`pwd`/bin/conf/flyway.conf
if [ -f `pwd`/bin/conf/flyway.conf.$USER ] ; then
    CONF=`pwd`/bin/conf/flyway.conf.$USER
fi
`pwd`/bin/flyway-9.0.1/flyway -configFiles=$CONF repair
