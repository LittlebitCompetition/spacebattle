var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var H=0; var W=0;
var stars = [];

function setSize(){
	W = window.innerWidth - 20;
	H = window.innerHeight - 20;
	ctx.canvas.width  = W;
	ctx.canvas.height = H;
	
	stars = [];
	for(var i = 0; i < 50; i++) {
		stars.push(new create_star());
	}
}
setSize();


window.onresize = setSize;


function rotate(x, y, xm, ym, a) {
    var cos = Math.cos, sin = Math.sin,
    a = a * Math.PI / 180,
    xr = (x - xm) * cos(a) - (y - ym) * sin(a)   + xm,
    yr = (x - xm) * sin(a) + (y - ym) * cos(a)   + ym;

    return [xr, yr];
}

//rotate(200,200,0,0,-1); // 0,400


var sh = {
	a  :0,		//angle
	va :0,		//angle vilocity
	x  :100,	//x
	y  :100,	//y
	vx :0,		//vilocity x
	vy :0,		//vilocity y
	f  :100,	//fire charge
	d  :100,	//ship damage
	s  :12,		//ship scale
	acc:20		//ship divide acceleration
}
//Ship Graphics
var ship = [
	{x: 0, y: 0},
	{x:-1, y:-1},
	{x: 2, y: 0},
	{x:-1, y: 1}
];


function create_star()
{
	this.x = Math.random()*W;
	this.y = Math.random()*H;

//	this.vx = Math.random()*20;
	this.vx = Math.random()*-.3-.1;
	this.vy = 0;
	
	var wcol = Math.random()*50+20>>0;
	var r = wcol+Math.random()*10>>0;
	var g = wcol+Math.random()*10>>0;;
	var b = wcol+Math.random()*10>>0;
	this.color = "rgb("+r+", "+g+", "+b+")";
	
	this.radius = Math.random()*2+1;
}


function _cos(a){return Math.cos(a*Math.atan(1)/45);}
function _sin(a){return Math.sin(a*Math.atan(1)/45);}

function draw()
{

//	ctx.globalCompositeOperation = "source-over";
//	ctx.fillStyle = "rgba(0, 0, 0, 0.003)";
	ctx.fillRect(0, 0, W, H);
//	ctx.globalCompositeOperation = "lighter";

	for(var t = 0; t < stars.length; t++)
	{
		var p = stars[t];
		ctx.beginPath();
//		var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
//		gradient.addColorStop(0, p.color);
//		gradient.addColorStop(0.4, p.color);
//		gradient.addColorStop(0.4, p.color);
//		gradient.addColorStop(1, "black");
	
		ctx.fillStyle = p.color;
		ctx.arc(p.x, p.y, p.radius, Math.PI*2, false);
		ctx.fill();

		p.x += p.vx;
		p.y += p.vy;

		if(p.x < -0) p.x = W+0;
		if(p.y < -0) p.y = H+0;
		if(p.x > W+0) p.x = -0;
		if(p.y > H+0) p.y = -0;
	}

	// draw ship
	ctx.fillStyle   = '#ccc';
	ctx.strokeStyle = '#0ff';
	ctx.lineWidth   = 1;

	var s = ship[0];
	ctx.beginPath();
	ctx.moveTo(sh.x,sh.y);
	var s = ship[1];
	var xy = rotate(s.x*sh.s+sh.x,s.y*sh.s+sh.y,sh.x,sh.y,sh.a);
	ctx.lineTo(xy[0],xy[1]);
	var s = ship[2];
	xy = rotate(s.x*sh.s+sh.x,s.y*sh.s+sh.y,sh.x,sh.y,sh.a);
	ctx.lineTo(xy[0],xy[1]);
	var s = ship[3];
	xy = rotate(s.x*sh.s+sh.x,s.y*sh.s+sh.y,sh.x,sh.y,sh.a);
	ctx.lineTo(xy[0],xy[1]);
	var s = ship[0];
	xy = rotate(s.x*sh.s+sh.x,s.y*sh.s+sh.y,sh.x,sh.y,sh.a);
	ctx.lineTo(xy[0],xy[1]);
	var s = ship[2];
	xy = rotate(s.x*sh.s+sh.x,s.y*sh.s+sh.y,sh.x,sh.y,sh.a);
	ctx.lineTo(xy[0],xy[1]);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	sh.x += sh.vx;
	sh.y += sh.vy;

	if ( sh.x > W ) sh.x = 0;
	if ( sh.x < 0 ) sh.x = W;
	if ( sh.y > H ) sh.y = 0;
	if ( sh.y < 0 ) sh.y = H;


	ctx.font = "bold 12px sans-serif";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "red";
	ctx.fillText('x:'+sh.vx.toFixed(2)+', y:'+sh.vy.toFixed(2),W-10,H-10 );

	ctx.fillStyle = "#000";




	if (keys[38]) {
		sh.vx+=_cos(sh.a)/sh.acc;
		sh.vy+=_sin(sh.a)/sh.acc;

		if ( sh.vx > 7 ) sh.vx = 7;
		if ( sh.vx < -7 ) sh.vx = -7;
		if ( sh.vy > 7 ) sh.vy = 7;
		if ( sh.vy < -7 ) sh.vy = -7;
	} // up
	if (keys[37]) sh.a-=3;		// left
	if (keys[39]) sh.a+=3;		// right
	//if (keys[40])		// down

}
//draw();
setInterval(draw, 33);


var keys=[];
window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
//	alert(e.keyCode);
});
window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});


/*
$(document).keydown(function(e){
	var key = e.which;
	if(key == "38") {

//		alert(_cos(sh.a)+' '+_sin(sh.a));
	} // up

	if(key == "37") sh.a-=5; //left
	if(key == "39") sh.a+=5; //right

//	if(key == "40") {;} //down

	if (sh.a >= 360) sh.a = 0;
	if (sh.a < 0 ) sh.a = 359;

});
*/















//---===---\\






