/**
 *	Bullet client class.
 */
var bullet = function(scene, newX, newY, newAngle, newVelocity, alive) {
	var x = newX,
		y = newY,	
		angle = newAngle,
		startTime = Date.now(),
		aliveTime = alive,
		velocity = newVelocity;

		var green = new THREE.MeshBasicMaterial({color: 0x00ff00});
		var radius = 5; 
		var segments = 32;
		var circleGeometry = new THREE.CircleGeometry(radius, segments);
		var circle = new THREE.Mesh(circleGeometry, green);

		scene.add(circle);

	var update = function() {
		var xv = Math.cos(angle);
		var yv = Math.sin(angle);

		x += xv * velocity;
		y += yv * velocity;

		circle.position.x = x;
		circle.position.y = y;
	};

	var expired = function() {
		return ((startTime + alive) > Date.now());			
	};

	var remove = function() {
		scene.remove(circle);
	};

	return {
		update: update,
		remove: remove,
		expired: expired
	};
};
