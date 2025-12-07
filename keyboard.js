// Quantum UI - Keyboard Shortcuts Manager
// Provides quick access to common actions

class KeyboardManager {
    constructor() {
        this.shortcuts = {
            'ctrl+k': () => this.focusKeyInput(),
            'ctrl+c': () => this.copyHWID(),
            'ctrl+s': () => this.openSettings(),
            'escape': () => this.closeModals(),
            'ctrl+tab': () => this.nextTab(),
            'ctrl+shift+tab': () => this.prevTab()
        };

        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (this.shortcuts[key]) {
                e.preventDefault();
                this.shortcuts[key]();
            }
        });

        // Show shortcuts hint on first load
        if (!localStorage.getItem('quantum_shortcuts_seen')) {
            this.showShortcutsHint();
            localStorage.setItem('quantum_shortcuts_seen', 'true');
        }
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }

    focusKeyInput() {
        const keyInput = document.getElementById('keyInput');
        if (keyInput) {
            keyInput.focus();
            keyInput.select();
        }
    }

    copyHWID() {
        const copyBtn = document.getElementById('copyHwid');
        if (copyBtn) {
            copyBtn.click();
        }
    }

    openSettings() {
        const settingsBtn = document.querySelector('[data-category="settings"]');
        if (settingsBtn) {
            settingsBtn.click();
        }
    }

    closeModals() {
        // Close any open modals or panels
        const modals = document.querySelectorAll('.modal.active, .panel.active');
        modals.forEach(modal => modal.classList.remove('active'));
    }

    nextTab() {
        const tabs = Array.from(document.querySelectorAll('.category-btn'));
        const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
        if (activeIndex < tabs.length - 1) {
            tabs[activeIndex + 1].click();
        }
    }

    prevTab() {
        const tabs = Array.from(document.querySelectorAll('.category-btn'));
        const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
        if (activeIndex > 0) {
            tabs[activeIndex - 1].click();
        }
    }

    showShortcutsHint() {
        const hint = document.createElement('div');
        hint.className = 'shortcuts-hint';
        hint.innerHTML = `
            <div class="shortcuts-content">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <div class="shortcut-list">
                    <div><kbd>Ctrl</kbd> + <kbd>K</kbd> - Focus key input</div>
                    <div><kbd>Ctrl</kbd> + <kbd>C</kbd> - Copy HWID</div>
                    <div><kbd>Ctrl</kbd> + <kbd>S</kbd> - Open settings</div>
                    <div><kbd>Ctrl</kbd> + <kbd>Tab</kbd> - Next tab</div>
                    <div><kbd>Esc</kbd> - Close modals</div>
                </div>
                <button class="hint-close">Got it!</button>
            </div>
        `;

        hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(30, 31, 34, 0.95);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            max-width: 300px;
            border: 1px solid rgba(255, 51, 51, 0.3);
            animation: slideInUp 0.5s ease-out;
        `;

        document.body.appendChild(hint);

        hint.querySelector('.hint-close').addEventListener('click', () => {
            hint.style.animation = 'slideOutDown 0.5s ease-out';
            setTimeout(() => hint.remove(), 500);
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (hint.parentElement) {
                hint.style.animation = 'slideOutDown 0.5s ease-out';
                setTimeout(() => hint.remove(), 500);
            }
        }, 10000);
    }
}

// Add CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideOutDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }

    .shortcuts-content h3 {
        color: #f2f3f5;
        font-size: 16px;
        margin-bottom: 12px;
    }

    .shortcut-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 13px;
        color: #b5bac1;
    }

    .shortcut-list kbd {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hint-close {
        width: 100%;
        padding: 8px;
        background: #ff3333;
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .hint-close:hover {
        background: #ff5555;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.keyboardManager = new KeyboardManager();
});
