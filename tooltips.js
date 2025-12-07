// Quantum UI - Tooltip System
// Provides contextual help for all UI elements

class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.init();
    }

    init() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'quantum-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(30, 31, 34, 0.95);
            backdrop-filter: blur(10px);
            color: #f2f3f5;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 10000;
            max-width: 250px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 51, 51, 0.2);
        `;
        document.body.appendChild(this.tooltip);

        // Attach to all elements with data-tooltip
        this.attachListeners();
    }

    attachListeners() {
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.show(target, target.dataset.tooltip);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hide();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.tooltip.style.opacity === '1') {
                this.position(e.clientX, e.clientY);
            }
        });
    }

    show(element, text) {
        this.tooltip.textContent = text;
        this.tooltip.style.opacity = '1';
    }

    hide() {
        this.tooltip.style.opacity = '0';
    }

    position(x, y) {
        const offset = 15;
        let left = x + offset;
        let top = y + offset;

        // Prevent tooltip from going off-screen
        const rect = this.tooltip.getBoundingClientRect();
        if (left + rect.width > window.innerWidth) {
            left = x - rect.width - offset;
        }
        if (top + rect.height > window.innerHeight) {
            top = y - rect.height - offset;
        }

        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new TooltipManager();
});
