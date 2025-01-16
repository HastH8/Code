#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


// OLED Display size
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64


// Initialize the display
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);


// Joystick Pins
#define JOYSTICK1_X A0
#define JOYSTICK2_X A2
#define JOYSTICK1_SW 2
#define JOYSTICK2_SW 3


// Game variables
int paddleWidth = 20, paddleHeight = 5;
int paddle1X = 54, paddle2X = 54;
int ballX = 64, ballY = 32;
int ballDX = 2, ballDY = 2;
int score1 = 0, score2 = 0;
int comboCount = 0;
bool specialAbility1 = false, specialAbility2 = false;
unsigned long lastAbilityTime1 = 0, lastAbilityTime2 = 0;


// Constants
const int ballSize = 3;
const int paddleSpeed = 3;
const unsigned long abilityCooldown = 3000; // 3 seconds


// Setup function
void setup() {
  pinMode(JOYSTICK1_SW, INPUT_PULLUP);
  pinMode(JOYSTICK2_SW, INPUT_PULLUP);


  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    while (true); // Loop forever if OLED fails
  }
  display.clearDisplay();
  display.display();


  // Initial draw
  drawGame();
}


// Main loop
void loop() {
  // Read joystick positions
  int joystick1X = analogRead(JOYSTICK1_X);
  int joystick2X = analogRead(JOYSTICK2_X);


  // Move paddles
  if (joystick1X < 400 && paddle1X > 0) paddle1X -= paddleSpeed;
  if (joystick1X > 600 && paddle1X < SCREEN_WIDTH - paddleWidth) paddle1X += paddleSpeed;


  if (joystick2X < 400 && paddle2X > 0) paddle2X -= paddleSpeed;
  if (joystick2X > 600 && paddle2X < SCREEN_WIDTH - paddleWidth) paddle2X += paddleSpeed;


  // Ball movement
  ballX += ballDX;
  ballY += ballDY;


  // Ball collisions with walls
  if (ballX <= 0 || ballX >= SCREEN_WIDTH - ballSize) ballDX = -ballDX;


  // Ball collisions with paddles
  if (ballY >= SCREEN_HEIGHT - paddleHeight && ballX >= paddle1X && ballX <= paddle1X + paddleWidth) {
    ballDY = -ballDY;
    comboCount++;
  }
  if (ballY <= paddleHeight && ballX >= paddle2X && ballX <= paddle2X + paddleWidth) {
    ballDY = -ballDY;
    comboCount++;
  }


  // Ball out of bounds
  if (ballY > SCREEN_HEIGHT) {
    score2++;
    resetBall();
  }
  if (ballY < 0) {
    score1++;
    resetBall();
  }


  // Handle special abilities
  if (digitalRead(JOYSTICK1_SW) == LOW && millis() - lastAbilityTime1 > abilityCooldown) {
    specialAbility1 = true;
    lastAbilityTime1 = millis();
  }
  if (digitalRead(JOYSTICK2_SW) == LOW && millis() - lastAbilityTime2 > abilityCooldown) {
    specialAbility2 = true;
    lastAbilityTime2 = millis();
  }


  // Reset special abilities after use
  if (specialAbility1 && millis() - lastAbilityTime1 > 3000) {
    specialAbility1 = false;
  }
  if (specialAbility2 && millis() - lastAbilityTime2 > 3000) {
    specialAbility2 = false;
  }


  // Draw the game
  drawGame();
  delay(30); // Control frame rate
}


// Reset ball position
void resetBall() {
  ballX = SCREEN_WIDTH / 2;
  ballY = SCREEN_HEIGHT / 2;
  ballDX = random(2, 4) * (random(0, 2) == 0 ? 1 : -1);
  ballDY = random(2, 4) * (random(0, 2) == 0 ? 1 : -1);
  comboCount = 0;
}


// Draw the game
void drawGame() {
  display.clearDisplay();


  // Draw paddles
  display.fillRect(paddle1X, SCREEN_HEIGHT - paddleHeight, paddleWidth, paddleHeight, SSD1306_WHITE);
  display.fillRect(paddle2X, 0, paddleWidth, paddleHeight, SSD1306_WHITE);


  // Draw ball
  display.fillRect(ballX, ballY, ballSize, ballSize, SSD1306_WHITE);


  // Draw scores
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print("P2: ");
  display.print(score2);
  display.setCursor(0, SCREEN_HEIGHT - 8);
  display.print("P1: ");
  display.print(score1);


  // Draw combo count
  if (comboCount > 0) {
    display.setCursor(SCREEN_WIDTH / 2 - 20, SCREEN_HEIGHT / 2);
    display.print("Combo: ");
    display.print(comboCount);
  }


  display.display();
}


gamwe
