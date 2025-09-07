const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_RADIUS = 10;
const PADDLE_MARGIN = 16;
const PLAYER_COLOR = '#00eaff';
const AI_COLOR = '#ff3070';
const BALL_COLOR = '#fff';
const NET_COLOR = '#444';
const FPS = 60;

// Paddle objects
const player = {
    x: PADDLE_MARGIN,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PLAYER_COLOR,
    dy: 0
};

const ai = {
    x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: AI_COLOR,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_RADIUS,
    speed: 6,
    dx: 6,
    dy: 3
};

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    const segmentHeight = 20;
    for (let i = 0; i < canvas.height; i += segmentHeight * 2) {
        drawRect(canvas.width / 2 - 2, i, 4, segmentHeight, NET_COLOR);
    }
}

function draw() {
    // Clear play area
    drawRect(0, 0, canvas.width, canvas.height, '#111');
    drawNet();
    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, BALL_COLOR);
}

// Update functions
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom wall collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy *= -1;
    }

    // Left paddle collision
    if (ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {
        ball.x = player.x + player.width + ball.radius; // Prevent sticking
        ball.dx *= -1;
        // Add "spin"
        let collidePoint = (ball.y - (player.y + player.height / 2));
        collidePoint = collidePoint / (player.height / 2);
        let angle = collidePoint * Math.PI / 4;
        ball.dy = ball.speed * Math.sin(angle);
    }

    // Right paddle collision (AI)
    if (ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height) {
        ball.x = ai.x - ball.radius; // Prevent sticking
        ball.dx *= -1;
        // Add "spin"
        let collidePoint = (ball.y - (ai.y + ai.height / 2));
        collidePoint = collidePoint / (ai.height / 2);
        let angle = collidePoint * Math.PI / 4;
        ball.dy = ball.speed * Math.sin(angle);
    }

    // Score reset (ball out of bounds)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Randomize direction
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    // Randomize vertical
    ball.dy = ball.speed * (Math.random() * 2 - 1) * 0.6;
}

// Mouse control
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const mouseY = (evt.clientY - rect.top) * scaleY;
    // Center paddle on mouse Y, keep inside bounds
    player.y = Math.max(
        0,
        Math.min(canvas.height - player.height, mouseY - player.height / 2)
    );
});

// AI movement
function moveAI() {
    // Basic AI: paddle centers on ball, with slight delay
    const target = ball.y - ai.height / 2;
    const diff = target - ai.y;
    // AI speed (lower for easier, higher for harder)
    const aiSpeed = 4;
    if (Math.abs(diff) > aiSpeed) {
        ai.y += aiSpeed * Math.sign(diff);
    } else {
        ai.y = target;
    }
    // Keep AI paddle inside bounds
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));
}

function gameLoop() {
    moveBall();
    moveAI();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();
