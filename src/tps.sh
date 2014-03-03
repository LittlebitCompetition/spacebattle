#!/bin/bash

_s=0
tick=0
overtick=1
_ms=0

#interval=1000000000
tune=-300000
tuner=5000
to_tps=60
((interval=1000000000/$to_tps))

while true ; do
sec=1"`date +%S%N`"
#echo $sec

#exit 0
s=${sec:2:1}


if [ "$_ms" -gt 160000000000 -a "$sec" -lt 159000000000 ] ; then
#	echo $sec
#	echo $_ms
	((_ms=$_ms-60000000000)) 
#	echo $_ms
#	echo "---"
fi

if [ "$_ms" -lt "$sec" ] ; then
	((_ms=$sec+$interval+$tune))
	((++tick))
fi


if [ "$_s" != "$s" ] ; then

	echo "tick: $tick ; overtick: "$(($overtick-$tick))"; busy: "$((to_tps*100/$overtick))"%"

	if [ "$tick" -lt "$to_tps" ] ; then ((interval=$interval-$tuner)) ; fi
	if [ "$tick" -gt "$to_tps" ] ; then ((interval=$interval+$tuner)) ; fi

	_s="$s"
	tick=1
	overtick=0
fi
((++overtick))
done
