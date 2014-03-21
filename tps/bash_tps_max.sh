#!/bin/bash

t=0
s="`date +%s`"

while true ; do

	n="`date +%s`"

	if [ "$s" != "$n" ] ; then
		s="$n"
		echo "BASH: Tick Per Second: $t"
		t=0
	fi

	((++t))

done
