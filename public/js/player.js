/**
 *	Main player class.
 */
var player = function(scene, startX, startY) {
	var id,
		x = startX,
		y = startY,
		angle = 0,
		velocity = 0,
		minV = 0,
		maxV = 10,
		angularVelocity = 0.1;

	var model,
		localScene = scene;

	// Loading fighter model.
	THREEx.SpaceShips.loadSpaceFighter02(function(object3d){
		model = object3d;
		object3d.scale.set(0.2, 0.2, 0.2);
		object3d.position.set(x, y, 100);
		object3d.rotation.set(Math.PI / 2, 0, 0);
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

	var setAngle = function(newAngle) {
		angle = newAngle;
		model.rotation.y = angle;
	}

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
			velocity++;
		}

		if (keyboard.pressed('s')) {
			input.push('d');
			velocity--;
		}

		if (keyboard.pressed('a')) {
			input.push('l');
			angle += angularVelocity;
			
		}

		if (keyboard.pressed('d')) {
			input.push('r');
			angle -= angularVelocity;
		}

		if (model !== undefined) {
			var xv = Math.cos(angle);
			var yv = Math.sin(angle);

			if (velocity > maxV) {
				velocity = maxV;
			}

			if (velocity < minV) {
				velocity = minV;
			}

			x += xv * velocity;
			y += yv * velocity;

			model.position.x = x;
			model.position.y = y;

			model.rotation.y = angle + Math.PI / 2;
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
		setAngle: setAngle,		
		clear: clear,
		update: update,		
	};
};