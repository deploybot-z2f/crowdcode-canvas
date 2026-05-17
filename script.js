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

    for (let i = 0; i < 18; i++) {
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

function createFooterSparkles() {
    const sparkleContainer = document.querySelector('.sparkle-container');
    if (!sparkleContainer) return;

    const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '⚡'];

    for (let i = 0; i < 10; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (2 + Math.random() * 2) + 's';
        sparkleContainer.appendChild(sparkle);
    }
}

function createFooterConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    if (!confettiContainer) return;

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff69b4', '#ffa500'];

    for (let i = 0; i < 18; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 4 + 's';
        confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confettiContainer.appendChild(confetti);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createFooterSparkles();
    createFooterConfetti();
});
