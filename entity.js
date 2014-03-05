/**
 * Server entity class.
 */
 var entity = function(startX, startY, R) {
 	var id,
 		x,
 		y,
 		inputs,
		radius,
		parentId,
 		angle = 0,
 		velocity = 0,
 		startTime = 0,
 		aliveTime = -1; 		

 	x = startX;
 	y = startY;

	radius = R;

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

	var collision = function(entity2) {
		return (Math.sqrt((x - entity2.getX()) * (x - entity2.getX())
			+ (y - entity2.getY()) * (y - entity2.getY())) < (radius + entity2.radius));
	}

 	return {
		id: id,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		inputs: inputs,
		radius: radius,
		parentId: parentId,
		velocity: velocity,
		getAngle: getAngle,
		setAngle: setAngle,
		collision: collision,
		startTime: startTime,
		aliveTime: aliveTime
 	}
 };

// Export the entity class so you can use it in
// other files by using require("entity").entity
exports.entity = entity;