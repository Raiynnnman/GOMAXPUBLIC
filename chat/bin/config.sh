#!/bin/sh
T='{'
for x in `cat settings.cfg| grep -v '#' | grep -v Configuration`; do
    K=`echo $x | awk -F= '{ print $1 }'`
    V=`echo $x | awk -F= '{ print $2 }'`
    T="$T\n\t\"$K\":\"$V\","
done

echo -e "$T}" > default.json
cat default.json | sed 's/,}/}/g' > config/default.json
rm default.json
