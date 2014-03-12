var io = require('socket.io').listen(8480);
var fs = require('fs');

// Получаем переменную ramfs от BASH-сервера
var args = process.argv.slice(2);
var ramfs=args[0];

var sock;
io.set('log level', 1);
io.sockets.on('connection', sock_conn);

function sock_conn(socket){
	sock=socket;
	socket.on('message', function (data) {
		fs.writeFileSync(ramfs+'/main_in.io', data);
	});

}

if (!fs.existsSync(ramfs+'/main_out.io')) {
	console.log('nodejs: exit');
	process.exit();
}
var fs = require('fs'),
	bite_size = 256,
	readbytes = 0,
	file;
fs.truncate(ramfs+'/main_out.io', 0);
fs.open(ramfs+'/main_out.io', 'r', function(err, fd) { file = fd; read_io(); });

function read_io(){
	if (!fs.existsSync(ramfs+'/main_out.io')) {
		console.log('nodejs: exit');
		fs.close(file);
		if(sock) sock.send('exit');
		process.exit();
	}

	var stats = fs.fstatSync(file);
	if(stats.size<readbytes+1) {
		setTimeout(read_io, 5);
	}
	else {
		fs.read(file, new Buffer(bite_size), 0, bite_size, readbytes, process_io);
		if ( stats.size > 10000000 ){
			fs.truncateSync(ramfs+'/main_out.io', 0);
			readbytes = 0;
		}
	}
}

function process_io(err, bytecount, buff){

	console.log(buff.toString('utf-8', 0, bytecount));

	if(sock) sock.send(buff.toString('utf-8', 0, bytecount));

	readbytes+=bytecount;
	process.nextTick(read_io);
}
