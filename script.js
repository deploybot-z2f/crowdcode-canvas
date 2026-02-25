class GameHub {
    constructor() {
        this.mainMenu = document.getElementById('main-menu');
        this.snakeGame = document.getElementById('snake-game');
        this.brickGame = document.getElementById('brickbreaker-game');
        this.pongGame = document.getElementById('pong-game');
        this.backBtn = document.getElementById('back-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.brickBackBtn = document.getElementById('brick-back-btn');
        this.brickMenuBtn = document.getElementById('brick-menu-btn');
        this.pongBackBtn = document.getElementById('pong-back-btn');
        this.pongMenuBtn = document.getElementById('pong-menu-btn');
        
        this.setupMenuListeners();
        this.currentGame = null;
    }
    
    setupMenuListeners() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameName = card.dataset.game;
                this.loadGame(gameName);
            });
        });
        
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.returnToMenu());
        }
        
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => this.returnToMenu());
        }

        if (this.brickBackBtn) {
            this.brickBackBtn.addEventListener('click', () => this.returnToMenu());
        }
        
        if (this.brickMenuBtn) {
            this.brickMenuBtn.addEventListener('click', () => this.returnToMenu());
        }

        if (this.pongBackBtn) {
            this.pongBackBtn.addEventListener('click', () => this.returnToMenu());
        }
        
        if (this.pongMenuBtn) {
            this.pongMenuBtn.addEventListener('click', () => this.returnToMenu());
        }
    }
    
    loadGame(gameName) {
        if (gameName === 'snake') {
            this.mainMenu.classList.add('hidden');
            this.snakeGame.classList.remove('hidden');
            
            if (!this.snakeGameInstance) {
                this.snakeGameInstance = new SnakeGame();
            } else {
                this.snakeGameInstance.restart();
            }
            this.currentGame = this.snakeGameInstance;
        } else if (gameName === 'brickbreaker') {
            this.mainMenu.classList.add('hidden');
            this.brickGame.classList.remove('hidden');
            
            if (!this.brickGameInstance) {
                this.brickGameInstance = new BrickBreakerGame();
            } else {
                this.brickGameInstance.restart();
            }
            this.currentGame = this.brickGameInstance;
        } else if (gameName === 'pong') {
            this.mainMenu.classList.add('hidden');
            this.pongGame.classList.remove('hidden');
            
            if (!this.pongGameInstance) {
                this.pongGameInstance = new PongGame();
            } else {
                this.pongGameInstance.restart();
            }
            this.currentGame = this.pongGameInstance;
        }
    }
    
    returnToMenu() {
        this.snakeGame.classList.add('hidden');
        this.brickGame.classList.add('hidden');
        this.pongGame.classList.add('hidden');
        this.mainMenu.classList.remove('hidden');
        
        if (this.currentGame) {
            this.currentGame.pause();
        }
    }
}

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.highScoreElement.textContent = this.highScore;
        
        this.restartBtn.addEventListener('click', () => this.restart());
        this.keyPressHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyPressHandler);
        
        this.initTouchControls();
        
        this.resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
        
        this.paused = false;
        
        this.initCanvasSize();
        this.init();
        this.startGameLoop();
    }
    
    initCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const isMobile = window.innerWidth <= 768;
        this.gridSize = isMobile ? 15 : 20;
        
        this.cols = Math.floor(this.canvas.width / this.gridSize);
        this.rows = Math.floor(this.canvas.height / this.gridSize);
    }
    
    handleResize() {
        const oldCols = this.cols;
        const oldRows = this.rows;
        
        this.initCanvasSize();
        
        if (oldCols !== this.cols || oldRows !== this.rows) {
            this.restart();
        }
    }
    
    initTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const minSwipeDistance = 30;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY, minSwipeDistance);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    handleSwipe(startX, startY, endX, endY, minDistance) {
        if (!this.gameStarted) {
            this.gameStarted = true;
        }
        
        if (this.gameOver || this.paused) return;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        if (Math.abs(deltaX) < minDistance && Math.abs(deltaY) < minDistance) {
            return;
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0 && this.direction.x === 0) {
                this.nextDirection = { x: 1, y: 0 };
            } else if (deltaX < 0 && this.direction.x === 0) {
                this.nextDirection = { x: -1, y: 0 };
            }
        } else {
            if (deltaY > 0 && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: 1 };
            } else if (deltaY < 0 && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: -1 };
            }
        }
    }
    
    init() {
        const startX = Math.floor(this.cols / 2);
        const startY = Math.floor(this.rows / 2);
        
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        const aiStartX = Math.floor(this.cols / 4);
        const aiStartY = Math.floor(this.rows / 4);
        
        this.aiSnake = [
            { x: aiStartX, y: aiStartY },
            { x: aiStartX - 1, y: aiStartY },
            { x: aiStartX - 2, y: aiStartY }
        ];
        
        this.aiDirection = { x: 1, y: 0 };
        this.aiAlive = true;
        this.aiRespawnTimer = 0;
        this.aiRespawnDelay = 3000;
        
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        
        this.updateScore();
        this.gameOverScreen.classList.add('hidden');
        
        this.lastUpdateTime = 0;
        this.lastAiUpdateTime = 0;
        this.gameSpeed = 100;
        this.aiSpeed = 120;
        
        this.draw();
    }
    
    generateFood() {
        let food;
        let validPosition = false;
        
        while (!validPosition) {
            food = {
                x: Math.floor(Math.random() * (this.cols - 2)) + 1,
                y: Math.floor(Math.random() * (this.rows - 2)) + 1
            };
            
            const onPlayerSnake = this.snake.some(segment => 
                segment.x === food.x && segment.y === food.y
            );
            
            const onAiSnake = this.aiAlive && this.aiSnake.some(segment => 
                segment.x === food.x && segment.y === food.y
            );
            
            validPosition = !onPlayerSnake && !onAiSnake;
        }
        
        return food;
    }
    
    handleKeyPress(e) {
        if (!this.gameStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.gameStarted = true;
        }
        
        if (this.gameOver || this.paused) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                e.preventDefault();
                break;
        }
    }
    
    updateAI() {
        if (!this.aiAlive || !this.gameStarted || this.paused) return;
        
        const head = this.aiSnake[0];
        
        const possibleMoves = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];
        
        const validMoves = possibleMoves.filter(move => {
            if (move.x === -this.aiDirection.x && move.y === -this.aiDirection.y) {
                return false;
            }
            
            const newHead = {
                x: head.x + move.x,
                y: head.y + move.y
            };
            
            if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
                return false;
            }
            
            if (this.aiSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                return false;
            }
            
            return true;
        });
        
        if (validMoves.length === 0) {
            this.killAI();
            return;
        }
        
        const dx = this.food.x - head.x;
        const dy = this.food.y - head.y;
        
        let bestMove = validMoves[0];
        let bestScore = -Infinity;
        
        validMoves.forEach(move => {
            const newHead = {
                x: head.x + move.x,
                y: head.y + move.y
            };
            
            const newDx = this.food.x - newHead.x;
            const newDy = this.food.y - newHead.y;
            const distToFood = Math.abs(newDx) + Math.abs(newDy);
            
            const onPlayer = this.snake.some(segment => 
                segment.x === newHead.x && segment.y === newHead.y
            );
            
            let score = -distToFood;
            
            if (onPlayer) {
                score -= 1000;
            }
            
            const dangerCount = this.countDangerousNeighbors(newHead);
            score -= dangerCount * 50;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
        
        this.aiDirection = bestMove;
        
        const newHead = {
            x: head.x + this.aiDirection.x,
            y: head.y + this.aiDirection.y
        };
        
        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.killAI();
            return;
        }
        
        this.aiSnake.unshift(newHead);
        
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.food = this.generateFood();
        } else {
            this.aiSnake.pop();
        }
    }
    
    countDangerousNeighbors(pos) {
        let count = 0;
        const neighbors = [
            { x: pos.x - 1, y: pos.y },
            { x: pos.x + 1, y: pos.y },
            { x: pos.x, y: pos.y - 1 },
            { x: pos.x, y: pos.y + 1 }
        ];
        
        neighbors.forEach(n => {
            if (n.x < 0 || n.x >= this.cols || n.y < 0 || n.y >= this.rows) {
                count++;
            } else if (this.aiSnake.some(s => s.x === n.x && s.y === n.y)) {
                count++;
            } else if (this.snake.some(s => s.x === n.x && s.y === n.y)) {
                count++;
            }
        });
        
        return count;
    }
    
    killAI() {
        this.aiAlive = false;
        this.aiRespawnTimer = Date.now();
    }
    
    respawnAI() {
        let attempts = 0;
        let validSpawn = false;
        let aiStartX, aiStartY;
        
        while (!validSpawn && attempts < 100) {
            aiStartX = Math.floor(Math.random() * (this.cols - 10)) + 5;
            aiStartY = Math.floor(Math.random() * (this.rows - 10)) + 5;
            
            const proposedSnake = [
                { x: aiStartX, y: aiStartY },
                { x: aiStartX - 1, y: aiStartY },
                { x: aiStartX - 2, y: aiStartY }
            ];
            
            const tooCloseToPlayer = proposedSnake.some(segment =>
                this.snake.some(playerSegment =>
                    Math.abs(segment.x - playerSegment.x) + Math.abs(segment.y - playerSegment.y) < 5
                )
            );
            
            const onFood = proposedSnake.some(segment =>
                segment.x === this.food.x && segment.y === this.food.y
            );
            
            if (!tooCloseToPlayer && !onFood) {
                validSpawn = true;
            }
            
            attempts++;
        }
        
        if (validSpawn) {
            this.aiSnake = [
                { x: aiStartX, y: aiStartY },
                { x: aiStartX - 1, y: aiStartY },
                { x: aiStartX - 2, y: aiStartY }
            ];
            this.aiDirection = { x: 1, y: 0 };
            this.aiAlive = true;
        }
    }
    
    update() {
        if (this.gameOver || !this.gameStarted || this.paused) return;
        
        this.direction = { ...this.nextDirection };
        
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this.endGame();
            return;
        }
        
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        if (this.aiAlive && this.aiSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.updateScore();
            this.food = this.generateFood();
            
            if (this.gameSpeed > 50) {
                this.gameSpeed -= 1;
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.shadowColor = '#4ade80';
        this.ctx.shadowBlur = 10;
        
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#22c55e';
            } else {
                this.ctx.fillStyle = '#4ade80';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        if (this.aiAlive) {
            this.ctx.shadowColor = '#3b82f6';
            this.ctx.shadowBlur = 10;
            
            this.aiSnake.forEach((segment, index) => {
                if (index === 0) {
                    this.ctx.fillStyle = '#1d4ed8';
                } else {
                    this.ctx.fillStyle = '#3b82f6';
                }
                
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            });
        }
        
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ef4444';
        this.ctx.fillStyle = '#ef4444';
        
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        if (!this.gameStarted) {
            const isMobile = window.innerWidth <= 768;
            const message = isMobile ? 'Swipe to start' : 'Press any arrow key to start';
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = isMobile ? '20px Arial' : '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    restart() {
        this.init();
        this.lastUpdateTime = 0;
        this.lastAiUpdateTime = 0;
        this.paused = false;
    }
    
    pause() {
        this.paused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    startGameLoop() {
        const gameLoop = (currentTime = 0) => {
            this.animationFrame = requestAnimationFrame(gameLoop);
            
            if (this.paused) return;
            
            if (currentTime - this.lastUpdateTime > this.gameSpeed) {
                this.update();
                this.lastUpdateTime = currentTime;
            }
            
            if (currentTime - this.lastAiUpdateTime > this.aiSpeed) {
                this.updateAI();
                this.lastAiUpdateTime = currentTime;
            }
            
            if (!this.aiAlive && this.gameStarted && Date.now() - this.aiRespawnTimer > this.aiRespawnDelay) {
                this.respawnAI();
            }
            
            this.draw();
        };
        
        gameLoop();
    }
}

class BrickBreakerGame {
    constructor() {
        this.canvas = document.getElementById('brick-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.scoreElement = document.getElementById('brick-score');
        this.livesElement = document.getElementById('brick-lives');
        this.highScoreElement = document.getElementById('brick-high-score');
        this.finalScoreElement = document.getElementById('brick-final-score');
        this.gameOverScreen = document.getElementById('brick-game-over');
        this.resultTitle = document.getElementById('brick-result-title');
        this.restartBtn = document.getElementById('brick-restart-btn');
        
        this.highScore = localStorage.getItem('brickHighScore') || 0;
        this.highScoreElement.textContent = this.highScore;
        
        this.restartBtn.addEventListener('click', () => this.restart());
        
        this.keyPressHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyPressHandler);
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        this.mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        
        this.initTouchControls();
        
        this.resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
        
        this.paused = false;
        this.keys = {};
        
        this.initCanvasSize();
        this.init();
        this.startGameLoop();
    }
    
    initCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleResize() {
        this.initCanvasSize();
        this.restart();
    }
    
    initTouchControls() {
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            this.paddle.x = touchX - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        }, { passive: false });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                this.gameStarted = true;
            }
        }, { passive: false });
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        this.paddle.x = mouseX - this.paddle.width / 2;
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
    }
    
    handleKeyPress(e) {
        if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            this.keys[e.key] = true;
            if (!this.gameStarted) {
                this.gameStarted = true;
            }
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.keys[e.key] = false;
        }
    }
    
    init() {
        const isMobile = window.innerWidth <= 768;
        
        this.paddle = {
            width: isMobile ? 100 : 120,
            height: isMobile ? 12 : 15,
            x: this.canvas.width / 2 - (isMobile ? 50 : 60),
            y: this.canvas.height - (isMobile ? 50 : 80),
            speed: isMobile ? 8 : 10
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.paddle.y - 20,
            radius: isMobile ? 6 : 8,
            dx: 0,
            dy: 0,
            speed: isMobile ? 5 : 6
        };
        
        this.bricks = [];
        this.brickRows = isMobile ? 5 : 7;
        this.brickCols = isMobile ? 5 : 10;
        this.brickPadding = isMobile ? 5 : 10;
        this.brickOffsetTop = isMobile ? 80 : 120;
        this.brickOffsetLeft = isMobile ? 10 : 30;
        this.brickWidth = (this.canvas.width - this.brickOffsetLeft * 2 - this.brickPadding * (this.brickCols - 1)) / this.brickCols;
        this.brickHeight = isMobile ? 20 : 25;
        
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                this.bricks.push({
                    x: this.brickOffsetLeft + c * (this.brickWidth + this.brickPadding),
                    y: this.brickOffsetTop + r * (this.brickHeight + this.brickPadding),
                    width: this.brickWidth,
                    height: this.brickHeight,
                    color: colors[r % colors.length],
                    visible: true,
                    points: (this.brickRows - r) * 10
                });
            }
        }
        
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameStarted = false;
        this.won = false;
        
        this.updateScore();
        this.updateLives();
        this.gameOverScreen.classList.add('hidden');
        
        this.draw();
    }
    
    update() {
        if (this.gameOver || !this.gameStarted || this.paused) return;
        
        if (this.keys['ArrowLeft']) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight']) {
            this.paddle.x += this.paddle.speed;
        }
        
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        
        if (this.ball.dy === 0) {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ball.radius - 5;
            this.ball.dx = this.ball.speed * (Math.random() * 0.6 + 0.7) * (Math.random() > 0.5 ? 1 : -1);
            this.ball.dy = -this.ball.speed;
        } else {
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
        }
        
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }
        
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            this.ball.dx = speed * Math.sin(angle);
            this.ball.dy = -Math.abs(speed * Math.cos(angle));
        }
        
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this.lives--;
            this.updateLives();
            
            if (this.lives <= 0) {
                this.endGame(false);
            } else {
                this.ball.dx = 0;
                this.ball.dy = 0;
                this.gameStarted = false;
            }
        }
        
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            if (this.ball.x + this.ball.radius > brick.x &&
                this.ball.x - this.ball.radius < brick.x + brick.width &&
                this.ball.y + this.ball.radius > brick.y &&
                this.ball.y - this.ball.radius < brick.y + brick.height) {
                
                const ballCenterX = this.ball.x;
                const ballCenterY = this.ball.y;
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                
                const dx = Math.abs(ballCenterX - brickCenterX);
                const dy = Math.abs(ballCenterY - brickCenterY);
                
                if (dx / brick.width > dy / brick.height) {
                    this.ball.dx = -this.ball.dx;
                } else {
                    this.ball.dy = -this.ball.dy;
                }
                
                brick.visible = false;
                this.score += brick.points;
                this.updateScore();
                
                if (this.bricks.every(b => !b.visible)) {
                    this.endGame(true);
                }
            }
        });
    }
    
    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            this.ctx.shadowColor = brick.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = brick.color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 3);
        });
        
        this.ctx.shadowColor = '#4ade80';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height / 2);
        
        this.ctx.shadowColor = '#60a5fa';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        if (!this.gameStarted) {
            const isMobile = window.innerWidth <= 768;
            const message = isMobile ? 'Touch to launch' : 'Click or press Space to launch';
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = isMobile ? '18px Arial' : '22px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('brickHighScore', this.highScore);
        }
    }
    
    updateLives() {
        this.livesElement.textContent = this.lives;
    }
    
    endGame(won) {
        this.gameOver = true;
        this.won = won;
        this.finalScoreElement.textContent = this.score;
        
        if (won) {
            this.resultTitle.textContent = 'You Win!';
            this.resultTitle.classList.add('win');
            this.gameOverScreen.style.borderColor = '#4ade80';
            this.gameOverScreen.style.boxShadow = '0 0 30px rgba(74, 222, 128, 0.5)';
        } else {
            this.resultTitle.textContent = 'Game Over!';
            this.resultTitle.classList.remove('win');
            this.gameOverScreen.style.borderColor = '#ef4444';
            this.gameOverScreen.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.5)';
        }
        
        this.gameOverScreen.classList.remove('hidden');
    }
    
    restart() {
        this.init();
        this.paused = false;
    }
    
    pause() {
        this.paused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.animationFrame = requestAnimationFrame(gameLoop);
            
            if (this.paused) return;
            
            this.update();
            this.draw();
        };
        
        gameLoop();
    }
}

class PongGame {
    constructor() {
        this.canvas = document.getElementById('pong-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.playerScoreElement = document.getElementById('pong-player-score');
        this.aiScoreElement = document.getElementById('pong-ai-score');
        this.finalScoreElement = document.getElementById('pong-final-score');
        this.gameOverScreen = document.getElementById('pong-game-over');
        this.resultTitle = document.getElementById('pong-result-title');
        this.restartBtn = document.getElementById('pong-restart-btn');
        
        this.restartBtn.addEventListener('click', () => this.restart());
        
        this.keyPressHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyPressHandler);
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        this.initTouchControls();
        
        this.resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
        
        this.paused = false;
        this.keys = {};
        
        this.initCanvasSize();
        this.init();
        this.startGameLoop();
    }
    
    initCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleResize() {
        this.initCanvasSize();
        this.restart();
    }
    
    initTouchControls() {
        let touchY = null;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            
            if (touchX < this.canvas.width / 2) {
                touchY = touch.clientY - rect.top;
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            
            if (touchX < this.canvas.width / 2) {
                touchY = touch.clientY - rect.top;
                this.playerPaddle.y = touchY - this.playerPaddle.height / 2;
                this.playerPaddle.y = Math.max(0, Math.min(this.canvas.height - this.playerPaddle.height, this.playerPaddle.y));
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchY = null;
        }, { passive: false });
    }
    
    handleKeyPress(e) {
        if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            this.keys[e.key] = true;
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            this.keys[e.key] = false;
        }
    }
    
    init() {
        const isMobile = window.innerWidth <= 768;
        
        this.paddleWidth = isMobile ? 12 : 15;
        this.paddleHeight = isMobile ? 80 : 100;
        this.paddleSpeed = isMobile ? 6 : 8;
        
        this.playerPaddle = {
            x: 30,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed,
            score: 0
        };
        
        this.aiPaddle = {
            x: this.canvas.width - 30 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: isMobile ? 5 : 6,
            score: 0
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: isMobile ? 8 : 10,
            dx: 0,
            dy: 0,
            speed: isMobile ? 5 : 6,
            maxSpeed: isMobile ? 10 : 12
        };
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameOver = false;
        this.gameStarted = true;
        this.maxScore = 7;
        
        this.launchBall();
        
        this.updateScores();
        this.gameOverScreen.classList.add('hidden');
        
        this.draw();
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        setTimeout(() => {
            this.launchBall();
        }, 500);
    }
    
    launchBall() {
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
        const direction = Math.random() > 0.5 ? 1 : -1;
        this.ball.dx = this.ball.speed * Math.cos(angle) * direction;
        this.ball.dy = this.ball.speed * Math.sin(angle);
    }
    
    update() {
        if (this.gameOver || this.paused) return;
        
        if (this.keys['w'] || this.keys['ArrowUp']) {
            this.playerPaddle.y -= this.playerPaddle.speed;
        }
        if (this.keys['s'] || this.keys['ArrowDown']) {
            this.playerPaddle.y += this.playerPaddle.speed;
        }
        
        this.playerPaddle.y = Math.max(0, Math.min(this.canvas.height - this.playerPaddle.height, this.playerPaddle.y));
        
        const aiTarget = this.ball.y - this.aiPaddle.height / 2;
        const aiDiff = aiTarget - this.aiPaddle.y;
        
        if (Math.abs(aiDiff) > this.aiPaddle.speed) {
            this.aiPaddle.y += Math.sign(aiDiff) * this.aiPaddle.speed;
        }
        
        this.aiPaddle.y = Math.max(0, Math.min(this.canvas.height - this.aiPaddle.height, this.aiPaddle.y));
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }
        
        if (this.ball.x - this.ball.radius < this.playerPaddle.x + this.playerPaddle.width &&
            this.ball.x + this.ball.radius > this.playerPaddle.x &&
            this.ball.y > this.playerPaddle.y &&
            this.ball.y < this.playerPaddle.y + this.playerPaddle.height) {
            
            const hitPos = (this.ball.y - this.playerPaddle.y) / this.playerPaddle.height;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.min(Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy) * 1.05, this.ball.maxSpeed);
            this.ball.dx = Math.abs(speed * Math.cos(angle));
            this.ball.dy = speed * Math.sin(angle);
            this.ball.x = this.playerPaddle.x + this.playerPaddle.width + this.ball.radius;
        }
        
        if (this.ball.x + this.ball.radius > this.aiPaddle.x &&
            this.ball.x - this.ball.radius < this.aiPaddle.x + this.aiPaddle.width &&
            this.ball.y > this.aiPaddle.y &&
            this.ball.y < this.aiPaddle.y + this.aiPaddle.height) {
            
            const hitPos = (this.ball.y - this.aiPaddle.y) / this.aiPaddle.height;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.min(Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy) * 1.05, this.ball.maxSpeed);
            this.ball.dx = -Math.abs(speed * Math.cos(angle));
            this.ball.dy = speed * Math.sin(angle);
            this.ball.x = this.aiPaddle.x - this.ball.radius;
        }
        
        if (this.ball.x - this.ball.radius < 0) {
            this.aiScore++;
            this.updateScores();
            if (this.aiScore >= this.maxScore) {
                this.endGame(false);
            } else {
                this.resetBall();
            }
        }
        
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.playerScore++;
            this.updateScores();
            if (this.playerScore >= this.maxScore) {
                this.endGame(true);
            } else {
                this.resetBall();
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.shadowColor = '#4ade80';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fillRect(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height);
        
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
        
        this.ctx.shadowColor = '#60a5fa';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
    
    updateScores() {
        this.playerScoreElement.textContent = this.playerScore;
        this.aiScoreElement.textContent = this.aiScore;
    }
    
    endGame(won) {
        this.gameOver = true;
        this.finalScoreElement.textContent = `${this.playerScore} - ${this.aiScore}`;
        
        if (won) {
            this.resultTitle.textContent = 'You Win! 🎉';
            this.resultTitle.classList.add('win');
            this.gameOverScreen.style.borderColor = '#4ade80';
            this.gameOverScreen.style.boxShadow = '0 0 30px rgba(74, 222, 128, 0.5)';
        } else {
            this.resultTitle.textContent = 'AI Wins!';
            this.resultTitle.classList.remove('win');
            this.gameOverScreen.style.borderColor = '#ef4444';
            this.gameOverScreen.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.5)';
        }
        
        this.gameOverScreen.classList.remove('hidden');
    }
    
    restart() {
        this.init();
        this.paused = false;
    }
    
    pause() {
        this.paused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.animationFrame = requestAnimationFrame(gameLoop);
            
            if (this.paused) return;
            
            this.update();
            this.draw();
        };
        
        gameLoop();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameHub();
});