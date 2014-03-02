/**
 * Server player class.
 */
 var player = function(startX, startY) {
 	var x = startX,
 		y = startY,
 		angle = 0,
 		velocity = 0,
 		inputs,
 		id;

 	inputs = [];

 	var getX = function() {
 		return x;
 	};

 	var getY = function() {
 		return y;
 	};

	var getAngle = function() {
 		return angle;
 	}

 	var setX = function(newX) {
 		x = newX;
 	};

 	var setY = function(newY) {
 		y = newY
 	}; 	

 	var setAngle = function(newAngle) {
 		angle = newAngle;
 	} 	

 	return {
 		getX: getX,
 		getY: getY,
 		getAngle: getAngle,
 		setX: setX,
 		setY: setY,
 		setAngle: setAngle,
 		inputs: inputs,
 		velocity: velocity,
 		id: id
 	}
 };

 // Export the Player class so you can use it in
// other files by using require("Player").Player
exports.player = player;