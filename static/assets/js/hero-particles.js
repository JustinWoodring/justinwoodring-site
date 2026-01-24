/**
 * Hero Particle Effect
 * Adds a subtle synthwave energy field (Pink & Cyan) behind the main profile.
 */

const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration
    const PARTICLE_COUNT = 50;
    
    // 80s Synthwave Palette
    const COLORS = [
        'rgba(255, 0, 255, ',  // Neon Magenta/Pink
        'rgba(0, 240, 255, '   // Electric Cyan
    ];
    
    class Particle {
        constructor() {
            this.init(true); // true = random start life to avoid synchronized blinking
        }

        init(randomStart = false) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            
            // Omnidirectional float (random angle and slow speed)
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.2 + 0.1; // Very slow drift
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.size = Math.random() * 2 + 1;
            
            // Random color from palette
            this.colorPrefix = COLORS[Math.floor(Math.random() * COLORS.length)];
            
            // Lifecycle: Fade In -> Float -> Fade Out
            this.life = randomStart ? Math.random() : 0;
            this.state = randomStart && Math.random() > 0.5 ? 'out' : 'in'; 
            this.fadeSpeed = Math.random() * 0.01 + 0.005;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Handle Fading
            if (this.state === 'in') {
                this.life += this.fadeSpeed;
                if (this.life >= 1) {
                    this.life = 1;
                    this.state = 'out';
                }
            } else if (this.state === 'out') {
                this.life -= this.fadeSpeed;
                if (this.life <= 0) {
                    this.init(); // Respawn elsewhere
                }
            }

            // Wrap around screen edges (optional, but good for drift)
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }

        draw() {
            // Cap opacity at 0.6 for subtle effect
            const opacity = Math.max(0, Math.min(this.life * 0.6, 0.6));
            
            ctx.fillStyle = this.colorPrefix + opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
        animate();
    }

    function resize() {
        if (!heroCanvas.parentElement) return;
        const rect = heroCanvas.parentElement.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        heroCanvas.width = width;
        heroCanvas.height = height;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
}