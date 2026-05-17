const canvas = document.getElementById('lifeCanvas');
const ctx = canvas.getContext('2d');
const generationCountEl = document.getElementById('generationCount');
const aliveCountEl = document.getElementById('aliveCount');
const speedRange = document.getElementById('speedRange');
const zoomRange = document.getElementById('zoomRange');
const speedValue = document.getElementById('speedValue');
const zoomValue = document.getElementById('zoomValue');
const playPauseBtn = document.getElementById('playPauseBtn');
const stepBtn = document.getElementById('stepBtn');
const clearBtn = document.getElementById('clearBtn');
const randomBtn = document.getElementById('randomBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

let cellSize = Number(zoomRange.value);
let targetGenerationsPerSecond = Number(speedRange.value);
let running = true;
let generation = 0;
let board = [];
let cols = 0;
let rows = 0;
let accumulator = 0;
let lastTimestamp = 0;
let isPointerDown = false;
let lastPainted = null;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * window.devicePixelRatio);
    canvas.height = Math.floor(rect.height * window.devicePixelRatio);
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    rebuildBoard();
}

function rebuildBoard(preserve = true) {
    const rect = canvas.getBoundingClientRect();
    cols = Math.max(1, Math.floor(rect.width / cellSize));
    rows = Math.max(1, Math.floor(rect.height / cellSize));

    const next = Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => preserve && board[y] && typeof board[y][x] !== 'undefined' ? board[y][x] : 0)
    );

    board = next;
    draw();
    updateCounts();
}

function createEmptyBoard() {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function randomizeBoard() {
    board = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() > 0.78 ? 1 : 0))
    );
    generation = 0;
    updateCounts();
    draw();
}

function clearBoard() {
    board = createEmptyBoard();
    generation = 0;
    updateCounts();
    draw();
}

function countAlive() {
    let alive = 0;
    for (const row of board) {
        for (const cell of row) alive += cell;
    }
    return alive;
}

function updateCounts() {
    generationCountEl.textContent = String(generation);
    aliveCountEl.textContent = String(countAlive());
}

function stepBoard() {
    const next = createEmptyBoard();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ny = (y + dy + rows) % rows;
                    const nx = (x + dx + cols) % cols;
                    neighbors += board[ny][nx];
                }
            }

            const alive = board[y][x] === 1;
            next[y][x] = alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : (neighbors === 3 ? 1 : 0);
        }
    }

    board = next;
    generation += 1;

    if (generation >= 1000) {
        running = false;
        playPauseBtn.textContent = 'Restart';
        setTimeout(() => {
            clearBoard();
            running = true;
            playPauseBtn.textContent = 'Pause';
        }, 700);
    }

    updateCounts();
    draw();
}

function drawGrid() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x]) {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
            }
        }
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize + 0.5, 0);
        ctx.lineTo(x * cellSize + 0.5, rows * cellSize);
        ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize + 0.5);
        ctx.lineTo(cols * cellSize, y * cellSize + 0.5);
        ctx.stroke();
    }
}

function draw() {
    drawGrid();
}

function getCellFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    return { x, y };
}

function toggleCell(x, y, value = null) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return;
    const nextValue = value === null ? (board[y][x] ? 0 : 1) : value;
    board[y][x] = nextValue;
    draw();
    updateCounts();
}

canvas.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = getCellFromEvent(event);
    lastPainted = `${x},${y}`;
    toggleCell(x, y);
});

canvas.addEventListener('pointermove', (event) => {
    if (!isPointerDown) return;
    const { x, y } = getCellFromEvent(event);
    const key = `${x},${y}`;
    if (key === lastPainted) return;
    lastPainted = key;
    toggleCell(x, y, 1);
});

canvas.addEventListener('pointerup', () => {
    isPointerDown = false;
    lastPainted = null;
});

canvas.addEventListener('pointercancel', () => {
    isPointerDown = false;
    lastPainted = null;
});

speedRange.addEventListener('input', () => {
    targetGenerationsPerSecond = Number(speedRange.value);
    speedValue.textContent = `${targetGenerationsPerSecond} gen/s`;
});

zoomRange.addEventListener('input', () => {
    cellSize = Number(zoomRange.value);
    zoomValue.textContent = `${cellSize} px/cell`;
    rebuildBoard(true);
});

zoomInBtn.addEventListener('click', () => {
    const next = Math.min(Number(zoomRange.max), Number(zoomRange.value) + 2);
    zoomRange.value = String(next);
    zoomRange.dispatchEvent(new Event('input'));
});

zoomOutBtn.addEventListener('click', () => {
    const next = Math.max(Number(zoomRange.min), Number(zoomRange.value) - 2);
    zoomRange.value = String(next);
    zoomRange.dispatchEvent(new Event('input'));
});

playPauseBtn.addEventListener('click', () => {
    running = !running;
    playPauseBtn.textContent = running ? 'Pause' : 'Resume';
});

stepBtn.addEventListener('click', () => {
    if (!running) {
        stepBoard();
    }
});

clearBtn.addEventListener('click', () => {
    clearBoard();
});

randomBtn.addEventListener('click', () => {
    randomizeBoard();
});

window.addEventListener('resize', () => {
    resizeCanvas();
});

function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (running) {
        accumulator += delta * targetGenerationsPerSecond;
        while (accumulator >= 1) {
            stepBoard();
            accumulator -= 1;
            if (!running) break;
        }
    }

    requestAnimationFrame(tick);
}

speedValue.textContent = `${targetGenerationsPerSecond} gen/s`;
zoomValue.textContent = `${cellSize} px/cell`;
resizeCanvas();
randomizeBoard();
requestAnimationFrame(tick);
