#!/bin/sh

HOST=`hostname`
CONF=`pwd`/bin/conf/flyway.conf
if [ -f `pwd`/bin/conf/flyway.conf.$USER ] ; then
    CONF=`pwd`/bin/conf/flyway.conf.$USER
fi
if [ -f `pwd`/bin/conf/flyway.conf.$USER.$HOST ] ; then
    CONF=`pwd`/bin/conf/flyway.conf.$USER.$HOST
fi
`pwd`/bin/flyway-9.0.1/flyway -configFiles=$CONF repair
