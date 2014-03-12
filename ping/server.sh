#!/bin/bash

#Переменные оболочки
shopt -u failglob
shopt -s extglob nullglob dotglob

#Определить, где примонтирована ramfs
ramfs="/mnt/ram"

#Создаём IO
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


#Переменные времени
_s=0
tick=0
overtick=1
_ms=0
to_tps=60
((interval=1000000000/$to_tps))



#Функция очистки IO
function nowStop(){
	rm $io_main_in $io_main_out $io_loop_in $io_loop_out
	echo "Deleting io ..."
}

#Главный скоростной цикл обработки IO
#Служит мостом между циклом loop(логика) и nodejs
function main(){
	local main_line loop_line

	#Пока есть IO выполняем цикл
	while [ -f "$io_main_in" ]; do

		#Читаем строку из main io и разбираем её
		main_line="`cat $io_main_in`"
		if [ -n "$main_line" ] ; then
			echo -n ''>$io_main_in
			echo "main: cmd: $main_line"
			if [ "$main_line" == "exit" ] ; then rm $io_main_in ; fi
			echo -n $main_line>$io_loop_in
		fi

		#Читаем строку из loop io и разбираем её
		loop_line="`cat $io_loop_out`"
		if [ -n "$loop_line" ] ; then
			echo -n ''>$io_loop_out
			echo -n "$loop_line">>$io_main_out
		fi

	done

	#Если произошёл выход из главного цикла, очищаем все IO
	nowStop

	echo "main: exit"
}


_x=50
_y=50
x=0
y=0
# Функция цикла-логики с синхронизированным временем
function loop(){
	local line sec

	# Пока есть IO выполняем быстрый цикл
	while [ -f "$io_loop_in" ]
	do
		#получаем изменение секунд
		sec=1"`date +%S%N`"
		if [ "$_ms" -gt 160000000000 -a "$sec" -lt 159000000000 ] ; then ((_ms=$_ms-60000000000)) ; fi

		#читаем линию из IO и разбираем её
		line="`cat $io_loop_in`"
		if [ -n "$line" ] ; then
			echo -n ''>$io_loop_in

			# дебаг
			if [ "$line" == "tick" ] ; then
				echo "loop: tick=$tick; ms=$_ms; overtick="$(($overtick-$tick))
				tick=0
				overtick=0
			fi


			IFS=';' read -ra xy <<< "$line"
			_x=${xy[0]}
			_y=${xy[1]}

		fi


		#далее часть быстрого цикла выполняется только с определённым промежутком
		#синхронизированным со временем
		#Так что тут просчитываем основную логику игры
		if [ "$_ms" -lt "$sec" ] ; then

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
id_websock=''

echo "main: $id_main; loop: $id_loop; websock: $id_websock"

# После старта циклов BASH-а запускаем nodejs
# Тут старт сервера произведён, началась работа...
sleep 1
nodejs server.js $ramfs

# Выход из nodejs завершаем все циклы BASH-а
# Тут стоп сервере произведён, работа завершена...
sleep 1
echo -n "exit">$io_main_in
sleep 1
echo ''
