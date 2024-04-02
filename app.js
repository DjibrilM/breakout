//canavs element configuration
let canavs;
let CanvasWidth = 1000;
let canvasHeight = 600;
let ctx;
let showStartMessage = true;

const playerHeigh = 10;
const playerWidth = 100;
let playerVelocityX = 20;

let player = {
  x: (CanvasWidth - playerWidth) / 2,
  y: canvasHeight - playerHeigh - 5,
  width: playerWidth,
  height: playerHeigh,
  velocityX: playerVelocityX,
};

let ballWidth = 8;
let ballHieght = 10;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
  x: CanvasWidth / 2,
  y: canvasHeight / 2,
  width: ballWidth,
  height: ballHieght,
  velocityX: ballVelocityX,
  velocityY: ballVelocityY,
};

let gameScore = 0;
let gameOver = false;

let blocks = [];
const blockWidh = 50;
const blockHeight = 10;
let blockColumns = 16;
let blockRows = 7;
let maxRows = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

function createBlocksList() {
  blocks = [];
  for (let c = 0; c < blockColumns; c++) {
    for (let r = 0; r < blockRows; r++) {
      let block = {
        width: blockWidh,
        height: blockHeight,
        x: blockX + c * blockWidh + c * 10,
        y: blockY + r * blockHeight + r * 10,
        break: false,
      };

      blocks.push(block);
    }
  }
  blockCount = blocks.length;
}

//load canavs
window.addEventListener("load", () => {
  canavs = document.querySelector("canvas");
  canavs.height = canvasHeight;
  canavs.width = CanvasWidth;
  ctx = canavs.getContext("2d");

  document.addEventListener("keydown", movePlayer);
  requestAnimationFrame(update);
  createBlocksList(); //create blocks
});

function outOfCanvas(Xposition) {
  return Xposition < 0 || Xposition + player.width > CanvasWidth;
}

function movePlayer(e) {
  if (e.code == "ArrowLeft") {
    let nextPlayerX = player.x - player.velocityX;

    console.log(nextPlayerX);

    if (!outOfCanvas(nextPlayerX)) {
      player.x = nextPlayerX;
    }
  } else if (e.code == "ArrowRight") {
    let nextPlayerX = player.x + player.velocityX;
    if (!outOfCanvas(nextPlayerX)) {
      player.x = nextPlayerX;
    }
  } else if (e.code === "Space" && gameOver === true) {
    gameOver = false;
    ball.x = CanvasWidth / 4;
    ball.y = canvasHeight / 3
    gameScore = 0;
    blocks = [];
    createBlocksList();
    update();

  } else if (e.code === "KeyS") {
    showStartMessage = false;
  }

  console.log(e.code, 'event code');
}

function sideCollision() {
  if (ball.y <= 0) {
    ball.velocityY *= -1;
  } else if (ball.x + ball.width >= CanvasWidth) {
    ball.velocityX *= -1;
  } else if (ball.y + ball.width > canvasHeight) {
    gameOver = true;

    ctx.fillStyle = "#047aed";
    ctx.beginPath();
    ctx.font = '20px sans-serif';
    ctx.fillText('Game over press space to restart(:', (CanvasWidth / 2) - 100, canvasHeight / 2)
    ctx.closePath();
  } else if (ball.x - ball.width < 0) {
    ball.velocityX *= -1;
  }
}

function detectCollisionBetweenTwoRect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function topCollision(ball, block) {
  return (
    detectCollisionBetweenTwoRect(ball, block) &&
    ball.y + ball.height >= block.y
  );
}

function bottomCollision(ball, block) {
  return (
    detectCollisionBetweenTwoRect(ball, block) &&
    block.y + block.height > ball.y
  );
}

function leftCollision(ball, block) {
  return (
    detectCollisionBetweenTwoRect(ball, block) && ball.x + ball.width >= block.x
  );
}

function rightCollision(ball, block) {
  return (
    detectCollisionBetweenTwoRect(ball, block) &&
    block.x + block.width >= ball.x
  );
}

function update() {
  if (gameOver) return;

  requestAnimationFrame(update);
  ctx.clearRect(0, 0, canavs.width, canavs.height);

  drawPlayer();
  !showStartMessage && drawBall();
  sideCollision();

  if (topCollision(ball, player) || bottomCollision(ball, player)) {
    // detect collision between ball and player paddle
    ball.velocityY *= -1;
  }

  if (leftCollision(ball, player) || rightCollision(ball, player)) {
    ball.velocityX *= -1;
  }

  //draw brocks
  drawBlocks();
  //update game score 
  drawScore();

  //go to next level 
  nextLevel();

  //draw the start game message 
  showStartMessage && drawStartMessage();
}

function nextLevel() {
  if (blockCount === 0) {
    blockRows = Math.min(blockRows + 1, maxRows);
    createBlocksList();
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.fillStyle = "#39345a";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fill();
  ctx.closePath();
}

function drawBall() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  ctx.fillStyle = "#1e87d2";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.width, 0, Math.PI * 2, true);
  ctx.fill();
}

function drawBlocks() {
  blocks.forEach((block) => {
    if (!block.break) {


      if (topCollision(ball, block) || bottomCollision(ball, block)) {
        block.break = true;
        ball.velocityY *= -1;
        blockCount -= 1
        gameScore += 100;
      } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
        block.break = true;
        ball.velocityX *= -1;
        blockCount -= 1
        gameScore += 100;
      }

      ctx.beginPath();
      ctx.fillStyle = "#6a5acd";
      ctx.fillRect(block.x, block.y, block.width, block.height);
      ctx.fill();
      ctx.closePath();
    }
  });
}


function drawScore() {
  ctx.font = '20px sans-serif';
  ctx.fillText(gameScore, 20, 25);
}

function drawStartMessage() {
  ctx.font = '20px sans-serif';
  ctx.fillText("Press 'S' to ttart the tame", (CanvasWidth / 2) - 100, (canvasHeight / 2) - 100 + 50,);
  ctx.fillStyle = '#6a5acd';
}