function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas, difficulty){

		this.gameOver = false;
		this.canvas = canvas;
		this.actors=[]; // all actors on this stage that do move (monsters, player)
		this.staticActors=[]; // all actors on this stage that dont move (boxes, map)
		this.player=null; // a special actor, the player
		this.difficulty = difficulty;	// lower number = more difficult
		this.enemySpawnRate = 500 + (this.difficulty * 500);
		this.enemySpawnTimer = 0;
		this.boxSpawnRate = 5000
		this.boxSpawnTimer = 0;
		this.assassinSpawnRate = 10000;
		this.assassinSpawnTimer = 0;
		this.tankSpawnRate = 20000;
		this.tankSpawnTimer = 0;
		this.boxMax = 10;
		this.boxCount = 10;
	
		// the map width and height
		this.width=canvas.width + 500;
		this.height=canvas.height + 500;
	
		// make map border
		var mapBorder = new Box(this, new Pair(-400, -400), 2 * this.width);
		mapBorder.colour = 'white';
		this.mapBorder = mapBorder;

		// make map
		var map = new Box(this, new Pair(0, 0), this.width);
		map.colour = 'green';
		this.map = map;

		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var radius = 10;
		var colour= 'black';
		var position = new Pair(Math.floor(canvas.width/2), Math.floor(canvas.height/2));
		this.addPlayer(new Player(this, position, velocity, colour, radius));

		// Add some enemies
		for (var i = 0; i < 3; i++) {
			var enemyPosition = new Pair(rand(this.width), rand(this.height));
			var enemy = new Enemy(this, enemyPosition, 10, 'red', 100, 1000, 1/2);
			this.addActor(enemy);
		}

		// Add in some obstacles
		var total=10;
		while(total>0){
			var b = new Box(this, new Pair(rand(this.width), rand(this.height)), 100);
			if (b.coversPlayer()) {continue;}
			this.addStaticActor(b);
			total--;
		}
	}

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	addStaticActor(actor) {
		this.staticActors.push(actor)
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	removeStaticActor(actor) {
		var index = this.staticActors.indexOf(actor);
		if (index != -1 ) {
			this.staticActors.splice(index, 1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){

		// add box if the spawn interval is up
		if (this.boxSpawnTimer + 1 == this.boxSpawnRate && this.boxCount <= this.boxMax) {
			var newBox = new Box(this, new Pair(rand(this.width), rand(this.height)), 100);
			this.addStaticActor(newBox);
		}
		this.boxSpawnTimer = (this.boxSpawnTimer + 1) % this.boxSpawnRate;

		// add enemy if the spawn interval is up
		if (this.enemySpawnTimer + 1 == this.enemySpawnRate) {
			var newEnemy = new Enemy(this, new Pair(rand(this.width), rand(this.height)), 10, 'red', 100, 1000, 1/2);
			this.addActor(newEnemy);
		}
		this.enemySpawnTimer = (this.enemySpawnTimer + 1) % this.enemySpawnRate;

		// spawn assassin enemy
		if (this.assassinSpawnTimer + 1 == this.assassinSpawnRate) {
			var newAssassin = new Enemy(this, new Pair(rand(this.width), rand(this.height)), 10, 'purple', 400, 750, 1);
			this.addActor(newAssassin);
		}
		this.assassinSpawnTimer = (this.assassinSpawnTimer + 1) % this.assassinSpawnRate;

		// spawn assassin enemy
		if (this.tankSpawnTimer + 1 == this.tankSpawnRate) {
			var newTank = new Enemy(this, new Pair(rand(this.width), rand(this.height)), 50, 'grey', 2000, 250, 1/3);
			this.addActor(newTank);
		}
		this.tankSpawnTimer = (this.tankSpawnTimer + 1) % this.tankSpawnRate;

		// call step on all the actors
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');
		context.save();
		context.translate((-1 * (this.player.position.x)) + Math.floor(this.canvas.width / 2), (-1 * this.player.position.y) + Math.floor(this.canvas.height / 2));
		
		// draw map
		this.mapBorder.draw(context);
		this.map.draw(context);

		// draw static actors
		for (var i = 0; i < this.staticActors.length; i++) {
			this.staticActors[i].draw(context);
		}

		// draw moving actors
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}

		// draw ammo and health
		context.font = '30px Arial';
		context.fillText("AMMO: " + this.player.ammo, this.player.x - 375, this.player.y + 375);
		context.fillText("HEALTH: " + this.player.health, this.player.x - 100, this.player.y + 375);
		context.fillText("SCORE: " + this.player.score, this.player.x + 225, this.player.y - 350);

		context.restore();
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}

	// check if box covers the given x, y, if it does, return that box object, false otherwise
	checkBoxAt(x, y) {
		for (var i = 0; i < this.staticActors.length; i++) {
			if (this.staticActors[i].x < x + 10 && x - 10 < this.staticActors[i].x + 100 &&
				this.staticActors[i].y < y + 10 && y - 10 < this.staticActors[i].y + 100) {
					return this.staticActors[i];
			}
		}
		return false;
	}

	/*
	checkActorAt(x, y, collider) {
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof gameCharacter && 
				this.actors[i].x - 10 < x + 10 && x - 10 < this.actors[i].x + 10 &&
				this.actors[i].y - 10 < y + 10 && y - 10 < this.actors[i].y + 10 &&
				this.actors[i] != collider) {
					return this.actors[i];
			}
		}
		return false;
	}
	*/
	
	checkActorAt(collider) {
		
		var colliderRad = collider.radius;
		var colliderX = collider.position.x;
		var colliderY = collider.position.y;

		// loop through actors
		for (var i = 0; i < this.actors.length; i++) {
			
			var collidee = this.actors[i];
			var collideeRad = collidee.radius;
			var collideeX = collidee.position.x;
			var collideeY = collidee.position.y;

			if (collidee instanceof gameCharacter && collidee != collider) {
					
				// check for overlapping x
				if (collideeX - collideeRad < colliderX + colliderRad && colliderX - colliderRad < collideeX + collideeRad) {
					
					//check for overlapping y
					if (collideeY - collideeRad < colliderY + colliderRad && colliderY - colliderRad < collideeY + collideeRad) {
						return collidee;
					}
				}
			}
		}
		/*
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof gameCharacter && 
				this.actors[i].x - 10 < colliderX + 10 && colliderX - 10 < this.actors[i].x + 10 &&
				this.actors[i].y - 10 < colliderY + 10 && colliderY - 10 < this.actors[i].y + 10 &&
				this.actors[i] != collider) {
					return this.actors[i];
			}
		}*/
		return false;
	}
	
	
} // End Class Stage

class Box {
	constructor(stage, position, size){
		this.stage = stage;
		this.x=position.x;
		this.y=position.y;
		this.colour = 'rgba('+randint(255)+','+randint(255)+','+randint(255)+')';
		this.size = size;
		this.health = 6;
	}

	coversPlayer() {
		var playerX = this.stage.player.position.x;
		var playerY = this.stage.player.position.y;

		if (this.x <= playerX && playerX <= this.x + this.size && 
			this.y <= playerY && playerY <= this.y + this.size) {
			return true;
		}
		return false;
	}

	takeDamage(damage) {
		this.health -= damage;
		this.checkIfDead();
	}

	checkIfDead() {
		if (this.health <= 0) {
			this.killActor();
		}
	}

	killActor() {
		this.stage.removeStaticActor(this);
	}
	
	draw(context){
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.size, this.size);
		  
		context.strokeStyle = 'black';
		context.lineWidth = 1;
		context.strokeRect(this.x, this.y, this.size, this.size);
	}
}

class gameCharacter {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	takeDamage(damage) {
		this.health -= damage;
		this.checkIfDead();
	}

	checkIfDead() {
		if (this.health <= 0) {
			this.killActor();
		}
	}

	killActor() {
		this.stage.removeActor(this);
		if (this != this.stage.player) {
			this.stage.player.score++;
		}
	}

	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	step(){
		if (this.stage.checkBoxAt(this.position.x + this.velocity.x, this.position.y + this.velocity.y) == false /*&&
			this.stage.checkActorAt(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this) == false*/) {
			this.position.x=this.position.x+this.velocity.x;
			this.position.y=this.position.y+this.velocity.y;
		}
		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
	}

	draw(context){
		
		// draw player
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fillStyle = this.colour;
		context.fill();

		// draw turret
		context.arc(this.x + this.turretOffset.x, this.y + this.turretOffset.y, 5, 0, 2 * Math.PI, false);
		context.fillStyle = this.colour;
		context.fill();
	}
}

class Player extends gameCharacter {

	constructor(stage, position, velocity, colour, radius){
		super(stage, position);
		this.intPosition(); // this.x, this.y are int version of this.position
		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
		this.health = 200;
		this.ammo = 30;
		this.turretOffset = new Pair(0, -10);
		this.score = 0;
	}

	shoot(clientX, clientY) {
		
		if (!this.canShoot()) {
			return;
		}
		var projectile = new Projectile(this, stage, new Pair(this.position.x, this.position.y), new Pair(this.position.x + (clientX - 400), this.position.y + (clientY - 400)));
		this.stage.addActor(projectile);
		this.ammo--;
	}

	canShoot() {
		if (this.ammo > 0){return true;}
		return false;
	}	

	pickupAmmo() {
		if (this.stage.checkBoxAt(this.position.x + this.velocity.x, this.position.y + this.velocity.y)) {
			this.ammo++;
		}
	}

	checkIfDead() {
		if (this.health <= 0) {
			this.killActor();
			this.stage.gameOver = true;
		}
	}

	adjustTurret(x, y) {

		// convert coordinates of user's click to coordinates that correspond to the canvas
		if (x != null && y != null) {
			x = x - this.stage.canvas.getBoundingClientRect().left;
			y = y - this.stage.canvas.getBoundingClientRect().top;
		}
		else {
			x = this.position.x;
			y = this.position.y + 10;
		}

		// calculate offset
		var angle = Math.atan2(y - this.stage.canvas.height/2, x - this.stage.canvas.width/2);
		this.turretOffset = new Pair(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
	}
}

class Enemy extends gameCharacter {
	
	constructor(stage, position, radius, colour, health, shootInterval, speed) {
		super(stage, position);
		this.intPosition();
		this.calculateVelocity();
		this.turretOffset = this.velocity;
		this.radius = radius;
		this.health = health;
		this.colour = colour;
		this.speed = speed;
		this.shootInterval = shootInterval;
	}

	calculateVelocity() {

		if (this.position.x == this.stage.player.position.x && this.position.y == this.stage.player.position.y) {
			this.velocity = new Pair(0,0);
			return
		}

		var x = this.stage.player.position.x;
		var y = this.stage.player.position.y;
		var angle = Math.atan2(y - this.position.y, x - this.position.x);
		this.velocity = new Pair(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
		this.turretOffset = new Pair(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
	}

	step() {
		this.calculateVelocity();
		this.checkCanShoot();
		super.step();
	}

	checkCanShoot() {
		if (this.shootInterval == 0) {
			this.shoot(this.stage.player.position.x, this.stage.player.position.y);
		}
		this.shootInterval = (this.shootInterval + 1) % 1000;
	}

	shoot(x, y) {
		var projectile = new Projectile(this, stage, new Pair(this.position.x, this.position.y), new Pair(x, y));
		this.stage.addActor(projectile);
	}
}

// class for projectiles (bullets)
class Projectile {
	constructor(owner, stage, projectileOrigin, clickPosition) {
		
		// assign attributes
		this.owner = owner;
		this.projectileOrigin = projectileOrigin;
		this.position = new Pair(projectileOrigin.x, projectileOrigin.y);
		this.radius = 5;
		this.stage = stage;
		this.setVelocity(projectileOrigin, clickPosition);
		//this.position = new Pair(projectileOrigin.x + 10 * this.velocity.x, projectileOrigin.y + 10 * this.velocity.y);
		this.ttl = 1000; // time to live in number of steps
	}

	// calculate velocity of this projectile using the coordinates of the user's click
	setVelocity (projectileOrigin, clickPosition) {
		var angle = Math.atan2(clickPosition.y - projectileOrigin.y, clickPosition.x - projectileOrigin.x);
		this.velocity = new Pair(Math.cos(angle)*3, Math.sin(angle)*3);
	}

	step(){
	
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;

		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		
		this.decrementTTL();
		this.intPosition();
		this.checkProjectileHit();
	}

	decrementTTL() {
		this.ttl--;
		if (this.ttl == 0) {
			this.stage.removeActor(this);
		}
	}

	killProjectile() {
		this.stage.removeActor(this);
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	checkProjectileHit() {
		
		var box = this.stage.checkBoxAt(this.position.x, this.position.y);
		if (box != false) {
			box.takeDamage(1);
			this.killProjectile();
		}
		
		var actor = this.stage.checkActorAt(this);
		if (actor != false && actor != this.owner) {
			actor.takeDamage(20);
			this.killProjectile();
		}
	}

	draw (context) {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		context.fillStyle = 'black';
		context.fill();
	}
}

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
}