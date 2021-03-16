function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas){
		this.canvas = canvas;
	
		this.actors=[]; // all actors on this stage that do move (monsters, player)
		this.staticActors=[]; // all actors on this stage that dont move (boxes, map)
		this.player=null; // a special actor, the player
	
		// the map width and height
		this.width=canvas.width + 500;
		this.height=canvas.height + 500;
	
		// make map
		var x = 0;
		var y = 0;
		var velocity = new Pair(0,0);
		var radius = this.width;
		var colour = 'green';
		var position = new Pair(x, y);
		var b = new Box(this, position, velocity, colour, radius);
		this.addStaticActor(b);

		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var radius = 10;
		var colour= 'rgba(255,0,0,1)';
		var position = new Pair(Math.floor(canvas.width/2), Math.floor(canvas.height/2));
		this.addPlayer(new Player(this, position, velocity, colour, radius));

		// Add in some Balls
		var total=10;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width))); 
			var y=Math.floor((Math.random()*(this.height))); 
			if(this.getActor(x,y)===null){
				var velocity = new Pair(rand(20), rand(20));
				var red=randint(255), green=randint(255), blue=randint(255);
				var radius = 100;
				var alpha = 1;
				var colour= 'rgba('+red+','+green+','+blue+','+alpha+')';
				var position = new Pair(x,y);
				var b = new Box(this, position, velocity, colour, radius);
				if (b.coversPlayer()) {continue;}
				this.addStaticActor(b);
				total--;
			}
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
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');
		context.save();
		context.translate((-1 * (this.player.position.x)) + Math.floor(this.canvas.width / 2), (-1 * this.player.position.y) + Math.floor(this.canvas.height / 2));
		
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
		for (var i = 1; i < this.staticActors.length; i++) {
			if (this.staticActors[i].x < x && x < this.staticActors[i].x + 100 &&
				this.staticActors[i].y < y && y< this.staticActors[i].y + 100) {
					return this.staticActors[i];
			}
		}
		return false;
	}
} // End Class Stage

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

class Box {
	constructor(stage, position, velocity, colour, radius){
		this.stage = stage;
		this.x=position.x;
		this.y=position.y;
		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
		this.health = 6;
	}

	coversPlayer() {
		var playerX = this.stage.player.position.x;
		var playerY = this.stage.player.position.y;

		if (this.x <= playerX && playerX <= this.x + this.radius && 
			this.y <= playerY && playerY <= this.y + this.radius) {
			return true;
		}
		return false;
	}

	takeDamage() {
		this.health--;
		if (this.isDestroyed()) {
			this.stage.removeStaticActor(this);
		}
	}

	isDestroyed() {
		if (this.health == 0) {return true;}
		return false;
	}
	
	draw(context){
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.radius,this.radius);
		  
		context.strokeStyle = 'black';
		context.lineWidth = 1;
		context.strokeRect(this.x, this.y, this.radius,this.radius);
	}

}

class Player {

	constructor(stage, position, velocity, colour, radius){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position
		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
		this.ammo = 30;
		this.turretOffset = new Pair(0, -10);
		this.health = 100;
		this.score = 0;
	}

	step(){
		if (this.stage.checkBoxAt(this.position.x + this.velocity.x, this.position.y + this.velocity.y) == false) {
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

	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	shoot(clientX, clientY) {
		
		if (!this.canShoot()) {
			return;
		}
		var projectile = new Projectile(stage, new Pair(clientX, clientY));
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
		this.turretOffset = new Pair(10 * Math.cos(angle), 10 * Math.sin(angle));
	}

	draw(context){
		
		//console.log(self.position.x, self.position.);

		// draw player
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fillStyle = 'red';
		context.fill();

		// draw turret
		context.arc(this.x + this.turretOffset.x, this.y + this.turretOffset.y, 5, 0, 2 * Math.PI, false);
		context.fillStyle = 'red';
		context.fill();
	}
}

// class for projectiles (bullets)
class Projectile {
	constructor(stage, clickPosition) {
		
		// convert coordinates of user's click to coordinates that correspond to the canvas
		var x = clickPosition.x - stage.canvas.getBoundingClientRect().left;
		var y = clickPosition.y - stage.canvas.getBoundingClientRect().top;
		
		// assign attributes
		this.stage = stage;
		this.position = new Pair(stage.player.position.x, stage.player.position.y);
		this.setVelocity(new Pair(x, y));
		this.ttl = 1000; // time to live in number of steps
	}

	// calculate velocity of this projectile using the coordinates of the user's click
	setVelocity (clickPosition) {
		var angle = Math.atan2(clickPosition.y - this.stage.canvas.height/2, clickPosition.x - this.stage.canvas.width/2);
		this.velocity = new Pair(Math.cos(angle)*3, Math.sin(angle)*3);
	}

	step(){
		
		this.decrementTTL();

		var newX = this.position.x+this.velocity.x;
		var newY = this.position.y+this.velocity.y;
		var box = this.stage.checkBoxAt(newX, newY);

		if (box == false) {
			this.position.x=this.position.x+this.velocity.x;
			this.position.y=this.position.y+this.velocity.y;
		}
		else {
			box.takeDamage();
			this.killProjectile();
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

	draw (context) {
		context.beginPath();
		context.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
		context.fillStyle = 'black';
		context.fill();
	}
}

