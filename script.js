const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreCountEl = document.getElementById('scoreCount');
const bestCountEl = document.getElementById('bestCount');
const statusTextEl = document.getElementById('statusText');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const playPauseBtn = document.getElementById('playPauseBtn');
const restartBtn = document.getElementById('restartBtn');

const CELL_SIZE = 24;
const MIN_BOARD_SIZE = 12;

let bestScore = 0;
let running = true;
let stepsPerSecond = Number(speedRange.value);
let accumulator = 0;
let lastTimestamp = 0;
let gameOver = false;
let initialized = false;

let boardCols = MIN_BOARD_SIZE;
let boardRows = MIN_BOARD_SIZE;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;

function updateHud() {
    scoreCountEl.textContent = String(score);
    bestCountEl.textContent = String(bestScore);
}

function setStatus(text) {
    statusTextEl.textContent = text;
}

function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
}

function spawnFood() {
    const occupied = new Set(snake.map(segment => `${segment.x},${segment.y}`));
    let attempts = 0;

    do {
        food = {
            x: Math.floor(Math.random() * boardCols),
            y: Math.floor(Math.random() * boardRows),
        };
        attempts += 1;
    } while (occupied.has(`${food.x},${food.y}`) && attempts < 1000);
}

function draw() {
    const width = boardCols * CELL_SIZE;
    const height = boardRows * CELL_SIZE;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= boardCols; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE + 0.5, 0);
        ctx.lineTo(x * CELL_SIZE + 0.5, height);
        ctx.stroke();
    }

    for (let y = 0; y <= boardRows; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE + 0.5);
        ctx.lineTo(width, y * CELL_SIZE + 0.5);
        ctx.stroke();
    }

    drawCell(food.x, food.y, '#ef4444');

    snake.forEach((segment, index) => {
        drawCell(segment.x, segment.y, index === 0 ? '#0f172a' : '#334155');
    });

    if (gameOver) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '700 28px system-ui, sans-serif';
        ctx.fillText('Game Over', width / 2, height / 2 - 8);
        ctx.font = '500 16px system-ui, sans-serif';
        ctx.fillText('Press Restart to play again', width / 2, height / 2 + 22);
    }
}

function resetGame() {
    const startX = Math.floor(boardCols / 2);
    const startY = Math.floor(boardRows / 2);

    snake = [
        { x: startX, y: startY },
        { x: Math.max(0, startX - 1), y: startY },
        { x: Math.max(0, startX - 2), y: startY },
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    running = true;
    accumulator = 0;

    playPauseBtn.textContent = 'Pause';
    setStatus('Playing');
    spawnFood();
    updateHud();
    draw();
}

function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    if (rect.width === 0 || rect.height === 0) {
        return false;
    }

    boardCols = Math.max(MIN_BOARD_SIZE, Math.floor(rect.width / CELL_SIZE));
    boardRows = Math.max(MIN_BOARD_SIZE, Math.floor(rect.height / CELL_SIZE));

    const displayWidth = boardCols * CELL_SIZE;
    const displayHeight = boardRows * CELL_SIZE;

    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return true;
}

function resizeCanvas() {
    const wasGameOver = gameOver;
    const wasRunning = running;
    const hadSnake = snake.length > 0;

    if (!setCanvasSize()) return;

    if (!initialized || !hadSnake) {
        initialized = true;
        resetGame();
        return;
    }

    snake = snake.filter(segment => segment.x >= 0 && segment.y >= 0 && segment.x < boardCols && segment.y < boardRows);

    if (!snake.length) {
        resetGame();
        return;
    }

    spawnFood();
    draw();

    if (wasGameOver) {
        gameOver = true;
        running = false;
        playPauseBtn.textContent = 'Resume';
        setStatus('Game Over');
        draw();
        return;
    }

    running = wasRunning;
    playPauseBtn.textContent = running ? 'Pause' : 'Resume';
    setStatus(running ? 'Playing' : 'Paused');
}

function setDirection(newDirection) {
    if (gameOver) return;
    if (isOpposite(newDirection, direction)) return;
    nextDirection = newDirection;
}

function stepGame() {
    if (gameOver) return;

    direction = nextDirection;
    const head = snake[0];
    const nextHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
    };

    if (nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= boardCols || nextHead.y >= boardRows) {
        endGame();
        return;
    }

    const willEat = nextHead.x === food.x && nextHead.y === food.y;
    const bodyToCheck = willEat ? snake : snake.slice(0, -1);

    if (bodyToCheck.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)) {
        endGame();
        return;
    }

    snake.unshift(nextHead);

    if (willEat) {
        score += 1;
        bestScore = Math.max(bestScore, score);
        spawnFood();
        updateHud();
    } else {
        snake.pop();
    }

    draw();
}

function endGame() {
    gameOver = true;
    running = false;
    bestScore = Math.max(bestScore, score);
    playPauseBtn.textContent = 'Resume';
    setStatus('Game Over');
    updateHud();
    draw();
}

function togglePause() {
    if (gameOver) {
        resetGame();
        return;
    }

    running = !running;
    playPauseBtn.textContent = running ? 'Pause' : 'Resume';
    setStatus(running ? 'Playing' : 'Paused');
}

speedRange.addEventListener('input', () => {
    stepsPerSecond = Number(speedRange.value);
    speedValue.textContent = `${stepsPerSecond} steps/s`;
});

playPauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', resetGame);

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (key === ' ' || key === 'spacebar') {
        event.preventDefault();
        togglePause();
        return;
    }

    if (key === 'arrowup' || key === 'w') setDirection({ x: 0, y: -1 });
    if (key === 'arrowdown' || key === 's') setDirection({ x: 0, y: 1 });
    if (key === 'arrowleft' || key === 'a') setDirection({ x: -1, y: 0 });
    if (key === 'arrowright' || key === 'd') setDirection({ x: 1, y: 0 });
});

window.addEventListener('resize', resizeCanvas);

function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (running && !gameOver) {
        accumulator += delta * stepsPerSecond;

        while (accumulator >= 1) {
            stepGame();
            accumulator -= 1;
            if (!running || gameOver) break;
        }
    }

    requestAnimationFrame(tick);
}

speedValue.textContent = `${stepsPerSecond} steps/s`;

window.addEventListener('load', () => {
    resizeCanvas();
    if (!initialized) {
        initialized = true;
        resetGame();
    }
    requestAnimationFrame(tick);
});
