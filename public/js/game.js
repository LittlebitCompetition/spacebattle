/**
 *	GAME VARIABLES
 */
var renderer,		// Rendering context.
	camera,			// Main camera.
	scene,			// Main scene.
	keyboard,		// Keyboard input.
	localPlayer,	// Local player.
	remotePlayers,	// Enemies.
	socket;			// Socket.io socket.

var SCREEN_WIDTH,	// We use this to hold client window size.
	SCREEN_HEIGHT;	// 

/**
 *	Game initialisation.
 */
var init = function() {
	// Get window size.
	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH  = window.innerWidth;

	// Declare rendering context.
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	document.body.appendChild(renderer.domElement);
	renderer.domElement.setAttribute("tabIndex", "0");
	renderer.domElement.focus();

	// Creating new orthographic camera.
	camera = new THREE.OrthographicCamera(0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, 1000);
	camera.position.z = 1000;

	// Creating main scene.
	scene = new THREE.Scene();

	// Initialise keyboard controls.
	keyboard = new THREEx.KeyboardState(renderer.domElement);

	// Set players.
	localPlayer = new player(scene, 200, 200);	

	remotePlayers = [];
	bullets = [];

	remotePlayers.push(localPlayer);

	// Connecting to local server.
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	setEventHandlers();
};

/**
 *	Game event handler.
 */
var setEventHandlers = function() {
	// Set window resize handler.
	window.addEventListener("resize", onResize, false);

	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("new player", onNewPlayer);
	socket.on("new id", onNewId);
	socket.on("bullet", onBullet);
	socket.on("move player", onMovePlayer);
	socket.on("remove player", onRemovePlayer);
};

/**
 *	Browser window resize.
 */
function onResize(e) {
	// Maximise the screen size.
	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH  = window.innerWidth;
};

function onSocketConnected() {
	console.log("Connected to socket server.");
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

function onNewPlayer(data) {
	console.log("New player connected: " + data.id);
	var newPlayer = new player(scene, data.x, data.y);
	newPlayer.id = data.id;
	remotePlayers.push(newPlayer);
};

function onBullet(data) {
	var bulletCircle = new bullet(scene, data.x, data.y, data.a,
		data.v / 2, data.t);

	bullets.push(bulletCircle);
}

function onNewId(data) {
	console.log("New id acquired: " + data.id);
	localPlayer.id = data.id;
}

function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	if (!movePlayer) {
	    console.log("Player not found: " + data.id);
	    return;
	};

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setAngle(data.a + Math.PI / 2);
};

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	if (!removePlayer) {
	    console.log("Player not found: " + data.id);
	    return;
	};

	removePlayer.clear();

	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

function playerById(id) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };

    return false;
};

/**
 *	Game animation loop.
 */
var animate = function() {

	// Start update at 60 fps.
	setTimeout(function(){
		requestAnimationFrame(animate);
	}, 1000 / 60);

	update();
	render();
};

/**
 *	Game update.
 */
var update = function() {
	var server_packet = localPlayer.update(keyboard);
	if (server_packet) {
		socket.emit("move player", {i: server_packet});
	}

	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].expired()) {
			bullets[i].update();	
		} else {
			b = bullets[i];
			b.remove();
 			bullets.splice(i, 1);
 			delete b;
 			i--;
		}		
	}
};

/**
 *	Game draw.
 */
 var render = function() {
 	renderer.render(scene, camera);
 };
