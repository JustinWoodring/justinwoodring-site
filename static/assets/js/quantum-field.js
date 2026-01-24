/**
 * Quantum Field Animation
 * Renders a network of connected particles (qubits) with a cyber-aesthetic.
 */

const canvas = document.getElementById('quantum-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuration
const PARTICLE_COUNT = 60; // Density
const CONNECTION_DISTANCE = 150;
const MOUSE_DISTANCE = 250;

// Colors (Matches new CSS variables)
const COLOR_PARTICLE = 'rgba(0, 242, 255, 0.8)'; // Cyan
const COLOR_LINE = 'rgba(124, 58, 237, 0.15)';   // Faint Purple

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_PARTICLE;
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
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONNECTION_DISTANCE) {
                ctx.beginPath();
                ctx.strokeStyle = COLOR_LINE;
                ctx.lineWidth = 1 - (distance / CONNECTION_DISTANCE);
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.addEventListener('DOMContentLoaded', init);
