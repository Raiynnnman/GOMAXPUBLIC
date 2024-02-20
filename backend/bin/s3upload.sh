#!/bin/sh

if [ $# -gt 0 ]; then
	TARGETS=$*
else
	echo "Files required!"
	exit 1
fi

if [ -z "$S3_BUCKET" ]; then
    export S3_BUCKET="ec0cf6c9d9768aad572ea9a4084738e51780fbe47d235277d096193c039ab99"
fi

for x in $TARGETS; do

	aws s3 cp --quiet $x s3://$S3_BUCKET/$x
	if [ $? != "0" ]; then exit 1; fi

done
	
