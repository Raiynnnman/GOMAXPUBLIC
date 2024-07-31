#!/bin/sh

BROKER=`grep broker settings.cfg  | awk -F= '{print $2}'`

flower --port=5554 --broker=$BROKER -A recvrs.run
