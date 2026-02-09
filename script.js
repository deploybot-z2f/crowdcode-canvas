class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.gridSize = 20;
        this.cols = this.canvas.width / this.gridSize;
        this.rows = this.canvas.height / this.gridSize;
        
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverScreen = document.getElementById('game-over');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.highScoreElement.textContent = this.highScore;
        
        this.restartBtn.addEventListener('click', () => this.restart());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.init();
    }
    
    init() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        
        this.updateScore();
        this.gameOverScreen.classList.add('hidden');
        
        this.lastTime = 0;
        this.gameSpeed = 100;
        this.animate(0);
    }
    
    generateFood() {
        let food;
        let validPosition = false;
        
        while (!validPosition) {
            food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
            
            validPosition = !this.snake.some(segment => 
                segment.x === food.x && segment.y === food.y
            );
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
        
        this.ctx.fillStyle = '#4ade80';
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
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press any arrow key to start', this.canvas.width / 2, this.canvas.height / 2);
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
    }
    
    animate(currentTime) {
        requestAnimationFrame((time) => this.animate(time));
        
        if (currentTime - this.lastTime > this.gameSpeed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});