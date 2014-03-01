/**
 * Server player class.
 */
 var player = function(startX, startY) {
 	var x = startX,
 		y = startY,
 		inputs,
 		id;

 	inputs = [];

 	var getX = function() {
 		return x;
 	};

 	var getY = function() {
 		return y;
 	};

 	var setX = function(newX) {
 		x = newX;
 	};

 	var setY = function(newY) {
 		y = newY
 	}; 	

 	return {
 		getX: getX,
 		getY: getY,
 		setX: setX,
 		setY: setY,
 		inputs: inputs,
 		id: id
 	}
 };

 // Export the Player class so you can use it in
// other files by using require("Player").Player
exports.player = player;