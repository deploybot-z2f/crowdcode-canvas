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
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.initTouchControls();
        
        window.addEventListener('resize', () => this.handleResize());
        
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
        
        if (this.gameOver) return;
        
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
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
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
        
        if (this.gameOver) return;
        
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
        if (!this.aiAlive || !this.gameStarted) return;
        
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
        if (this.gameOver || !this.gameStarted) return;
        
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
    }
    
    startGameLoop() {
        const gameLoop = (currentTime = 0) => {
            this.animationFrame = requestAnimationFrame(gameLoop);
            
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

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});