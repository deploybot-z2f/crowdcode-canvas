// Crowd Code Canvas - ASCII Pong Game
class PongGame {
    constructor() {
        this.width = 80;
        this.height = 24;
        this.canvas = document.getElementById('ascii-canvas');
        this.gameStatus = document.getElementById('game-status');
        
        // Game state
        this.paused = false;
        this.gameRunning = true;
        
        // Ball properties
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            vx: 0.8,
            vy: 0.4,
            char: '●'
        };
        
        // Paddle properties
        this.paddleSize = 5;
        this.playerPaddle = {
            x: 2,
            y: Math.floor(this.height / 2) - Math.floor(this.paddleSize / 2),
            speed: 1
        };
        
        this.aiPaddle = {
            x: this.width - 3,
            y: Math.floor(this.height / 2) - Math.floor(this.paddleSize / 2),
            speed: 0.6
        };
        
        // Score
        this.playerScore = 0;
        this.aiScore = 0;
        
        // Game parameters
        this.ballSpeed = 1;
        this.aiDifficulty = 0.6;
        
        this.setupControls();
        this.setupParameterControls();
        this.updateDisplay();
        this.animate();
        this.updateSystemInfo();
        setInterval(() => this.updateSystemInfo(), 1000);
        
        this.showMessage("GAME START - Use W/S or ↑/↓ to move");
    }
    
    setupControls() {
        this.keys = {};
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            }
            
            if (e.key.toLowerCase() === 'r') {
                this.resetGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupParameterControls() {
        // Ball speed slider
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-val');
        
        speedSlider.addEventListener('input', (e) => {
            this.ballSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.ballSpeed.toFixed(1);
        });
        
        // Paddle size slider
        const paddleSlider = document.getElementById('paddle-slider');
        const paddleValue = document.getElementById('paddle-val');
        
        paddleSlider.addEventListener('input', (e) => {
            this.paddleSize = parseInt(e.target.value);
            paddleValue.textContent = this.paddleSize;
        });
        
        // AI difficulty slider
        const aiSlider = document.getElementById('ai-slider');
        const aiValue = document.getElementById('ai-val');
        
        aiSlider.addEventListener('input', (e) => {
            this.aiDifficulty = parseFloat(e.target.value);
            this.aiPaddle.speed = this.aiDifficulty;
            aiValue.textContent = this.aiDifficulty.toFixed(1);
        });
        
        // Initialize values
        speedValue.textContent = this.ballSpeed.toFixed(1);
        paddleValue.textContent = this.paddleSize;
        aiValue.textContent = this.aiDifficulty.toFixed(1);
    }
    
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.showMessage("GAME PAUSED - Press SPACE to continue", "paused");
        } else {
            this.showMessage("GAME RESUMED");
        }
    }
    
    resetGame() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 0.8;
        this.ball.vy = (Math.random() - 0.5) * 0.8;
        this.playerPaddle.y = Math.floor(this.height / 2) - Math.floor(this.paddleSize / 2);
        this.aiPaddle.y = Math.floor(this.height / 2) - Math.floor(this.paddleSize / 2);
        this.showMessage("GAME RESET - Score: 0 - 0");
    }
    
    updatePaddles() {
        if (this.paused) return;
        
        // Player paddle controls
        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerPaddle.y = Math.max(1, this.playerPaddle.y - this.playerPaddle.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerPaddle.y = Math.min(this.height - this.paddleSize - 1, this.playerPaddle.y + this.playerPaddle.speed);
        }
        
        // AI paddle movement
        const ballCenterY = this.ball.y;
        const paddleCenterY = this.aiPaddle.y + this.paddleSize / 2;
        const diff = ballCenterY - paddleCenterY;
        
        if (Math.abs(diff) > 0.5) {
            if (diff > 0) {
                this.aiPaddle.y = Math.min(this.height - this.paddleSize - 1, this.aiPaddle.y + this.aiPaddle.speed);
            } else {
                this.aiPaddle.y = Math.max(1, this.aiPaddle.y - this.aiPaddle.speed);
            }
        }
    }
    
    updateBall() {
        if (this.paused) return;
        
        // Move ball
        this.ball.x += this.ball.vx * this.ballSpeed;
        this.ball.y += this.ball.vy * this.ballSpeed;
        
        // Top/bottom wall collision
        if (this.ball.y <= 1 || this.ball.y >= this.height - 2) {
            this.ball.vy *= -1;
            this.ball.y = Math.max(1, Math.min(this.height - 2, this.ball.y));
        }
        
        // Player paddle collision
        if (this.ball.x <= this.playerPaddle.x + 1 && 
            this.ball.x >= this.playerPaddle.x &&
            this.ball.y >= this.playerPaddle.y &&
            this.ball.y <= this.playerPaddle.y + this.paddleSize) {
            
            this.ball.vx = Math.abs(this.ball.vx);
            const relativeY = (this.ball.y - (this.playerPaddle.y + this.paddleSize / 2)) / (this.paddleSize / 2);
            this.ball.vy = relativeY * 0.6;
        }
        
        // AI paddle collision
        if (this.ball.x >= this.aiPaddle.x - 1 && 
            this.ball.x <= this.aiPaddle.x &&
            this.ball.y >= this.aiPaddle.y &&
            this.ball.y <= this.aiPaddle.y + this.paddleSize) {
            
            this.ball.vx = -Math.abs(this.ball.vx);
            const relativeY = (this.ball.y - (this.aiPaddle.y + this.paddleSize / 2)) / (this.paddleSize / 2);
            this.ball.vy = relativeY * 0.6;
        }
        
        // Score detection
        if (this.ball.x <= 0) {
            this.aiScore++;
            this.showMessage(`AI SCORES! Score: ${this.playerScore} - ${this.aiScore}`, "goal");
            this.resetBall();
        } else if (this.ball.x >= this.width - 1) {
            this.playerScore++;
            this.showMessage(`PLAYER SCORES! Score: ${this.playerScore} - ${this.aiScore}`, "goal");
            this.resetBall();
        }
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 0.8;
        this.ball.vy = (Math.random() - 0.5) * 0.8;
    }
    
    render() {
        let frame = [];
        
        // Initialize empty frame
        for (let y = 0; y < this.height; y++) {
            frame[y] = [];
            for (let x = 0; x < this.width; x++) {
                if (y === 0 || y === this.height - 1) {
                    frame[y][x] = '═';
                } else if (x === 0 || x === this.width - 1) {
                    frame[y][x] = '║';
                } else {
                    frame[y][x] = ' ';
                }
            }
        }
        
        // Draw center line
        for (let y = 1; y < this.height - 1; y++) {
            if (y % 2 === 0) {
                frame[y][Math.floor(this.width / 2)] = '┊';
            }
        }
        
        // Draw paddles
        for (let i = 0; i < this.paddleSize; i++) {
            // Player paddle
            if (this.playerPaddle.y + i >= 0 && this.playerPaddle.y + i < this.height) {
                frame[this.playerPaddle.y + i][this.playerPaddle.x] = '█';
            }
            
            // AI paddle
            if (this.aiPaddle.y + i >= 0 && this.aiPaddle.y + i < this.height) {
                frame[this.aiPaddle.y + i][this.aiPaddle.x] = '█';
            }
        }
        
        // Draw ball
        const ballX = Math.floor(this.ball.x);
        const ballY = Math.floor(this.ball.y);
        if (ballX > 0 && ballX < this.width - 1 && ballY > 0 && ballY < this.height - 1) {
            frame[ballY][ballX] = this.ball.char;
        }
        
        // Convert frame to string
        return frame.map(row => row.join('')).join('\n');
    }
    
    updateDisplay() {
        this.canvas.textContent = this.render();
    }
    
    animate() {
        this.updatePaddles();
        this.updateBall();
        this.updateDisplay();
        requestAnimationFrame(() => this.animate());
    }
    
    updateSystemInfo() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
        document.getElementById('field-size').textContent = `${this.width}x${this.height}`;
        
        // Simulate FPS counter
        const fps = 58 + Math.floor(Math.random() * 5);
        document.getElementById('fps-counter').textContent = fps;
    }
    
    showMessage(message, cssClass = '') {
        this.gameStatus.textContent = message;
        this.gameStatus.className = `game-status ${cssClass}`;
        
        if (cssClass !== 'paused') {
            setTimeout(() => {
                if (this.gameStatus.textContent === message) {
                    this.gameStatus.textContent = '';
                    this.gameStatus.className = 'game-status';
                }
            }, 3000);
        }
    }
}

// Initialize game
function initializeSystem() {
    console.log('INITIALIZING CROWD CODE CANVAS...');
    console.log('Loading PONG game engine...');
    console.log('Setting up controls...');
    console.log('System ready.');
    
    new PongGame();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeSystem, 500);
});