// Falling Cherry Blossom Petals Animation
(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Get canvas container
  const container = document.querySelector('.hanami-canvas');
  if (!container) return;

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Petal class
  class Petal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 10 + 5; // 5-15px
      this.speed = Math.random() * 1 + 0.5; // 0.5-1.5px per frame
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.05;
      this.swing = Math.random() * 2;
      this.swingSpeed = Math.random() * 0.02 + 0.01;
      this.opacity = Math.random() * 0.4 + 0.5; // 0.5-0.9
      this.color = this.getRandomColor();
    }

    getRandomColor() {
      const colors = [
        'rgba(255, 87, 87, ',   // Torii Red (primary)
        'rgba(255, 179, 193, ', // Light Pink (accent)
        'rgba(255, 138, 128, ', // Coral (accent)
        'rgba(255, 230, 235, ', // Very Light Pink
        'rgba(255, 102, 102, ', // Bright Red
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      // Vertical movement
      this.y += this.speed;

      // Horizontal swing
      this.swing += this.swingSpeed;
      this.x += Math.sin(this.swing) * 0.5;

      // Rotation
      this.rotation += this.rotationSpeed;

      // Reset if out of bounds
      if (this.y > canvas.height + 20) {
        this.reset();
      }

      if (this.x < -20 || this.x > canvas.width + 20) {
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Draw petal shape (simple ellipse)
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.fill();

      // Add a subtle gradient for depth
      const gradient = ctx.createRadialGradient(
        -this.size * 0.2, -this.size * 0.2, 0,
        0, 0, this.size
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();
    }
  }

  // Create petals
  const petalCount = prefersReducedMotion ? 20 : 50;
  const petals = [];

  for (let i = 0; i < petalCount; i++) {
    const petal = new Petal();
    // Spread initial positions across the screen vertically
    petal.y = Math.random() * canvas.height;
    petals.push(petal);
  }

  // Animation loop
  function animate() {
    // Clear canvas with slight fade for trail effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw petals
    petals.forEach(petal => {
      petal.update();
      petal.draw();
    });

    requestAnimationFrame(animate);
  }

  // Start animation
  if (!prefersReducedMotion) {
    animate();
  } else {
    // For reduced motion, just draw static petals
    petals.forEach(petal => petal.draw());
  }
})();
