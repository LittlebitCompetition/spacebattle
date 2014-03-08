var util 	= require("util"),
	io 		= require("socket.io"),
	player 	= require("./entity").entity,
	bullet	= require("./entity").entity;

var express	= require('express'),
	http	= require('http'),
	app		= express(),
	server 	= http.createServer(app);

var socket,
	players;

var tickTime,
	tickRate,
	tickCount,
	tickInterval;

var logicRate,
	syncRate;

var frameTime,
	realTime;

var bullets,
	bulletId,
	maxBullets,
	bulletsToSend,
	bulletsToRemove;
	
var maxX,
	maxY;

/** 
 *	Initialising the server.
 */
function init(options) {
	maxX = 800;
	maxY = 600;

	players = [];

	bulletId = 0;

	bullets = [];
	bulletsToSend = [];
	bulletsToRemove = [];

	maxBullets = 100;

	// Set up web server.
	var serverPort = 80;

	server.listen(serverPort);

	// Log something so we know that it succeded.
	util.log('info - web server on port: ' + serverPort);

	app.use(express.static(process.cwd() + '/public'));

	// By default, we forward the / path to index.html automatically.
	app.get( '/', function( req, res ){
		console.log('trying to load %s', __dirname + '/index.html');
		res.sendfile( '/index.html' , { root:__dirname });
	});


	// Set socket.io to 8000 port.
	socket = io.listen(server);

	socket.configure(function() {
		socket.set("transports", ["websocket"]);
		socket.set("log level", 2);
	});	

	// Ticking.
	tickTime 		= 0;
	tickRate 		= Math.floor(1000 / (options.tickRate || 60));
	tickCount 		= 0;
	tickInterval 	= null;

	// Used for throttling logic ticks.
	logicRate 	= options.logicRate || 1;
	// Send down tick count to clients every X updates.
	syncRate	= options.syncRate || 1;

	tickInterval = setInterval(function() {
		update();
	}, tickRate);

	frameTime 	= Date.now();
	tickCount 	= 1;
	realTime	= 0;

	setEventHandlers();
}

/**
 *	Server update function.
 */
var update = function() {
	var currentTime = Date.now();

	realTime += (currentTime - frameTime);	

	while(tickTime < realTime) {		
		// Sync clients.
		if (tickCount % syncRate === 0) {
			clientsSync();
		}
		// Updating logic and physics.
		if (tickCount % logicRate === 0) {
			logicUpdate();
		}

		tickCount++;
		tickTime += tickRate;
	}
	frameTime = currentTime;
};

/**
 *	Client sync.
 */
var clientsSync = function() {	
	for (i = 0; i < players.length; i++) {
		if (players[i].health > 0) {
			socket.sockets.emit("move player", {id: players[i].id,
				x: players[i].getX(), y: players[i].getY(),
				a: players[i].getAngle(), h: players[i].health});
		} else {
			socket.sockets.emit("kill player", {id: players[i].id});
			p = players[i];
			players.splice(i, 1);
			delete p;
			i--;
		}		
	}

	for (i = 0; i < bulletsToSend.length; i++) {
		socket.sockets.emit("bullet", {id: bulletsToSend[i].id,
			x: bulletsToSend[i].getX(),	y: bulletsToSend[i].getY(),
			a: bulletsToSend[i].getAngle(),	v: bulletsToSend[i].velocity,
			t: bulletsToSend[i].aliveTime});
	}
	bulletsToSend.splice(0, bulletsToSend.length);

	for (i = 0; i < bulletsToRemove.length; i++) {
		socket.sockets.emit("remove bullet", {id: bulletsToRemove[i].id});
	}
	bulletsToRemove.splice(0, bulletsToRemove.length);
}

/**
 *	Logic and physics update goes here.
 */
 var logicUpdate = function() {
 	// Process player input.
 	for (i = 0; i < players.length; i++) {
 		var velocity = players[i].velocity;
 		var angle = players[i].getAngle();

 		var playerX = players[i].getX();
	 	var playerY = players[i].getY();

 		var ic = players[i].inputs.length; 		 		
 		if (ic) {
 			for (j = 0; j < ic; j++) {
 				var input = players[i].inputs[j].split('-'); 					 			

 				var c = input.length;
 				for (k = 0; k < c; k++) {
 					var key = input[k];
 					if(key == 'l') {
	                    angle += 0.1;
	                }
	                if(key == 'r') {
	                    angle -= 0.1;
	                }
	                if(key == 'd') {
	                    velocity--;
	                }
	                if(key == 'u') {
	                    velocity++;
	                }
	                if(key == 'b') {
	                	b = new bullet(playerX, playerY, 5);
	                	b.id = bulletId++;
	                	b.parentId = players[i].id;
	                	b.setAngle(angle);
	                	b.startTime = frameTime;
	                	b.aliveTime = 2000;
	                	b.velocity	= 20;

	                	if (bullets.length < maxBullets) {
	                		bullets.push(b);	
	                	}

	                	if (bulletsToSend.length < maxBullets) {
	                		bulletsToSend.push(b);
	                	}	                	
	                }
 				}
 			} 			

	 		players[i].inputs.splice(0, players[i].inputs.length);
 		}

		if (velocity > 10) {
			velocity = 10;
		}

		if (velocity < 0) {
			velocity = 0;
		}

		var xv = Math.cos(angle);
		var yv = Math.sin(angle);

		playerX += xv * velocity;
		playerY += yv * velocity;

		players[i].setX(playerX);
		players[i].setY(playerY);

		players[i].setAngle(angle);

		players[i].velocity = velocity;

		wrapEntities(players[i]);
 	}	

 	for (i = 0; i < bullets.length; i++) {
 		if ((bullets[i].startTime + bullets[i].aliveTime) > frameTime) {
 			var angle = bullets[i].getAngle();

 			var xv = Math.cos(angle);
 			var yv = Math.sin(angle);

 			var newX = bullets[i].getX();
 			var newY = bullets[i].getY();

 			newX += xv * bullets[i].velocity;
 			newY += yv * bullets[i].velocity;

 			bullets[i].setX(newX);
 			bullets[i].setY(newY);

 			for (j = 0; j < players.length; j++) {
 				if (bullets[i].collision(players[j]) 
 					&& bullets[i].parentId != players[j].id) { 					
 					bulletsToRemove.push(bullets[i]);
 					bullets[i].aliveTime = 0;

 					players[j].health -= 5;
 				}	
 			} 			
		} else {
			b = bullets[i];
 		 	bullets.splice(i, 1);
 		 	delete b;
 		 	i--;
		}
 	}
 };

/**
 *	Wrap object coordinates.
 */
var wrapEntities = function(obj) {
	var objX = obj.getX();
	var objY = obj.getY();

	if (objX > maxX) {
		obj.setX(0);
	}

	if (objX < 0) {
		obj.setX(maxX);
	}

	if (objY > maxY) {
		obj.setY(0);
	}

	if (objY < 0) {
		obj.setY(maxY);
	}
};

/**
 *	Event handler for connection.
 */
var setEventHandlers = function() {
	socket.sockets.on("connection", onSocketConnection);
};

/**
 * Set up the event handlers for client events.
 */
function onSocketConnection(client) {
	util.log("New player has connected: " + client.id);
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
};

function onClientDisconnect() {
	util.log("Player has disconnected: " + this.id);

	var removePlayer = playerById(this.id);

	// Player not found.
	if (!removePlayer) {
		util.log("Player not found: " + this.id);
		return;
	};

	// Remove player from players array/
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients.
	this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {	
	var newPlayer = new player(data.x, data.y, 30);
	newPlayer.id = this.id;

	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(),
		y: newPlayer.getY()});

	var i, existingPlayer;

	this.emit("new id", {id: newPlayer.id});

	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(),
			y: existingPlayer.getY()});
	}

	players.push(newPlayer);
};

function onMovePlayer(data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
		util.log("Player not found: " + this.id);
		return;
	}

	movePlayer.inputs.push(data.i);
};

function playerById(id) {
	var i;
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id) {
			return players[i];
		}
	};

	return false;
}

init({});