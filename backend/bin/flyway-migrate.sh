#!/bin/sh

if [ -d /usr/lib/jvm/java-17-openjdk-arm64 ];then
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64
fi

CONF=`pwd`/bin/conf/flyway.conf
if [ -f `pwd`/bin/conf/flyway.conf.$USER ] ; then
    CONF=`pwd`/bin/conf/flyway.conf.$USER
fi
`pwd`/bin/flyway-9.0.1/flyway -configFiles=$CONF migrate
