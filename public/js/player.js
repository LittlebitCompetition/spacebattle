/**
 *	Main player class.
 */
var player = function(scene, startX, startY) {
	var id,
		x = startX,
		y = startY,
		prevX = x,
		prevY = y,
		velocity = 2;

	var model,
		localScene = scene;

	// Loading fighter model.
	THREEx.SpaceShips.loadSpaceFighter01(function(object3d){
		model = object3d;
		object3d.scale.set(0.2, 0.2, 0.2);
		object3d.position.set(x, y, 100);
		object3d.rotation.set(Math.PI / 2, Math.PI / 2, 0);
		localScene.add(model);
	});

	var getX = function() {
    	return x;
	};

	var getY = function() {
	    return y;
	};

	var setX = function(newX) {
	    x = newX;
	    model.position.x = newX;
	};

	var setY = function(newY) {
	    y = newY;
	    model.position.y = newY;
	};

	var clear = function() {
		localScene.remove(model);
	};

	/**
	 *	Player movement update.
	 */
	var update = function(keyboard) {
		var input = [];		

		if (keyboard.pressed('w')) {
			input.push('u');
			y += velocity;
		}

		if (keyboard.pressed('s')) {
			input.push('d');
			y -= velocity;
		}

		if (keyboard.pressed('a')) {
			input.push('l');
			x -= velocity;
		}

		if (keyboard.pressed('d')) {
			input.push('r');
			x += velocity;
		}

		if (model !== undefined) {
			model.position.x = x;
			model.position.y = y;
		}

		if (input.length) {
			return input.join('-');			
		}

		return null;
	};

	return {
		id: id,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,		
		clear: clear,
		update: update,		
	};
};