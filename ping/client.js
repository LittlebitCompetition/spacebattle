
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
var H=0; var W=0;
var tick=0;

var url=document.location.href.split('?');
var server='127.0.0.1:8480';
if(url[1]){server = url[1];}
var socket='';

var js = document.createElement("script");
js.type = "text/javascript";
js.src = "http://"+server+"/socket.io/socket.io.js";

document.body.appendChild(js);

function setSize(w,h){
	if ( typeof h === "undefined" ) H = window.innerHeight - 20;
	else H = h;
	if ( typeof h === "undefined" ) W = window.innerWidth - 20;
	else W = w;
	c.canvas.width  = W;
	c.canvas.height = H;

}
setSize();
window.onresize = setSize;

function websock(){
	socket = io.connect('http://'+server);
	socket.on('connect', sock_conn);
}

function sock_conn(){socket.on('message', socket_in);}

setTimeout(websock,1000);
function socket_in(data){
	if(data=='exit') alert('client: exit');
	io_msg=data;	
	data=data.split(';');
	io_x=data[0];
	io_y=data[1];
}

var io_x=0;
var io_y=0;
var m_x=0;
var m_y=0;
var io_msg='---';
function draw(){

	if(m_x != mousePos.x || m_y != mousePos.y){
		m_x=mousePos.x;
		m_y=mousePos.y;
		socket.send(m_x+";"+m_y);
	}

	c.clearRect(0, 0, W, H);

	c.beginPath();
	c.rect((m_x-10),(m_y-10),60,60);
	c.fillStyle = '#ccc';
	c.fill();
	c.lineWidth = 5;
	c.strokeStyle = '#f00';
	c.stroke();

	c.beginPath();
	c.rect(io_x,io_y,40,40);
	c.fillStyle = '#0ff';
	c.fill();
	c.lineWidth = 5;
	c.strokeStyle = '#00f';
	c.stroke();

	c.font = "bold 12px sans-serif";
	c.textAlign = "left";
	c.textBaseline = "bottom";
	c.fillStyle = "#000";
	c.fillText('fps: '+fps, 10,H-10 );
	c.fillText('x:'+io_x+'; y:'+io_y, 10, H-25);
	c.fillText('server: '+server, 10, H-40);


	++tick;
}
setInterval(draw, 17);

function getFPS(){
	fps = tick;
	tick = 0;
}
setInterval(getFPS,1000);


function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
var mousePos;
canvas.addEventListener('mousemove', function(evt) {
	mousePos = getMousePos(canvas, evt);
}, false);
