
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var H=0; var W=0;
var background = new Image();
background.src = "data/bg.jpg";
var stars = [];
var _key = 0;
var fps = 0;
var fps_limit = 30; //not working for now
var bullets_max = 300;
var stars_max = 20;
var max_vel = 7;
var bullet_life = 300;
var gravity_affect2bullet = false;


//rotate(200,200,0,0,-1); // 0,400


var sh = {
	a  :45,		//angle
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


var tick = 0;
function draw(){
	ctx.drawImage(background,0,0,W,H);

	draw_stars();

	draw_energy();
	logic_energy();

	Bullet.draw_all();
	logic_bullet();

	draw_ship();
	logic_ship();

	draw_text();
	keyboard_set()


	tick++;
}
//draw();
//setInterval(draw, 20);

function reloading(){
	var r = 0.5;
	if (sh.f > 50) r = 0.25;
	if (sh.f < 10) r = 1;
	sh.f+= r;
}
setInterval(reloading, 250);

function getFPS(){
	fps = tick;
	tick = 0;
}
setInterval(getFPS,1000);


function draw_debug(text){
	ctx.font = "bold 12px sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "red";
	ctx.fillText('DEBUG: '+text, 10,H-10 );
}

function draw_text(){
	ctx.font = "bold 12px sans-serif";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "red";
	ctx.fillText('bullets:'+sh.f.toFixed(0), W-10,H-25 );
	ctx.fillText('b:'+Bullet.all.length+'; fps:'+fps+';  key:'+_key+';  x:'+sh.vx.toFixed(2)+', y:'+sh.vy.toFixed(2),W-10,H-10 );

}

function draw_energy(){
	var r = Math.random()*2 + 10;
	ctx.fillStyle = "#0ff";
	ctx.beginPath();
	var ex = W/2;
	var ey = H/2;
	ctx.arc(ex, ey, r, Math.PI*2, false);
	ctx.closePath();
	ctx.fill();
}

function logic_energy(){
	var ex = W/2;
	var ey = H/2;

	var dx = ex - sh.x;
	var dy = ey - sh.y
	
	var dist = Math.sqrt( dx*dx + dy*dy );
	var ea = Math.atan2(dy,dx) * 180 / Math.PI;

	if ( dist < 5 ) dist = 5;

	sh.vx+=_cos(ea)/dist;
	sh.vy+=_sin(ea)/dist;

	if ( dist < 30 && dist > 10) sh.f += 0.1;
	if ( dist < 10 ) sh.f += 0.5;



	// Работает, но не очень нужно
	if ( gravity_affect2bullet ){
		var i = Bullet.all.length;
		while(i--) {
			var b = Bullet.all[i];
			var bdx = ex - b.x;
			var bdy = ey - b.y;
			var bdist = Math.sqrt(bdx*bdx+bdy*bdy);
			var bea = Math.atan2(bdy,bdx)*180/Math.PI;
			b.vx+=_cos(bea)/bdist*10;
			b.vy+=_sin(bea)/bdist*10;
		}
	}
}


function draw_ship(){
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
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function logic_ship(){
	sh.x += sh.vx;
	sh.y += sh.vy;

	if ( sh.vx > max_vel ) sh.vx = max_vel;
	if ( sh.vx < -max_vel ) sh.vx = -max_vel;
	if ( sh.vy > max_vel ) sh.vy = max_vel;
	if ( sh.vy < -max_vel ) sh.vy = -max_vel;

	if ( sh.f > bullets_max) sh.f = bullets_max;

	if ( sh.x > W ) sh.x = 0;
	if ( sh.x < 0 ) sh.x = W;
	if ( sh.y > H ) sh.y = 0;
	if ( sh.y < 0 ) sh.y = H;
}

function draw_stars(){
	for(var t = 0; t < stars.length; t++)
	{
		var p = stars[t];
		ctx.beginPath();
	
		ctx.fillStyle = p.color;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.radius, Math.PI*2, false);
		ctx.closePath();
		ctx.fill();

		p.x += p.vx;
		p.y += p.vy;

		if(p.x < -0) p.x = W+0;
		if(p.y < -0) p.y = H+0;
		if(p.x > W+0) p.x = -0;
		if(p.y > H+0) p.y = -0;
	}
}






function logic_bullet(){
	var i = Bullet.all.length;
	while(i--) {
		var bullet = Bullet.all[i];
		bullet.x += bullet.vx;
		bullet.y += bullet.vy;

		if (bullet.x > W) bullet.x = 0;
		if (bullet.x < 0) bullet.x = W;
		if (bullet.y > H) bullet.y = 0;
		if (bullet.y < 0) bullet.y = H;

		if (bullet.t <= 0) bullet.remove();
		else bullet.t--;
	
	}
}

function Bullet(x, y, r) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.t = bullet_life;
	this.vx = 0;
	this.vy = 0;
	Bullet.all.push(this);
}
Bullet.all = [];
Bullet.draw_all = function(){
	var i = Bullet.all.length;
	while (i--) {
		Bullet.all[i].draw();
	}
};

Bullet.prototype = {
	draw: function() {
		var c = "#fff";
		if ( this.t <= 150 && this.t > 100) c = "#ff0";
		if ( this.t <= 100 && this.t > 50 ) c = "#f00";
		if ( this.t <= 50  && this.t > 20 ) c = "#300";
		if ( this.t <= 20 ) c = "#000";

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.fillStyle = c;
		ctx.beginPath();
		ctx.arc(0, 0, this.r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	},
	remove: function() {
		Bullet.all.splice(Bullet.all.indexOf(this), 1);
	}
};

function create_star(){
	this.x = Math.random()*W;
	this.y = Math.random()*H;

//	this.vx = Math.random()*20;
	this.vx = Math.random()*-.3-.1;
	this.vy = 0;
	
	var wcol = Math.random()*100+50>>0;
	var r = wcol+Math.random()*50>>0;
	var g = wcol+Math.random()*50>>0;;
	var b = wcol+Math.random()*50>>0;
	this.color = "rgb("+r+", "+g+", "+b+")";
	
	this.radius = Math.random()*2+1;
}


function _cos(a){return Math.cos(a*Math.atan(1)/45);}
function _sin(a){return Math.sin(a*Math.atan(1)/45);}


function setSize(w,h){
	if ( typeof h === "undefined" ) H = window.innerHeight - 20;
	else H = h;
	if ( typeof h === "undefined" ) W = window.innerWidth - 20;
	else W = w;

	ctx.canvas.width  = W;
	ctx.canvas.height = H;

	stars = [];
	for(var i = 0; i < stars_max; i++) {
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

function keyboard_set(){
	if (keys[38]) { 			//up
		sh.vx+=_cos(sh.a)/sh.acc;
		sh.vy+=_sin(sh.a)/sh.acc;

		if ( sh.vx > max_vel ) sh.vx = max_vel;
		if ( sh.vx < -max_vel ) sh.vx = -max_vel;
		if ( sh.vy > max_vel ) sh.vy = max_vel;
		if ( sh.vy < -max_vel ) sh.vy = -max_vel;
	}
	if (keys[37]) sh.a-=3;		// left
	if (keys[39]) sh.a+=3;		// right
	if (keys[32]){				// space
		if (Bullet.all.length < bullets_max) {
			if(sh.f >= 1){
				var r=1;
				if (sh.f > 50 && sh.f < 150) r = 2;
				if (sh.f > 150) r = 3;
				var bullet = new Bullet(sh.x, sh.y, r);
				var random_offset = Math.random() * 2;
	//			var speed = Math.random() * 15 + 3;
				var speed = 8;
				bullet.vx = speed * _cos(sh.a + random_offset) + sh.vx;
				bullet.vy = speed * _sin(sh.a + random_offset) + sh.vy;
				sh.vx += speed * -_cos(sh.a) / 500 * r; // Отдача от выстрела
				sh.vy += speed * -_sin(sh.a) / 500 * r; // Отдача от выстрела
				
				if ( sh.vx > max_vel ) sh.vx = max_vel;
				if ( sh.vx < -max_vel ) sh.vx = -max_vel;
				if ( sh.vy > max_vel ) sh.vy = max_vel;
				if ( sh.vy < -max_vel ) sh.vy = -max_vel;
				
				sh.f--;
			} else {
				// Sound empty charge
			}
		}
	}
	if ( keys[67]) {sh.x = mousePos.x; sh.y = mousePos.y;} // "c"
	if ( keys[83]) {sh.vx = 0; sh.vy = 0;} // "s"
}


var keys=[];
window.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;

	if ( e.keyCode == '77' ) setSize (800, 600);
	if ( e.keyCode == '72' ) setSize ();
	if ( e.keyCode == '82' ) sh.f = 300;
	_key = e.keyCode;
//	alert(e.keyCode);
});
window.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});



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




window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame	|| 
		window.webkitRequestAnimationFrame	|| 
		window.mozRequestAnimationFrame		|| 
		window.oRequestAnimationFrame		|| 
		window.msRequestAnimationFrame		|| 
		function(callback, element){
			window.setTimeout(callback, 1000 / 60);
		};
})();


(function animloop(){
  requestAnimFrame(animloop);
  draw();
})();











//---===---\\






