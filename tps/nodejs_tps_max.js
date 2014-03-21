#!/usr/bin/nodejs


var t = 0;
var s = (new Date).getSeconds();
var n = 0;

while ( true ) {

	n = (new Date).getSeconds();

	if ( s != n ) {
		s = n;
		console.log('Node JS: Tick Per Second: '+t);
		t = 0;
	}

	++t;
}





