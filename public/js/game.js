/**
 *	GAME VARIABLES
 */
var renderer,		// Rendering context.
	camera,			// Main camera.
	scene,			// Main scene.
	keyboard,		// Keyboard input.
	localPlayer;	// Local player.

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
	camera = new THREE.OrthographicCamera(0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, 1);
	camera.posiztion.z = 1;

	// Creating main scene.
	scene = new THREE.Scene();

	// Initialise keyboard controls.
	keyboard = new THREEx.KeyboardState(renderer.domElement);

	// Set window resize handler.
	window.addEventListener("resize", onResize, false);
};

/**
 *	Browser window resize.
 */
function onResize(e) {
	// Maximise the screen size.
	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH  = window.innerWidth;
}

/**
 *	Game animation loop.
 */
var animate = function() {
	update();
	render();

	requestAnimationFrame(render);
}

/**
 *	Game update.
 */
var update = function() {
	localPlayer.update(keyboard);
};

/**
 *	Game draw.
 */
 var render = function() {
 	renderer.render(scene, camera);
 };
