var game = new Phaser.Game(368, 368, Phaser.AUTO);

var Pacman = function (game) {

	this.map = null;
	this.layer = null;
	this.pacman = null;
	this.jessie = null;
    this.meowth = null;
    this.james = null;

	this.safetile = 25;
	this.gridsize = 16;

	this.speed = 190;
	this.threshold = 3;

	this.marker = new Phaser.Point();
	this.turnPoint = new Phaser.Point();

	this.directions = [ null, null, null, null, null ];
	this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

	this.current = Phaser.NONE;
	this.turning = Phaser.NONE;

    this.i_jessie_speed= 3;
    this.i_meawth_speed = 1;
    this.i_james_speed = 2;
    this.ghost_speed = [{x:this.speed, y:0}, {x:-(this.speed), y:0}, {x:0, y:this.speed}, {x:0, y:-(this.speed)}];

    this.score = null;
    this.scoreP = null;
    this.cont = null;

    this.lifes = 3;

    this.level2 = null;

    //this.jessiekilled = null;

};

Pacman.prototype = {

	init: function () {

		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;

		Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

		this.physics.startSystem(Phaser.Physics.ARCADE);

	},

	preload: function () {

		this.load.image('dot', 'assets/dot.png');
        this.load.image('dot2', 'assets/dot_2.png');
		this.load.image('tiles', 'assets/pacman-tiles.png');
		this.load.spritesheet('pacman', 'assets/picachu.png', 32, 32);
        this.load.spritesheet('ghost', 'assets/ghosts.png', 19.2, 19.2);
        this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
        //this.load.tilemap('map_level_2', 'assets/pacman-map_level_2.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.audio('intro', 'sounds/intro.mp3');
        this.load.audio('teamr', 'sounds/teamr.wav');

		//  Needless to say, graphics (C)opyright Namco

	},

	create: function () {

		this.map = this.add.tilemap('map');
		this.map.addTilesetImage('pacman-tiles', 'tiles');

		this.layer = this.map.createLayer('Pacman');

		this.dots = this.add.physicsGroup();

		this.map.createFromTiles(25, this.safetile, 'dot', this.layer, this.dots);

		//  The dots will need to be offset by 0px to put them back in the middle of the grid
		this.dots.setAll('x', 2, false, false, 1);
		this.dots.setAll('y', 2, false, false, 1);

		//  Pacman should collide with everything except the safe tile
		this.map.setCollisionByExclusion([this.safetile], true, this.layer);

		//  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
		this.pacman = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman', 0);
		this.pacman.anchor.set(0.5);
		this.pacman.animations.add('munch', [0, 1, 2, 1], 4, true);
		this.physics.arcade.enable(this.pacman);
		this.pacman.body.setSize(16, 16, 0, 0);

		this.cursors = this.input.keyboard.createCursorKeys();

		this.pacman.play('munch');
		this.move(Phaser.LEFT);

        this.score = this.add.text(135, 270, "Score: ", { fontSize: "18px", fill: "#fff" });
        this.intro = this.add.audio('intro');
        this.intro.volume = 0.5;
        this.intro.play();

        this.createGhosts(null);

	},

    createGhosts: function(){

        this.jessie = this.add.sprite(185, 152, 'ghost', 0); //2
        this.meowth = this.add.sprite(215, 152, 'ghost', 4); //1
        this.james = this.add.sprite(155, 152, 'ghost', 8); //0

        this.jessie.anchor.set(0.5);
        this.meowth.anchor.set(0.5);
        this.james.anchor.set(0.5);

        if(this.cont == 50) {
            this.jessie.animations.add('munch', [12, 13], 5, true);
            this.meowth.animations.add('munch', [12, 13], 5, true);
            this.james.animations.add('munch', [12, 13], 5, true);
        }

        else{
            this.jessie.animations.add('munch', [0, 1, 2, 1], 5, true);
            this.meowth.animations.add('munch', [3, 4, 5, 4], 5, true);
            this.james.animations.add('munch', [6, 7, 8, 7], 5, true);
        }

        this.physics.arcade.enable(this.jessie);
        this.physics.arcade.enable(this.meowth);
        this.physics.arcade.enable(this.james);

        this.jessie.body.setSize(12, 12, 0, 0);
        this.meowth.body.setSize(12, 12, 0, 0);
        this.james.body.setSize(12, 12, 0, 0);

        this.jessie.play('munch');
        this.meowth.play('munch');
        this.james.play('munch');

    },

    createMapLevel2: function () {

        this.dots = this.add.physicsGroup();

        this.map.createFromTiles(25, this.safetile, 'dot2', this.layer, this.dots);

        //  The dots will need to be offset by 0px to put them back in the middle of the grid
        this.dots.setAll('x', 2, false, false, 1);
        this.dots.setAll('y', 2, false, false, 1);

        this.intro.stop();

        this.level2 = this.add.audio('teamr');
        this.level2.volume = 0.5;
        this.level2.play();
        this.intro.play();
        this.intro.loop = true;

        this.cont = 0;


    },

	checkKeys: function () {

		if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
		{
			this.checkDirection(Phaser.LEFT);
		}
		else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
		{
			this.checkDirection(Phaser.RIGHT);
		}
		else if (this.cursors.up.isDown && this.current !== Phaser.UP)
		{
			this.checkDirection(Phaser.UP);
		}
		else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
		{
			this.checkDirection(Phaser.DOWN);
		}
		else
		{
			//  This forces them to hold the key down to turn the corner
			this.turning = Phaser.NONE;
		}

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

		var cx = Math.floor(this.pacman.x);
		var cy = Math.floor(this.pacman.y);

		//  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
		if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
		{
			return false;
		}

		//  Grid align before turning
		this.pacman.x = this.turnPoint.x;
		this.pacman.y = this.turnPoint.y;

		this.pacman.body.reset(this.turnPoint.x, this.turnPoint.y);

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
			this.pacman.body.velocity.x = speed;
		}
		else
		{
			this.pacman.body.velocity.y = speed;
		}

		//  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
		this.pacman.scale.x = 1;
		this.pacman.angle = 0;

		if (direction === Phaser.LEFT)
		{
			this.pacman.scale.x = -1;
		}
		else if (direction === Phaser.UP)
		{
			this.pacman.angle = 270;
		}
		else if (direction === Phaser.DOWN)
		{
			this.pacman.angle = 90;
		}

		this.current = direction;

	},

    moveGhost: function (ghost,speed) {

        if(!this.physics.arcade.collide(ghost,this.layer)){
            ghost.body.velocity.x = this.ghost_speed[speed].x;
            ghost.body.velocity.y = this.ghost_speed[speed].y;
        }
        else if(ghost == this.jessie) this.i_jessie_speed = Math.floor(Math.random() * 4);
        else if (ghost == this.meowth) this.i_meawth_speed = Math.floor(Math.random() * 4);
        else this.i_james_speed = Math.floor(Math.random() * 4);

	},

	eatDot: function (pacman, dot) {

		dot.kill();

        this.scoreP += 10;
        this.cont++;

		if (this.dots.total === 0) {

		    this.createMapLevel2();
            this.cont = 0;
            this.lifes = 3;
			//this.dots.callAll('revive');
		}

        if(this.cont == 50){
            this.jessie.kill();
            this.meowth.kill();
            this.james.kill();
            this.createGhosts();
        }

        else if(this.cont == 90){
            this.jessie.kill();
            this.meowth.kill();
            this.james.kill();
            this.createGhosts();

            this.cont = 0;
        }

        if(this.cont > 49 && this.cont <90){
            if(this.physics.arcade.collide(this.pacman, this.jessie)){
                this.jessie.kill();
                this.scoreP += 50;
                //this.jessiekilled = 1;
            }
            else if(this.physics.arcade.collide(this.pacman, this.meowth)){
                this.meowth.kill();
                this.scoreP += 50;
            }
            else if(this.physics.arcade.collide(this.pacman, this.james)){
                this.james.kill();
                this.scoreP += 50;
            }
        }

	},

    // If pokman pass the limit of canvas
	pokmanReturn: function (pacman) {
		if(this.pacman.body.x > 368){
			this.pacman.body.x = this.pacman.body.x % 368;
		}
        else if(this.pacman.body.x < 0){
            this.pacman.body.x = 368;
        }
		//else this.pacman.body.x = this.pacman.body.x;
	},


    ghost_collision: function (ghost) {

	    if(this.physics.arcade.collide(this.pacman, ghost) && (this.cont < 50 || this.cont > 90)){
	        this.pacman.kill();
            this.scoreP = 0;
            this.lifes--;
            if(this.lifes > 0){
                this.pacman = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman', 0);
                this.pacman.anchor.set(0.5);
                this.pacman.animations.add('munch', [0, 1, 2, 1], 5, true);
                this.physics.arcade.enable(this.pacman);
                this.pacman.body.setSize(16, 16, 0, 0);
                this.pacman.play('munch');
            }

            else {
                this.gamover = this.add.text(30, 142, "GAME OVER!", { fontSize: "48px", fill: "#fff" });
                this.dots.callAll('revive');
                this.lifes = 3;
            }

        }

    },

	update: function () {

		this.physics.arcade.collide(this.pacman, this.layer);
		this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);

		this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
		this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;

		//  Update our grid sensors
		this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
		this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
		this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
		this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

        this.score.text = "Score: " + this.scoreP;

		this.checkKeys();

        this.moveGhost(this.jessie, this.i_jessie_speed);
        this.moveGhost(this.meowth, this.i_meawth_speed);
        this.moveGhost(this.james, this.i_james_speed);

		this.pokmanReturn();

        this.ghost_collision(this.jessie);
        this.ghost_collision(this.meowth);
        this.ghost_collision(this.james);

		if (this.turning !== Phaser.NONE)
		{
			this.turn();
		}

	}

};

game.state.add('Game', Pacman, true);
