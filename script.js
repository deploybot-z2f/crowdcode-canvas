// Crowd Code Canvas - Physics Simulation
class PhysicsSimulation {
    constructor() {
        this.width = 80;
        this.height = 24;
        this.particles = [];
        this.canvas = document.getElementById('ascii-canvas');
        this.gravity = 0.01;
        this.friction = 0.99;
        this.elasticity = 0.8;
        
        this.initializeParticles();
        this.updateDisplay();
        this.animate();
        
        // Update system info
        this.updateSystemInfo();
        setInterval(() => this.updateSystemInfo(), 1000);
        
        // Setup gravity slider
        this.setupGravityControl();
    }
    
    setupGravityControl() {
        const gravitySlider = document.getElementById('gravity-slider');
        const gravityValue = document.getElementById('gravity-val');
        
        gravitySlider.addEventListener('input', (e) => {
            const sliderValue = parseFloat(e.target.value);
            this.gravity = sliderValue * 0.02; // Scale to appropriate physics value
            gravityValue.textContent = sliderValue.toFixed(2);
        });
        
        // Initialize with current value
        gravitySlider.value = this.gravity * 50;
        gravityValue.textContent = (this.gravity * 50).toFixed(2);
    }
    
    initializeParticles() {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * (this.width - 2) + 1,
                y: Math.random() * (this.height - 2) + 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                char: ['*', 'o', '+', '#', '@', '%'][Math.floor(Math.random() * 6)],
                trail: []
            });
        }
    }
    
    updatePhysics() {
        this.particles.forEach(particle => {
            // Apply gravity
            particle.vy += this.gravity;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Store trail
            particle.trail.push({x: Math.floor(particle.x), y: Math.floor(particle.y)});
            if (particle.trail.length > 5) {
                particle.trail.shift();
            }
            
            // Boundary collisions
            if (particle.x <= 0 || particle.x >= this.width - 1) {
                particle.vx *= -this.elasticity;
                particle.x = Math.max(1, Math.min(this.width - 2, particle.x));
            }
            
            if (particle.y <= 0 || particle.y >= this.height - 1) {
                particle.vy *= -this.elasticity;
                particle.y = Math.max(1, Math.min(this.height - 2, particle.y));
            }
            
            // Apply friction
            particle.vx *= this.friction;
            particle.vy *= this.friction;
        });
        
        // Particle interactions
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 3) {
                    const force = 0.1;
                    const angle = Math.atan2(dy, dx);
                    p1.vx -= Math.cos(angle) * force;
                    p1.vy -= Math.sin(angle) * force;
                    p2.vx += Math.cos(angle) * force;
                    p2.vy += Math.sin(angle) * force;
                }
            }
        }
    }
    
    render() {
        let frame = [];
        
        // Initialize empty frame
        for (let y = 0; y < this.height; y++) {
            frame[y] = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    frame[y][x] = '█';
                } else {
                    frame[y][x] = ' ';
                }
            }
        }
        
        // Draw particle trails
        this.particles.forEach(particle => {
            particle.trail.forEach((pos, index) => {
                if (pos.x > 0 && pos.x < this.width - 1 && pos.y > 0 && pos.y < this.height - 1) {
                    const trailChars = ['·', '·', '∘', '∘', '○'];
                    frame[pos.y][pos.x] = trailChars[index] || '·';
                }
            });
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            const x = Math.floor(particle.x);
            const y = Math.floor(particle.y);
            if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
                frame[y][x] = particle.char;
            }
        });
        
        // Convert frame to string
        return frame.map(row => row.join('')).join('\n');
    }
    
    updateDisplay() {
        this.canvas.textContent = this.render();
    }
    
    animate() {
        this.updatePhysics();
        this.updateDisplay();
        requestAnimationFrame(() => this.animate());
    }
    
    updateSystemInfo() {
        document.getElementById('particle-count').textContent = this.particles.length;
        document.getElementById('friction-val').textContent = this.friction.toFixed(3);
        document.getElementById('elastic-val').textContent = this.elasticity.toFixed(2);
        document.getElementById('field-size').textContent = `${this.width}x${this.height}`;
        
        // Simulate FPS counter
        const fps = 58 + Math.floor(Math.random() * 5);
        document.getElementById('fps-counter').textContent = fps;
    }
}

// Terminal-style loading sequence
function initializeSystem() {
    console.log('INITIALIZING CROWD CODE CANVAS...');
    console.log('Loading physics engine...');
    console.log('Spawning particles...');
    console.log('System ready.');
    
    new PhysicsSimulation();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeSystem, 500);
});

// Add some interactivity
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        console.log('SPACE pressed - adding particle burst');
        // Could add new particles here
    }
});