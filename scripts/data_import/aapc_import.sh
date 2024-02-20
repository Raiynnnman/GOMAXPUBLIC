
grep -R '/cpt-codes/' www.aapc.com/codes/cpt-codes-range/ | awk -Fhref= '{ print $2 }' | awk -F\> '{print $1}' | sed 's/"//g' | awk '{ print $1 }' | sort | uniq > list

for x in `cat list`; do
	T=`echo $x | sed 's/https:\/\///g'`
	echo $T
	if [ ! -e $T ]; then
		wget --mirror -nc $x --wait=1 --no-parent --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36" --convert-links --level=1
		sleep 1	
	fi
done
