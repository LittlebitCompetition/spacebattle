var util 	= require("util"),
	io 		= require("socket.io"),
	player 	= require("./player").player;

var socket,
	players;

/** 
 *	Initialising the server.
 */
function init() {
	players = [];

	// Set socket.io to 8000 port.
	socket = io.listen(8000);

	socket.configure(function() {
		socket.set("transports", ["websocket"]);
		socket.set("log level", 2);
	});

	setEventHandlers();
}

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
	var newPlayer = new player(this.id, data.x, data.y);	

	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(),
		y: newPlayer.getY()});

	var i, existingPlayer;

	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(),
			y: existingPlayer.getY()});
	}

	players.push(newPlayer);
};

function onMovePlayer(data) {
	var movePlayer = new player(data.x, data.y);

	if (!movePlayer) {
		util.log("Player not found: " + this.id);
		return;
	}

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), 
		y: movePlayer.getY()});
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

init();