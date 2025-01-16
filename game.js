// Set Powerups and Particles to Empty array
var powerUps = [];
var particles = [];
// Set Powerup Types
var powerUpTypes = ["speed", "size", "slow"];
// Set Ball Colours and Default to 0
var ballColors = ["yellow", "red", "blue", "purple", "orange"];
var currentBallColor = 0;
// Pasuemenu to false
var isPaused = false;
// Start Game State to Start 
var gameState = "start";
// Set Ball speed and Paddle speed 
var ballSpeed = 5;
var paddleSpeed = 8;
// Set PLayer Scores to 0
var player1Score = 0;
var player2Score = 0;
// Start Button var
var startButton;
// Set Combo variables to 0
var comboCount = 0;
var comboTimer = 0; 
var maxCombo = 0;
var hasHitWall = false;
// Set Special Abilites to false and cooldown to 300 MiliSeconds 
var specialAbilities = {
    player1Special: false,
    player2Special: false,
    cooldown: 300
};
// Setting Power up colours and sound effects for Power ups
var powerUpEffects = {
    speed: { color: "red", symbol: "⚡", sound: "sound://category_digital/power_up_1.mp3" },
    size: { color: "green", symbol: "↔", sound: "sound://category_digital/power_up_2.mp3" },
    slow: { color: "blue", symbol: "⏱", sound: "sound://category_digital/power_up_3.mp3" }
};
// Sound Effects for hit and score
var soundEffects = {
    hit: "sound://category_app/app_button_1.mp3",
    score: "sound://category_points/positive_bonus_points_1.mp3",
    combo: "sound://category_achievements/vibrant_game_bonus_found_1.mp3",
    special: "sound://category_achievements/vibrant_game_game_gold_tresure_chest_open.mp3"
};
// Function to Create a Button with functionalities 
function createButton(x, y, width, height, buttonText, color) {
    var button = createSprite(x, y, width, height);
    button.shapeColor = color;
    button.buttonText = buttonText;
    button.visible = true;
    button.active = true;
    
    button.hide = function() {
        this.visible = false;
        this.active = false;
    };
    
    button.show = function() {
        this.visible = true;
        this.active = true;
    };
    
    button.isClicked = function() {
        return this.active && this.visible && mousePressedOver(this);
    };
    
    return button;
}

// Function to Setup the Game to start
function setup() {
  createCanvas(400, 400);
  console.log("Game initialized");
  
  background = createSprite(200, 200);
  background.setAnimation("ground");
  background.rotation = 90;
  background.depth = -1;
  
  courtLine = createSprite(200, 200, 400, 2);
  courtLine.shapeColor = "white";
  courtLine.depth = 0;
  
  ball = createSprite(200, 200, 10, 10);
  ball.shapeColor = "yellow";
  ball.velocityY = 0;
  ball.velocityX = 0;
  ball.depth = 1;
  
  player1 = createSprite(200, 380, 60, 10);
  player1.shapeColor = "white";
  player1.depth = 1;
  
  player2 = createSprite(200, 20, 60, 10);
  player2.shapeColor = "white";
  player2.depth = 1;
  
  startButton = createButton(200, 200, 120, 40, "Start Game", "Black");
  startButton.depth = 2;
  
  setupPowerUps();
}


// Start game Function to hide buttons and set game state to play
function startGame() {
    console.log("Game started");
    gameState = "play";
    startButton.hide();
    ball.velocityY = ballSpeed;
    ball.velocityX = random(-ballSpeed, ballSpeed);
}
// Function to Hide buttons according to game state and calling other functions 
// According to game states
function draw() {
    if (gameState === "play" && !isPaused) {
        handlePlayerMovement();
        handleCollisions();
        handleScoring();
        handleSpecialAbilities();
        updateCombo();
        enhancedDraw();
    }
    
    drawSprites();
    
    if (startButton.visible) {
        fill("white");
        textAlign(CENTER);
        textSize(20);
        text(startButton.buttonText, startButton.x, startButton.y + 5);
    }
    
    if (gameState === "start" && startButton.isClicked()) {
        startGame();
        startButton.hide();
    }
    
    displayScores();
    handlePause();
}

// Function to listen to key press during game
function handlePlayerMovement() {
  if (keyDown("A") && player1.x > 30) player1.x -= paddleSpeed;
  if (keyDown("D") && player1.x < 370) player1.x += paddleSpeed;
  if (keyDown("LEFT_ARROW") && player2.x > 30) player2.x -= paddleSpeed;
  if (keyDown("RIGHT_ARROW") && player2.x < 370) player2.x += paddleSpeed;
}
// Function to handle collions with player paddles and walls to bounce off
function handleCollisions() {
    if (ball.isTouching(player1) || ball.isTouching(player2)) {
        ball.velocityY = -ball.velocityY * 1.1;
        ball.velocityX = random(-ballSpeed, ballSpeed);
        
        comboCount++;
        comboTimer = 120;
        if (comboCount > maxCombo) {
            maxCombo = comboCount;
            playSound(soundEffects.combo);
        }
    }
    
    if (ball.x <= 0 || ball.x >= 400) {
        ball.velocityX = -ball.velocityX;
        playSound(soundEffects.hit);
        hasHitWall = true;  // Track that ball hit wall
        if (ball.x <= 0) {
            ball.x = 0;
        }
        if (ball.x >= 400) {
            ball.x = 400;
        }
    }
}

// Function to calculate scores
function handleScoring() {
    if (ball.y > 400) {
        player2Score += 1;
        console.log("Player 2 scored: " + player2Score);
        playSpeech("Player 1 Scored", "female", "English");
        resetBall("bottom");
    }
    if (ball.y < 0) {
        // Award 2 points if ball hasn't hit walls
        player1Score += hasHitWall ? 1 : 2;
        console.log("Player 1 scored: " + player1Score);
        playSpeech("Player 2 Scored", "male", "English");
        resetBall("top");
    }
    hasHitWall = false; // Reset wall hit tracker after scoring
}
// Function to Display scores in game
function displayScores() {
  textSize(18);
  fill("white");
  text("P1: " + player2Score, 50, 45);
  text("P2: " + player1Score, 50, 355);
}
// Function to have a pasue menu to stop the game and countine where they left off
function handlePause() {
  if (keyWentDown("Q")) {
    isPaused = !isPaused;
    console.log("Game paused: " + isPaused);
    
    if (isPaused) {
      ball.velocityX = 0;
      ball.velocityY = 0;
    } else {
      ball.velocityY = ballSpeed;
      ball.velocityX = random(-ballSpeed, ballSpeed);
    }
  }
  if (isPaused) {
    textSize(32);
    fill("white");
    text("GAME PAUSED", 117, 199);
  }
  if (isPaused){
    textSize(32);
    fill("white");
    text("Press Q to Continue", 102, 250);
  }
}

// Function to Create Powerups during gamestate when its play
function setupPowerUps() {
  setInterval(function() {
    if (gameState === "play" && !isPaused) {
      createPowerUp();
    }
  }, 10000);
}
// Function to create powerups
function createPowerUp() {
    var powerUp = createSprite(random(100, 300), random(50, 350), 15, 15);
    powerUp.type = powerUpTypes[Math.floor(random(0, powerUpTypes.length))];
    powerUp.shapeColor = powerUpEffects[powerUp.type].color;
    powerUps.push(powerUp);  // Add this line
    return powerUp;
}

// Function to create ball particlesand another function to update them 
function createParticles(x, y) {
  for (var i = 0; i < 10; i++) {
    var particle = {
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-2, 2),
      life: 255
    };
    particles.push(particle);
  }
}
function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].x += particles[i].vx;
    particles[i].y += particles[i].vy;
    particles[i].life -= 5;
    
    fill(255, 255, 255, particles[i].life);
    ellipse(particles[i].x, particles[i].y, 4, 4);
    
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// Function to handle each powerup and apply them
function handlePowerUps() {
  for (var i = powerUps.length - 1; i >= 0; i--) {
    if (ball.isTouching(powerUps[i])) {
      applyPowerUp(powerUps[i].type);
      powerUps[i].remove();
      powerUps.splice(i, 1);
    }
  }
}
function applyPowerUp(type) {
    playSound(powerUpEffects[type].sound);
    createParticles(ball.x, ball.y);
    
    switch(type) {
        case "speed":
            ballSpeed *= 1.5;
            setTimeout(function() { ballSpeed /= 1.5; }, 5000);
            break;
        case "size":
            player1.width *= 1.5;
            player2.width *= 1.5;
            setTimeout(function() {
                player1.width /= 1.5;
                player2.width /= 1.5;
            }, 5000);
            break;
        case "slow":
            paddleSpeed /= 1.5;
            setTimeout(function() { paddleSpeed *= 1.5; }, 5000);
            break;
    }
}
// Changing Ball colours when it touches each players paddle
function enhancedDraw() {
  if (!isPaused) {
    handlePowerUps();
    updateParticles();
    
    if (ball.isTouching(player1) || ball.isTouching(player2)) {
      currentBallColor = (currentBallColor + 1) % ballColors.length;
      ball.shapeColor = ballColors[currentBallColor];
      createParticles(ball.x, ball.y);
    }
  }
}
// Resetting ball for new game with sound effect
function resetBall(direction) {
  ball.x = 200;
  ball.y = 200;
  ball.velocityX = random(-ballSpeed, ballSpeed);
  ball.velocityY = (direction === "bottom") ? ballSpeed : -ballSpeed;
  playSound("sound://category_achievements/lighthearted_bonus_objective_1.mp3");
}
// Handle Secret Special Abilites for each player
function handleSpecialAbilities() {
    if (keyWentDown("SPACE") && !specialAbilities.player1Special) {
        player1.width *= 2;
        playSound(soundEffects.special);
        createParticles(player1.x, player1.y);
        
        setTimeout(function() {
            player1.width /= 2;
        }, 3000);
        
        specialAbilities.player1Special = true;
        setTimeout(function() {
            specialAbilities.player1Special = false;
        }, specialAbilities.cooldown * 16.67); // Convert frames to milliseconds
    }
    
    if (keyWentDown("SHIFT") && !specialAbilities.player2Special) {
        player2.width *= 2;
        playSound(soundEffects.special);
        createParticles(player2.x, player2.y);
        
        setTimeout(function() {
            player2.width /= 2;
        }, 3000);
        
        specialAbilities.player2Special = true;
        setTimeout(function() {
            specialAbilities.player2Special = false;
        }, specialAbilities.cooldown * 16.67);
    }
}
// Update Combo for player
function updateCombo() {
    if (comboTimer > 0) {
        comboTimer--;
        textSize(24);
        fill("yellow");
        text("Combo: " + comboCount, 150, 200);
    } else {
        comboCount = 0;
    }
}
