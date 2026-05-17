const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreCountEl = document.getElementById('scoreCount');
const bestCountEl = document.getElementById('bestCount');
const statusTextEl = document.getElementById('statusText');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const playPauseBtn = document.getElementById('playPauseBtn');
const restartBtn = document.getElementById('restartBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const GRID_SIZE = 24;
const CELL_SIZE = 24;

let bestScore = 0;
let running = true;
let stepsPerSecond = Number(speedRange.value);
let accumulator = 0;
let lastTimestamp = 0;
let gameOver = false;

let boardCols = GRID_SIZE;
let boardRows = GRID_SIZE;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const maxWidth = rect.width;
    const maxHeight = rect.height;
    boardCols = Math.max(12, Math.floor(maxWidth / CELL_SIZE));
    boardRows = Math.max(12, Math.floor(maxHeight / CELL_SIZE));

    canvas.width = Math.floor(boardCols * CELL_SIZE * window.devicePixelRatio);
    canvas.height = Math.floor(boardRows * CELL_SIZE * window.devicePixelRatio);
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    if (!snake.length) {
        resetGame();
    } else {
        snake = snake.filter(segment => segment.x < boardCols && segment.y < boardRows);
        if (!snake.length) resetGame();
        spawnFood();
        draw();
    }
}

function resetGame() {
    const startX = Math.floor(boardCols / 2);
    const startY = Math.floor(boardRows / 2);
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    running = true;
    playPauseBtn.textContent = 'Pause';
    statusTextEl.textContent = 'Playing';
    spawnFood();
    updateHud();
    draw();
}

function updateHud() {
    scoreCountEl.textContent = String(score);
    bestCountEl.textContent = String(bestScore);
}

function setStatus(text) {
    statusTextEl.textContent = text;
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
    } while (occupied.has(`${food.x},${food.y}`) && attempts < 500);
}

function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
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
    playPauseBtn.textContent = 'Resume';
    setStatus('Game Over');
    bestScore = Math.max(bestScore, score);
    updateHud();
    draw();
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
}

function draw() {
    const width = boardCols * CELL_SIZE;
    const height = boardRows * CELL_SIZE;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= boardCols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE + 0.5, 0);
        ctx.lineTo(x * CELL_SIZE + 0.5, height);
        ctx.stroke();
    }
    for (let y = 0; y <= boardRows; y++) {
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
        ctx.font = '700 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', width / 2, height / 2 - 8);
        ctx.font = '500 16px system-ui, sans-serif';
        ctx.fillText('Press Restart to play again', width / 2, height / 2 + 22);
    }
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
restartBtn.addEventListener('click', () => {
    resetGame();
});

upBtn.addEventListener('click', () => setDirection({ x: 0, y: -1 }));
downBtn.addEventListener('click', () => setDirection({ x: 0, y: 1 }));
leftBtn.addEventListener('click', () => setDirection({ x: -1, y: 0 }));
rightBtn.addEventListener('click', () => setDirection({ x: 1, y: 0 }));

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
resizeCanvas();
resetGame();
requestAnimationFrame(tick);
