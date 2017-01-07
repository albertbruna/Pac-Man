/**
 * Created by Albert on 20/12/2016.
 */

 var Ghost = function (game) {

 this.map = null;
 this.layer = null;
 this.ghost = null;

 this.safetile = 25;
 this.gridsize = 16;

 this.speed = 100;
 this.threshold = 3;

 this.marker = new Phaser.Point();
 this.turnPoint = new Phaser.Point();

 this.directions = [ null, null, null, null, null ];
 this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

 this.current = Phaser.NONE;
 this.turning = Phaser.NONE;

 };

 Ghost.prototype = {

 init: function () {

 //            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
 //            this.scale.pageAlignHorizontally = true;
 //            this.scale.pageAlignVertically = true;
 //
 //            Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

 this.physics.startSystem(Phaser.Physics.ARCADE);

 },

 create: function () {

 // this.map = this.add.tilemap('map');
 // this.map.addTilesetImage('ghost-tiles', 'tiles');
 //
 // this.layer = this.map.createLayer('ghost');
 //
 // this.dots = this.add.physicsGroup();
 //
 // this.map.createFromTiles(25, this.safetile, 'dot', this.layer, this.dots);
 //
 // //  The dots will need to be offset by 6px to put them back in the middle of the grid
 // this.dots.setAll('x', 0, false, false, 1);
 // this.dots.setAll('y', 0, false, false, 1);

 this.ghost = this.add.sprite((9 * 8), (10 * 12), 'ghost', 0);
 this.ghost.play('munch');


 },

 checkKeys: function () {

 this.checkDirection(Phaser.UP);
 },

 checkDirection: function (turnTo) {

 if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
 {
 //  Invalid direction if they're already set to turn that way
 //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
 return;
 }

 //  Check if they want to turn around and can
 if (this.current === this.opposites[turnTo])
 {
 this.move(turnTo);
 }
 else
 {
 this.turning = turnTo;

 this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
 this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
 }

 },

 turn: function () {

 var cx = Math.floor(this.ghost.x);
 var cy = Math.floor(this.ghost.y);

 //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
 if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
 {
 return false;
 }

 //  Grid align before turning
 this.ghost.x = this.turnPoint.x;
 this.ghost.y = this.turnPoint.y;

 this.ghost.body.reset(this.turnPoint.x, this.turnPoint.y);

 this.move(this.turning);

 this.turning = Phaser.NONE;

 return true;

 },

 move: function (direction) {

 var speed = this.speed;

 if (direction === Phaser.LEFT || direction === Phaser.UP)
 {
 speed = -speed;
 }

 if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
 {
 this.ghost.body.velocity.x = speed;
 }
 else
 {
 this.ghost.body.velocity.y = speed;
 }
 this.current = direction;

 },


 update: function () {

 this.physics.arcade.collide(this.ghost, this.layer);
 //this.physics.arcade.overlap(this.ghost, this.dots, this.eatDot, null, this);

 this.marker.x = this.math.snapToFloor(Math.floor(this.ghost.x), this.gridsize) / this.gridsize;
 this.marker.y = this.math.snapToFloor(Math.floor(this.ghost.y), this.gridsize) / this.gridsize;

 //  Update our grid sensors
 this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
 this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
 this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
 this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

 this.checkKeys();

 if (this.turning !== Phaser.NONE)
 {
 this.turn();
 }

 }

 };