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

function nowStop(){
#	rm -rf $fifo_main
#	rm -rf $fifo_loop1
#	rm -rf $fifo_loop2
	rm $io_main_in $io_main_out $io_loop_in $io_loop_out
	echo "Deleting io ..."
}

function main(){
	local main_line loop_line tick
	tick=0
#	fifo_main="`mktemp -u`_main"
#	fifo_loop1="`mktemp -u`_loop1"
#	fifo_loop2="`mktemp -u`_loop2"

#	mkfifo $fifo_main
#	mkfifo $fifo_loop1
#	mkfifo $fifo_loop2


	( loop ) &
	id_loop=$!
	echo "main: $$; loop: $id_loop"

	while [ -f "$io_main_in" ]; do
		((++tick))

		main_line="`cat $io_main_in`"
#		if read -t0 line <>$fifo_main; then
		if [ -n "$main_line" ] ; then
			echo -n ''>$io_main_in
			echo "main: $tick: $main_line"
			if [ "$main_line" == "exit" ] ; then rm $io_main_in ; fi
		fi

		loop_line="`cat $io_loop_out`"
		if [ -n "$loop_line" ] ; then
			echo -n ''>$io_loop_out
			echo "main: from loop: $loop_line"
		fi


	done

	nowStop

	echo "main: exit"
}


function loop(){
#	if [ -t 0 ]; then stty -echo -icanon time 1 min 0; fi
	local line tick
	tick=0
#	fifo_in=$1
#	fifo_out=$2
	while [ -f "$io_loop_in" ]
	do
		((++tick))
		line="`cat $io_loop_in`"
		if [ -n "$line" ] ; then
			echo -n ''>$io_loop_in
			echo "loop: $tick: $line"
			tick=0
		fi
	done

	echo "loop: exit"

}

main
