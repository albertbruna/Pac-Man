<<<<<<< HEAD
/**
 * Created by Albert on 05/01/2017.
 */

var game = new Phaser.Game(448, 448, Phaser.AUTO,' ',{init: init, reload: reload, create:create, checkKeys:checkKeys, checkDirection:checkDirection, turn:turn, move:move, moveGhosts:moveGhosts, eatDot:eatDot, pokman_return:pokman_return, update:update});

var map = null;
var layer = null;
var pacman = null;

var safetile = 25;
var gridsize = 16;

var speed = 100;
var threshold = 3;

var marker = new Phaser.Point();
var turnPoint = new Phaser.Point();

var directions = [ null, null, null, null, null ];
var opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

var current = Phaser.NONE;
var turning = Phaser.NONE;


function init() {

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    Phaser.Canvas.setImageRenderingCrisp(game.canvas);

    game.physics.startSystem(Phaser.Physics.ARCADE);
}

function reload() {
    game.load.image('dot', 'assets/dot.png');
    game.load.image('tiles', 'assets/pacman-tiles.png');
    game.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
    game.load.spritesheet('ghost', 'assets/ghost.png', 32, 32);
    game.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('pacman-tiles', 'tiles');
    layer = map.createLayer('Pacman');
    dots = game.add.physicsGroup();
    map.createFromTiles(25, safetile, 'dot', layer, dots);

    //  The dots will need to be offset by 6px to put them back in the middle of the grid
    dots.setAll('x', 0, false, false, 1);
    dots.setAll('y', 0, false, false, 1);

    //  Pacman should collide with everything except the safe tile
    map.setCollisionByExclusion([safetile], true, layer);

    //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
    pacman = game.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman', 0);
    ghost = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'ghost', 0);

    pacman.anchor.set(0.5);
    ghost.anchor.set(0.5);

    pacman.animations.add('munch', [0, 1, 2, 1], 5, true);
    pacman.play('munch');
    ghost.play('munch');

    game.physics.arcade.enable(pacman);
    game.physics.arcade.enable(ghost);
    pacman.body.setSize(16, 16, 0, 0);
    ghost.body.setSize(16, 16, 0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    //move(Phaser.LEFT);
}

function checkKeys() {
    if (cursors.left.isDown && current !== Phaser.LEFT) {
        checkDirection(Phaser.LEFT);
    }
    else if (cursors.right.isDown && current !== Phaser.RIGHT) {
        checkDirection(Phaser.RIGHT);
    }
    else if (cursors.up.isDown && current !== Phaser.UP) {
        checkDirection(Phaser.UP);
    }
    else if (cursors.down.isDown && current !== Phaser.DOWN) {
        checkDirection(Phaser.DOWN);
    }
    else {
        //  This forces them to hold the key down to turn the corner
        turning = Phaser.NONE;
    }
}

function checkDirection(turnTo) {
    if (turning === turnTo || directions[turnTo] === null || directions[turnTo].index !== safetile) {
        //  Invalid direction if they're already set to turn that way
        //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
        return;
    }

    //  Check if they want to turn around and can
    if (current === opposites[turnTo]) {
        move(turnTo);
    }
    else {
        turning = turnTo;

        turnPoint.x = (marker.x * gridsize) + (gridsize / 2);
        turnPoint.y = (marker.y * gridsize) + (gridsize / 2);
    }
}

function turn() {
    var cx = Math.floor(pacman.x);
    var cy = Math.floor(pacman.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!math.fuzzyEqual(cx, turnPoint.x, threshold) || !math.fuzzyEqual(cy, turnPoint.y, threshold)) {
        return false;
    }

    //  Grid align before turning
    pacman.x = turnPoint.x;
    pacman.y = turnPoint.y;

    pacman.body.reset(turnPoint.x, turnPoint.y);

    move(turning);

    turning = Phaser.NONE;

    return true;
}

function move(direction) {
    var speed = speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
        speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
        pacman.body.velocity.x = speed;
    }
    else {
        pacman.body.velocity.y = speed;
    }

    //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
    pacman.scale.x = 1;
    pacman.angle = 0;

    if (direction === Phaser.LEFT) {
        pacman.scale.x = -1;
    }
    else if (direction === Phaser.UP) {
        pacman.angle = 270;
    }
    else if (direction === Phaser.DOWN) {
        pacman.angle = 90;
    }

    current = direction;
}

function moveGhosts(){
    ghost.body.velocity.x = -speed;

    if(game.physics.arcade.collide(ghost, layer) != true) {
        ghost.body.velocity.y = speed;
        if(game.physics.arcade.collide(ghost, layer) != true) {
            ghost.body.velocity.x = speed;
        }
    }
}

function eatDot(pacman, dot) {
    dot.kill();

    /*if (dots.total === 0)
     {
     dots.callAll('revive');
     }*/
}

function pokman_return() {
    if(pacman.body.x > 448){
        pacman.body.x = pacman.body.x % 448;
    }
    else pacman.body.x = 448;
}

function update() {
    game.physics.arcade.collide(pacman, layer);
    game.physics.arcade.overlap(pacman, dots, eatDot, null, this);

    marker.x = math.snapToFloor(Math.floor(pacman.x), gridsize) / gridsize;
    marker.y = math.snapToFloor(Math.floor(pacman.y), gridsize) / gridsize;

    //  Update our grid sensors
    directions[1] = map.getTileLeft(layer.index, marker.x, marker.y);
    directions[2] = map.getTileRight(layer.index, marker.x, marker.y);
    directions[3] = map.getTileAbove(layer.index, marker.x, marker.y);
    directions[4] = map.getTileBelow(layer.index, marker.x, marker.y);

    checkKeys();

    if (turning !== Phaser.NONE) {
        turn();
    }

    pokman_return();
}

//game.state.add('Game', Pacman, true);
=======
/**
 * Created by Albert on 05/01/2017.
 */

var game = new Phaser.Game(448, 448, Phaser.AUTO, {init: init, reload: reload, create:create, checkKeys:checkKeys, checkDirection:checkDirection, turn:turn, move:move, eatDot:eatDot, update:update});

var map = null;
var layer = null;
var pacman = null;

var safetile = 25;
var gridsize = 16;

var speed = 100;
var threshold = 3;

var marker = new Phaser.Point();
var turnPoint = new Phaser.Point();

var directions = [ null, null, null, null, null ];
var opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

var current = Phaser.NONE;
var turning = Phaser.NONE;


function init() {

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    Phaser.Canvas.setImageRenderingCrisp(game.canvas);

    game.physics.startSystem(Phaser.Physics.ARCADE);
}

function reload() {
    game.load.image('dot', 'assets/dot.png');
    game.load.image('tiles', 'assets/pacman-tiles.png');
    game.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
    game.load.spritesheet('ghost', 'assets/ghost.png', 32, 32);
    game.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('pacman-tiles', 'tiles');
    layer = map.createLayer('Pacman');
    dots = game.add.physicsGroup();
    map.createFromTiles(25, safetile, 'dot', layer, dots);

    //  The dots will need to be offset by 6px to put them back in the middle of the grid
    dots.setAll('x', 0, false, false, 1);
    dots.setAll('y', 0, false, false, 1);

    //  Pacman should collide with everything except the safe tile
    map.setCollisionByExclusion([safetile], true, layer);

    //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
    pacman = game.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'pacman', 0);
    pacman.anchor.set(0.5);
    pacman.animations.add('munch', [0, 1, 2, 1], 5, true);

    game.physics.arcade.enable(pacman);
    pacman.body.setSize(16, 16, 0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    pacman.play('munch');
    //move(Phaser.LEFT);

    ghost = this.add.sprite((14 * 16) + 8, (17 * 16) + 8, 'ghost', 0);
    ghost.play('munch');

    ghost.anchor.set(0.5);
    game.physics.arcade.enable(ghost);
    ghost.body.setSize(16, 16, 0, 0);
}

function checkKeys() {
    if (cursors.left.isDown && current !== Phaser.LEFT) {
        checkDirection(Phaser.LEFT);
    }
    else if (cursors.right.isDown && current !== Phaser.RIGHT) {
        checkDirection(Phaser.RIGHT);
    }
    else if (cursors.up.isDown && current !== Phaser.UP) {
        checkDirection(Phaser.UP);
    }
    else if (cursors.down.isDown && current !== Phaser.DOWN) {
        checkDirection(Phaser.DOWN);
    }
    else {
        //  This forces them to hold the key down to turn the corner
        turning = Phaser.NONE;
    }
}

function checkDirection(turnTo) {
    if (turning === turnTo || directions[turnTo] === null || directions[turnTo].index !== safetile) {
        //  Invalid direction if they're already set to turn that way
        //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
        return;
    }

    //  Check if they want to turn around and can
    if (current === opposites[turnTo]) {
        move(turnTo);
    }
    else {
        turning = turnTo;

        turnPoint.x = (marker.x * gridsize) + (gridsize / 2);
        turnPoint.y = (marker.y * gridsize) + (gridsize / 2);
    }
}

function turn() {
    var cx = Math.floor(pacman.x);
    var cy = Math.floor(pacman.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!math.fuzzyEqual(cx, turnPoint.x, threshold) || !math.fuzzyEqual(cy, turnPoint.y, threshold)) {
        return false;
    }

    //  Grid align before turning
    pacman.x = turnPoint.x;
    pacman.y = turnPoint.y;

    pacman.body.reset(turnPoint.x, turnPoint.y);

    move(turning);

    turning = Phaser.NONE;

    return true;
}

function move(direction) {
    var speed = speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
        speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
        pacman.body.velocity.x = speed;
    }
    else {
        pacman.body.velocity.y = speed;
    }

    //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
    pacman.scale.x = 1;
    pacman.angle = 0;

    if (direction === Phaser.LEFT) {
        pacman.scale.x = -1;
    }
    else if (direction === Phaser.UP) {
        pacman.angle = 270;
    }
    else if (direction === Phaser.DOWN) {
        pacman.angle = 90;
    }

    current = direction;
}

function eatDot(pacman, dot) {
    dot.kill();

    /*if (dots.total === 0)
     {
     dots.callAll('revive');
     }*/
}

function pokman_return () {
    if(pacman.body.x > 448){
        pacman.body.x = pacman.body.x % 448;
    }
    else pacman.body.x = 448;
}

function update() {
    game.physics.arcade.collide(pacman, layer);
    game.physics.arcade.overlap(pacman, dots, eatDot, null, this);

    checkKeys();
    pokman_return();

    marker.x = math.snapToFloor(Math.floor(pacman.x), gridsize) / gridsize;
    marker.y = math.snapToFloor(Math.floor(pacman.y), gridsize) / gridsize;

    //  Update our grid sensors
    directions[1] = map.getTileLeft(layer.index, marker.x, marker.y);
    directions[2] = map.getTileRight(layer.index, marker.x, marker.y);
    directions[3] = map.getTileAbove(layer.index, marker.x, marker.y);
    directions[4] = map.getTileBelow(layer.index, marker.x, marker.y);

    if (turning !== Phaser.NONE) {
        turn();
    }
}

game.state.add('Game', Pacman, true);
>>>>>>> origin/master
