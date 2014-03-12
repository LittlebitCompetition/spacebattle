#!/bin/bash
shopt -u failglob
shopt -s extglob nullglob dotglob

ramfs="/mnt/ram"

io_main_in="$ramfs/main_in.io"
io_main_out="$ramfs/main_out.io"
io_loop_in="$ramfs/loop_in.io"
io_loop_out="$ramfs/loop_out.io"

touch $io_main_in
touch $io_main_out
touch $io_loop_in
touch $io_loop_out

echo -n "" > $io_main_in
echo -n "" > $io_main_out
echo -n "" > $io_loop_in
echo -n "" > $io_loop_out



_s=0
tick=0
overtick=1
_ms=0
to_tps=60
((interval=1000000000/$to_tps))




function nowStop(){
#	rm -rf $fifo_main
#	rm -rf $fifo_loop1
#	rm -rf $fifo_loop2
	rm $io_main_in $io_main_out $io_loop_in $io_loop_out
	echo "Deleting io ..."
}

function main(){
	local main_line loop_line
#	fifo_main="`mktemp -u`_main"
#	fifo_loop1="`mktemp -u`_loop1"
#	fifo_loop2="`mktemp -u`_loop2"

#	mkfifo $fifo_main
#	mkfifo $fifo_loop1
#	mkfifo $fifo_loop2



	while [ -f "$io_main_in" ]; do

		main_line="`cat $io_main_in`"
#		if read -t0 line <>$fifo_main; then
		if [ -n "$main_line" ] ; then
			echo -n ''>$io_main_in
			echo "main: cmd: $main_line"
			if [ "$main_line" == "exit" ] ; then rm $io_main_in ; fi
			echo -n $main_line>$io_loop_in
		fi

		loop_line="`cat $io_loop_out`"
		if [ -n "$loop_line" ] ; then
			echo -n ''>$io_loop_out
			echo -n "$loop_line">>$io_main_out
		fi

	done

	nowStop

	echo "main: exit"
}


_x=50
_y=50
x=0
y=0
function loop(){
	local line sec

	while [ -f "$io_loop_in" ]
	do
		sec=1"`date +%S%N`"
		if [ "$_ms" -gt 160000000000 -a "$sec" -lt 159000000000 ] ; then ((_ms=$_ms-60000000000)) ; fi

		line="`cat $io_loop_in`"
		if [ -n "$line" ] ; then
			echo -n ''>$io_loop_in

			if [ "$line" == "tick" ] ; then
				echo "loop: tick=$tick; ms=$_ms; overtick="$(($overtick-$tick))
				tick=0
				overtick=0
			fi

			IFS=';' read -ra xy <<< "$line"
			_x=${xy[0]}
			_y=${xy[1]}

		fi


#WORLD_UPDATE
		if [ "$_ms" -lt "$sec" ] ; then
#			((++_x))
#			if [ "$_x" -gt 120 ] ; then _x=50 ; fi

			if [ "$_x" != "$x" -o "$_y" != "$y" ] ; then
				echo -n "$_x;$_y">$io_loop_out
				x=$_x;y=$_y
			fi

			((_ms=$sec+$interval))
			((++tick))
		fi


		((++overtick))
	done

	echo "loop: exit"

}

( main ) &
id_main=$!
( loop ) &
id_loop=$!
#( websock ) &
#id_websock=$!
id_websock='';

echo "main: $id_main; loop: $id_loop; websock: $id_websock"
