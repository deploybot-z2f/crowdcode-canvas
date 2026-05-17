function celebrate() {
    const button = document.querySelector('.cta-button');
    
    button.textContent = '🎊 Amazing! 🎊';
    button.style.background = '#0f172a';
    button.style.borderColor = '#0f172a';
    
    createFireworks();
    
    setTimeout(() => {
        button.textContent = "Let's Code Together! 🎉";
        button.style.background = '#111827';
        button.style.borderColor = '#111827';
    }, 3000);
}

function createFireworks() {
    const colors = ['#111827', '#334155', '#475569', '#0f172a', '#1e293b', '#64748b'];
    
    for (let i = 0; i < 24; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.position = 'fixed';
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight + 'px';
            firework.style.width = '10px';
            firework.style.height = '10px';
            firework.style.borderRadius = '9999px';
            firework.style.background = colors[Math.floor(Math.random() * colors.length)];
            firework.style.pointerEvents = 'none';
            firework.style.zIndex = '9999';
            firework.style.boxShadow = '0 0 12px rgba(15, 23, 42, 0.35)';
            
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