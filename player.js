/**
 * Server player class.
 */
 var player = function(newId, startX, startY) {
 	var x = startX,
 		y = startY,
 		id = newId;

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

 	var getId = function() {
 		return id;
 	}

 	return {
 		getX: getX,
 		getY: getY,
 		setX: setX,
 		setY: setY,
 		getId: getId
 	}
 };

 // Export the Player class so you can use it in
// other files by using require("Player").Player
exports.player = player;