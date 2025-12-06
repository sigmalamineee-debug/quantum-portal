// Quantum UI - Dynamic Particle Background
// Supports snow and colored particles with customizable intensity

class SnowManager {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'snow-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.prepend(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 150;
        this.particleColor = '#ffffff';
        this.width = 0;
        this.height = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.init();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    setIntensity(count) {
        this.particleCount = count;
        this.init();
    }

    setColor(color) {
        this.particleColor = color;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.width, this.height));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.height, this.width);
            this.particles[i].draw(this.ctx, this.particleColor);
        }

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
        this.y = Math.random() * height; // Start randomly on screen
    }

    reset() {
        this.x = Math.random() * this.width;
        this.y = -10;
        this.vy = Math.random() * 2 + 1; // Fall speed
        this.vx = (Math.random() - 0.5) * 0.5; // Horizontal drift
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.swaySpeed = Math.random() * 0.05 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
    }

    update(height, width) {
        this.y += this.vy;
        this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * 0.5 + this.vx;

        // Reset if off screen
        if (this.y > height) {
            this.reset();
        }
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
    }

    draw(ctx, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        // Parse color and apply opacity
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        }

        ctx.fill();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.snowManager = new SnowManager();
});
