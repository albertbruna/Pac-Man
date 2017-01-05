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

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.physics.startSystem(Phaser.Physics.ARCADE);

    },

    preload: function () {

        this.load.image('dot', 'assets/dot.png');
        this.load.image('tiles', 'assets/ghost-tiles.png');
        this.load.spritesheet('ghost', 'assets/ghost.png', 32, 32);
        this.load.spritesheet('ghost', 'assets/car.png', 32, 32);
        this.load.tilemap('map', 'assets/ghost-map.json', null, Phaser.Tilemap.TILED_JSON);

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
        //
        // //  ghost should collide with everything except the safe tile
        // this.map.setCollisionByExclusion([this.safetile], true, this.layer);

        //  Position ghost at grid location 14x17 (the +8 accounts for his anchor)
        this.ghost = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'ghost', 0);
        this.ghost.anchor.set(0.5);
        this.ghost.animations.add('munch', [0, 1, 2, 1], 5, true);

        this.physics.arcade.enable(this.ghost);
        this.ghost.body.setSize(16, 16, 0, 0);

        //this.cursors = this.input.keyboard.createCursorKeys();

        this.ghost.play('munch');
        this.move(Phaser.LEFT);

        this.ghost = this.add.sprite((9 * 8), (10 * 12), 'ghost', 0);
        this.ghost.play('munch');


    },

    checkKeys: function () {

        this.checkDirection(Phaser.RIGHT);
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

        //  Reset the scale and angle (ghost is facing to the right in the sprite sheet)
        this.ghost.scale.x = 1;
        this.ghost.angle = 0;

        if (direction === Phaser.LEFT)
        {
            this.ghost.scale.x = -1;
        }
        else if (direction === Phaser.UP)
        {
            this.ghost.angle = 270;
        }
        else if (direction === Phaser.DOWN)
        {
            this.ghost.angle = 90;
        }

        this.current = direction;

    },

    // eatDot: function (ghost, dot) {
    //
    //     dot.kill();
    //
    //     /*if (this.dots.total === 0)
    //      {
    //      this.dots.callAll('revive');
    //      }*/
    //
    // },


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