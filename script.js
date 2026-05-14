function celebrate() {
    const button = document.querySelector('.cta-button');
    
    button.textContent = '🎉 Amazing! 🎉';
    button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    
    createFireworks();
    
    setTimeout(() => {
        button.textContent = "Let's Code! 🎉";
        button.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }, 3000);
}

function createFireworks() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.position = 'fixed';
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight + 'px';
            firework.style.width = '10px';
            firework.style.height = '10px';
            firework.style.borderRadius = '50%';
            firework.style.background = colors[Math.floor(Math.random() * colors.length)];
            firework.style.pointerEvents = 'none';
            firework.style.zIndex = '9999';
            firework.style.boxShadow = '0 0 10px currentColor';
            
            document.body.appendChild(firework);
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4;
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
        }, i * 50);
    }
}

const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        observer.observe(card);
    });
    
    document.querySelectorAll('.idea-bubble').forEach((bubble, index) => {
        bubble.style.animationDelay = `${index * 0.2}s`;
    });
});

let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;
    
    document.querySelectorAll('.floating-emoji').forEach((emoji, index) => {
        const speed = (index + 1) * 0.3;
        const currentTransform = emoji.style.transform || 'translateY(0px)';
        const currentY = parseFloat(currentTransform.match(/translateY\(([^)]+)px\)/)?.[1] || 0);
        emoji.style.transform = `translateY(${currentY + delta * speed}px)`;
    });
    
    lastScrollY = scrollY;
});