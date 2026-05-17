function celebrate() {
    const button = document.querySelector('.cta-button');
    
    button.textContent = '🎊 Amazing! 🎊';
    button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    
    createFireworks();
    
    setTimeout(() => {
        button.textContent = "Let's Code Together! 🎉";
        button.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }, 3000);
}

function createFireworks() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.position = 'fixed';
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight + 'px';
            firework.style.width = '12px';
            firework.style.height = '12px';
            firework.style.borderRadius = '50%';
            firework.style.background = colors[Math.floor(Math.random() * colors.length)];
            firework.style.pointerEvents = 'none';
            firework.style.zIndex = '9999';
            firework.style.boxShadow = '0 0 15px currentColor';
            
            document.body.appendChild(firework);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3 + Math.random() * 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            let x = parseFloat(firework.style.left);
            let y = parseFloat(firework.style.top);
            let opacity = 1;
            
            const animate = () => {
                x += vx;
                y += vy;
                opacity -= 0.02;
                
                firework.style.left = x + 'px';
                firework.style.top = y + 'px';
                firework.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    firework.remove();
                }
            };
            
            animate();
        }, i * 40);
    }
}