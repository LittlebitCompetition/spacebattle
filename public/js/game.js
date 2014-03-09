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

var audioContext,	// Audio context.
	bufferLoader;	// Buffer loader.

var explosionSound, // Hit sound.
	gameoverSound,	// Game over sound.
	engineSound,	// Engines sound.
	beamSound;		// Beam sound.

var hitCount,
	bulletCount;

var SCREEN_WIDTH,	// We use this to hold client window size.
	SCREEN_HEIGHT;	// 

var stats;

/**
 *	Game initialisation.
 */
var init = function() {
	// Get window size.
	SCREEN_HEIGHT = 600;
	SCREEN_WIDTH  = 800;

	// Set up fps counter.
	stats = new Stats();
	stats.setMode(0);

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	document.body.appendChild(stats.domElement);

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

	// Create background.
	initBackground("images/background.jpg");

	// Initialise keyboard controls.
	keyboard = new THREEx.KeyboardState();

	// Set players.
	localPlayer = new player(scene, Math.random() * SCREEN_WIDTH,
		Math.random() * SCREEN_HEIGHT);

	remotePlayers = [];
	bullets = [];

	remotePlayers.push(localPlayer);

	// Connecting to local server.
	socket = io.connect("http://localhost", {transports: ["websocket"]});

	// Set up background sound.
	initSound();

	hitCount = 0;
	bulletCount = 0;

	setEventHandlers();
};

function initSound() {
	try {
	    // Fix up for prefixing
	    window.AudioContext = window.AudioContext||window.webkitAudioContext;
	    audioContext = new AudioContext();
	} catch(e) {
		console.log("Web Audio API is not supported in this browser.");
	}

	bufferLoader = new BufferLoader(
		audioContext,
		[
				"sound/engines.wav",
				"sound/gameover.wav",
				"sound/intro.wav",
				"sound/pulse.wav",
				"sound/explosion.wav"
		],
		finishedSoundLoading);

	bufferLoader.load();
};

function finishedSoundLoading(bufferList) {
	// Starting background music.
	playSound(bufferList[2], 0, true);

	// Assigning rsources.
	explosionSound = bufferList[4];
	gameoverSound = bufferList[1];
	engineSound = bufferList[0];
	beamSound = bufferList[3];
};

function playSound(buffer, time, loop) {
	var source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.loop = loop || false;
	source.connect(audioContext.destination);
	source.start(time);
};

function initBackground(backgroundName) {
	var backgroundTexture = new THREE.ImageUtils.loadTexture(backgroundName);
	var planeGeometry = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 0);
	var planeMaterial = new THREE.MeshBasicMaterial({map: backgroundTexture});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.x = SCREEN_WIDTH / 2;
	plane.position.y = SCREEN_HEIGHT / 2;
	scene.add(plane);
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
	socket.on("move player", onMovePlayer);
	socket.on("kill player", onKillPlayer);
	socket.on("remove player", onRemovePlayer);

	socket.on("bullet", onBullet);
	socket.on("remove bullet", onRemoveBullet);
};

/**
 *	Browser window resize.
 */
function onResize(e) {
	// Maximise the screen size.
	SCREEN_HEIGHT = 600;
	SCREEN_WIDTH  = 800;
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
	var bulletCircle = new bullet(scene, data.id, data.x, data.y, data.a,
		data.v, data.t);

	bullets.push(bulletCircle);
	bulletCount++;
}

function onRemoveBullet(data) {
	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].id == data.id) {
			b = bullets[i];
			b.remove();
			bullets.splice(i, 1);
			delete b;
			i--;
		}
	}
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

	var health = movePlayer.getHealth();

	if (health != data.h) {
		hitCount++;
	}

	movePlayer.setHealth(data.h);
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

function onKillPlayer(data) {
	if (data.id == localPlayer.id) {
		playSound(gameoverSound, 0);
	}

	onRemovePlayer(data);
}

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
	requestAnimationFrame(animate);

	stats.begin();

	update();
	render();

	stats.end();
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

	for (i = 0; i < bulletCount; i++) {
		playSound(beamSound, 0);
	}
	bulletCount = 0;

	for (i = 0; i < hitCount; i++) {
		playSound(explosionSound, 0);
	}
	hitCount = 0;
};

/**
 *	Game draw.
 */
 var render = function() {
 	renderer.render(scene, camera);
 };
