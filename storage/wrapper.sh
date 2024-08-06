#!/bin/sh

source p/bin/activate
rm -f .dblock-dstoolkit

while [ true ]; do

	python server.py
	sleep 2
done
