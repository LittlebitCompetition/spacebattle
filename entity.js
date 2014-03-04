/**
 * Server entity class.
 */
 var entity = function(startX, startY) {
 	var id,
 		x,
 		y,
 		inputs,
 		angle = 0,
 		velocity = 0,
 		startTime = 0,
 		aliveTime = -1; 		

 	x = startX;
 	y = startY;

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
 		id: id,
 		getX: getX,
 		getY: getY, 	
 		setX: setX,
 		setY: setY,
 		inputs: inputs,
 		velocity: velocity,
 		getAngle: getAngle,
 		setAngle: setAngle, 	 	
 		startTime: startTime,
 		aliveTime: aliveTime 		
 	}
 };

// Export the entity class so you can use it in
// other files by using require("entity").entity
exports.entity = entity;