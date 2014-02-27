/**
 *	Main player class.
 */
var player = function(scene, startX, startY) {
	var x = startX,
		y = startY,
		velocity = 2;
	var model;

	// Loading fighter model.
	THREEx.SpaceShips.loadSpaceFighter01(function(object3d){
		model = object3d;
		object3d.scale.set(0.2, 0.2, 0.2);
		object3d.position.set(x, y, 100);
		object3d.rotation.set(Math.PI / 2, Math.PI / 2, 0);
		scene.add(model);
	});

	/**
	 *	Player movement update.
	 */
	var update = function(keyboard) {
		if (keyboard.pressed('d')) {
			x += velocity;
		}

		if (keyboard.pressed('a')) {
			x -= velocity;	
		}
		
		if (keyboard.pressed('w')) {
			y += velocity;
		}
		
		if (keyboard.pressed('s')) {
			y -= velocity;
		}

		if (model !== undefined) {
			model.position.x = x;
			model.position.y = y;	
		}		
	};

	return {
		update: update
	};
};