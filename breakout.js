let player, ball, bricks, cursors;
let openingText, gameOverText, playerWonText, livesText, levelsText, scoreText;
let gameStarted = false;
let currentLevel = 1;
let lives = 9;
let score = 0;
let isGameOver = false;

// This object contains all the Phaser configurations to load our game
const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  heigth: 640,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: false,
    },
  },
};

// Create the game instance
const game = new Phaser.Game(config);

function preload() {
  this.load.image("ball", "assets/images/ball1.png");
  this.load.image("paddle", "assets/images/paddle1.png");
  this.load.image("brick1", "assets/images/blue1.png");
  this.load.image("brick2", "assets/images/purple1.png");
  this.load.image("brick3", "assets/images/red1.png");
  this.load.image("brick4", "assets/images/yellow1.png");
  this.load.image("brick5", "assets/images/green1.png");
}

function create() {
  openingText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "Press SPACE to Start",
    {
      fontSize: "50px",
      fill: "#fff",
    }
  );

  // Create game over text
  gameOverText = this.add.text(
    this.physics.world.bounds.width / 2,
    (this.physics.world.bounds.height / 3) * 2,
    "Game Over",
    {
      fontSize: "50px",
      fill: "#fff",
    }
  );

  gameOverText.setOrigin(0.5);

  // Make it invisible until the player loses
  gameOverText.setVisible(false);

  // Create the game won text
  playerWonText = this.add.text(
    this.physics.world.bounds.width / 2,
    (this.physics.world.bounds.height / 3) * 2,
    "You won!",
    {
      fontSize: "50px",
      fill: "#fff",
    }
  );

  playerWonText.setOrigin(0.5);

  // Make it invisible until the player wins
  playerWonText.setVisible(false);

  openingText.setOrigin(0.5);

  // show how many lives are left
  livesText = this.add.text(
    this.physics.world.bounds.width - 80,
    0,
    `lives: ${lives}`
  );

  // show which level the player is at
  levelsText = this.add.text(
    this.physics.world.bounds.width / 2 - 50,
    0,
    `level: ${currentLevel}`
  );

  // show total score
  scoreText = this.add.text(0, 0, `score: ${score}`);

  player = this.physics.add.sprite(
    400, // x position
    600, // y position
    "paddle" // key of image for the sprite
  );
  player.setImmovable(true);

  ball = this.physics.add.sprite(
    400, // x position
    565, // y position
    "ball" // key of image for the sprite
  );

  //   bricks = this.physics.add.group({
  //     key: "brick1",
  //     repeat: 9,
  //     immovable: true, // prevent ball to lose velocity when it hits a brick
  //     setXY: {
  //       x: 80,
  //       y: 140,
  //       stepX: 70,
  //     },
  //   });

  bricks = this.physics.add.group();
  loadBricks(bricks, currentLevel);

  cursors = this.input.keyboard.createCursorKeys();
  player.setCollideWorldBounds(true);
  ball.setCollideWorldBounds(true);
  ball.setBounce(1, 1);

  this.physics.world.checkCollision.down = false;
  this.physics.add.collider(ball, bricks, hitBrick, null, this);
  this.physics.add.collider(ball, player, hitPlayer, null, this);
}

function update() {
  player.body.setVelocityX(0);

  if (cursors.left.isDown) {
    player.body.setVelocityX(-400);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(400);
  }
  // Check if the ball left the scene
  if (ball.body.y > this.physics.world.bounds.height) {
    if (lives > 1) {
      lives--;
      livesText.setText(`lives: ${lives}`);
      putBallOnPaddle();
    } else {
      isGameOver = true;
    }
  }

  if (isGameOver) {
    // Show "Game over" message to the player
    livesText.setText("lives: 0");
    gameOverText.setVisible(true);
    ball.disableBody(true, true);
  } else if (isWon()) {
    playerWonText.setVisible(true);
    ball.disableBody(true, true);
  } else {
    // Logic for regular game time
    if (!gameStarted) {
      ball.setX(player.x);

      if (cursors.space.isDown) {
        gameStarted = true;
        ball.setVelocityY(-300);

        openingText.setVisible(false);
      }
    }
  }
}

function hitBrick(ball, brick) {
  //hide the brick
  brick.disableBody(true, true);

  // if the x velocity of the ball is 0, give the ball some x velocity randomly
  if (ball.body.velocity.x == 0) {
    randNum = Math.random();
    if (randNum >= 0.5) {
      ball.body.setVelocityX(180);
    } else {
      ball.body.setVelocityX(-180);
    }
  }

  score += 10;
  scoreText.setText(`score: ${score}`);
  if (bricks.countActive() == 0 && currentLevel < 5) {
    currentLevel++;
    levelsText.setText(`level: ${currentLevel}`);
    putBallOnPaddle();
    loadBricks(bricks, currentLevel);
  }
}

function hitPlayer(ball, player) {
  // Increase the velocity of the ball after it bounces
  ball.setVelocityY(ball.body.velocity.y - 25);

  let newXVelocity =
    Math.abs(ball.body.velocity.x + player.body.velocity.x / 10) + 25;

  // If the ball is to the left of the player, ensure the X Velocity is negative
  if (ball.x < player.x) {
    ball.setVelocityX(-newXVelocity);
  } else {
    ball.setVelocityX(newXVelocity);
  }
}

function isWon() {
  return bricks.countActive() == 0;
}

function putBallOnPaddle() {
  ball.setPosition(400, 565);
  player.setPosition(400, 600);

  ball.body.setVelocityX(0);
  ball.body.setVelocityY(0);

  gameStarted = false;
}

function loadBricks(group, level) {
  let rows;
  let columns;
  let data;
  let x = "x";
  let o = "o";

  if (level == 1) {
    data = [[x, x, x, x, x, x, x, x, x, x]];
  } else if (level == 2) {
    data = [
      [x, x, x, x, x, x, x, x, x, x],
      [x, o, o, o, o, o, o, o, o, x],
      [x, x, x, x, x, x, x, x, x, x],
    ];
  } else if (level == 3) {
    data = [
      [o, o, x, x, x, x, x, x, o, o],
      [x, x, x, x, x, x, x, x, x, x],
      [o, x, x, x, x, x, x, x, x, o],
    ];
  } else if (level == 4) {
    data = [
      [x, o, x, o, x, o, x, o, x, o],
      [o, x, o, x, o, x, o, x, o, x],
      [x, o, x, o, x, o, x, o, x, o],
      [o, x, o, x, o, x, o, x, o, x],
    ];
  } else {
    data = [
      [x, x, x, x, x, x, x, x, x, x],
      [x, x, x, o, o, o, o, x, x, x],
      [x, o, x, o, o, o, o, x, o, x],
      [x, o, o, o, x, x, o, o, o, x],
      [x, x, x, x, x, x, x, x, x, x],
    ];
  }
  rows = data.length;
  columns = data[0].length;
  let stepX = 70;
  let stepY = 40;
  let xOffset = 80;
  let yOffset = 140;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      if (data[i][j] == x) {
        group
          .create(xOffset + j * stepX, yOffset + i * stepY, `brick${i + 1}`)
          .setImmovable();
      }
    }
  }
}
