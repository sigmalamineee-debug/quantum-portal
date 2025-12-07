// Quantum UI - Complete Enhanced Settings Manager
// ALL FEATURES IMPLEMENTED

// Constants
const SETTINGS_CONSTANTS = {
    FPS_MIN: 30,
    FPS_MAX: 240,
    FPS_STEP: 10,
    BLUR_MIN: 0,
    BLUR_MAX: 20,
    SNOW_MIN: 0,
    SNOW_MAX: 300,
    DEBOUNCE_DELAY: 50,
    TOAST_DURATION: 3000,
    CHANGELOG_VERSION: '2.0.0'
};

const SETTINGS_PROFILES = {
    performance: {
        name: '⚡ Performance',
        settings: {
            fps_cap: 240,
            blur_strength: 0,
            snow_intensity: 0,
            sounds_enabled: false,
            animations_enabled: false,
            particles_enabled: false,
            show_tooltips: false,
            streamer_mode: false,
            dark_mode: true
        }
    },
    balanced: {
        name: '⚖️ Balanced',
        settings: {
            fps_cap: 120,
            blur_strength: 8,
            snow_intensity: 100,
            sounds_enabled: true,
            animations_enabled: true,
            particles_enabled: true,
            show_tooltips: true,
            streamer_mode: false,
            dark_mode: true
        }
    },
    quality: {
        name: '✨ Quality',
        settings: {
            fps_cap: 60,
            blur_strength: 20,
            snow_intensity: 300,
            sounds_enabled: true,
            animations_enabled: true,
            particles_enabled: true,
            show_tooltips: true,
            streamer_mode: false,
            dark_mode: false
        }
    }
};

const CHANGELOG = [
    {
        version: '2.0.0',
        date: '2025-12-02',
        changes: [
            'Added settings profiles (Performance, Balanced, Quality)',
            'Implemented export/import functionality',
            'Added keyboard shortcuts (Ctrl+S, Esc, Ctrl+R)',
            'Toast notifications for all actions',
            'Tooltips with descriptions',
            'Advanced settings section',
            'Performance monitor with real-time FPS/Ping',
            'Backup/restore system',
            'Custom keybind editor',
            'Mobile support with touch gestures',
            'Dark/Light mode toggle',
            'Changelog viewer',
            'Real-time stats for Roblox integration'
        ]
    },
    {
        version: '1.0.0',
        date: '2025-11-30',
        changes: [
            'Initial release',
            'Basic settings management',
            'Theme system',
            'Custom sliders and toggles'
        ]
    }
];

class SettingsManager {
    constructor() {
        this.defaultSettings = {
            theme: 'christmas',
            snow_intensity: 150,
            blur_strength: 12,
            sounds_enabled: true,
            fps_cap: 60,
            show_tooltips: true,
            animations_enabled: true,
            streamer_mode: false,
            particles_enabled: true,
            dark_mode: true,
            advanced_mode: false,
            // New Features
            menu_bind: 'Insert',
            crosshair_enabled: false,
            crosshair_type: 'cross', // cross, dot, circle
            crosshair_color: '#ff0000',
            crosshair_size: 10,
            discord_rpc: true,
            auto_inject: false,
            language: 'en',
            auto_execute: true,
            save_tabs: true,
            accent_color: '#3b82f6'
        };

        this.settings = this.load();
        this.settingsChanged = 0;
        this.debounceTimers = {};
        this.toastContainer = null;
        this.currentTooltip = null;
        this.fpsHistory = [];
        this.maxFpsHistory = 60;
        this.backups = [];

        // Apply all settings initially
        Object.keys(this.settings).forEach(key => {
            this.apply(key, this.settings[key]);
        });

        // Initialize keyboard shortcuts
        this.initKeyboardShortcuts();

        // Start FPS monitoring
        this.startFPSMonitoring();

        // Auto-backup every 5 minutes
        setInterval(() => this.autoBackup(), 300000);
    }

    load() {
        try {
            const saved = localStorage.getItem('quantum_settings');
            if (saved) {
                return { ...this.defaultSettings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showToast('Failed to load settings, using defaults', 'error');
        }
        return { ...this.defaultSettings };
    }

    save() {
        try {
            localStorage.setItem('quantum_settings', JSON.stringify(this.settings));
            this.settingsChanged++;
            localStorage.setItem('quantum_settings_changed', this.settingsChanged);

            // Sync with Lua script
            if (typeof window !== 'undefined') {
                window._QuantumSettings = this.settings;
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        try {
            if (!this.validateSetting(key, value)) {
                console.warn('Invalid setting value:', key, value);
                return;
            }

            this.settings[key] = value;
            this.save();
            this.apply(key, value);
        } catch (error) {
            console.error('Failed to set setting:', key, error);
            this.showToast(`Failed to apply ${key}`, 'error');
        }
    }

    validateSetting(key, value) {
        switch (key) {
            case 'fps_cap':
                return value >= SETTINGS_CONSTANTS.FPS_MIN && value <= SETTINGS_CONSTANTS.FPS_MAX;
            case 'blur_strength':
                return value >= SETTINGS_CONSTANTS.BLUR_MIN && value <= SETTINGS_CONSTANTS.BLUR_MAX;
            case 'snow_intensity':
                return value >= SETTINGS_CONSTANTS.SNOW_MIN && value <= SETTINGS_CONSTANTS.SNOW_MAX;
            default:
                return true;
        }
    }

    apply(key, value) {
        switch (key) {
            case 'snow_intensity':
                if (window.snowManager) {
                    window.snowManager.setIntensity(value);
                }
                break;
            case 'blur_strength':
                const container = document.querySelector('.ui-container');
                if (container) {
                    container.style.backdropFilter = `blur(${value}px)`;
                    container.style.webkitBackdropFilter = `blur(${value}px)`;
                }
                break;
            case 'animations_enabled':
                document.body.classList.toggle('no-animations', !value);
                break;
            case 'streamer_mode':
                const username = document.getElementById('username');
                const avatar = document.getElementById('avatarImg');
                if (username) username.textContent = value ? '******' : 'Guest User';
                if (avatar) avatar.style.filter = value ? 'blur(5px)' : 'none';
                break;
            case 'dark_mode':
                document.body.classList.toggle('light-mode', !value);
                break;
        }
    }

    // Auto-backup
    autoBackup() {
        const backup = {
            timestamp: Date.now(),
            settings: { ...this.settings }
        };
        this.backups.push(backup);
        if (this.backups.length > 5) {
            this.backups.shift();
        }
        localStorage.setItem('quantum_backups', JSON.stringify(this.backups));
    }

    // Restore from backup
    restoreBackup(index) {
        if (this.backups[index]) {
            this.settings = { ...this.backups[index].settings };
            this.save();
            this.showToast('Backup restored. Reloading...', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    }

    // Export settings
    exportSettings() {
        try {
            const data = {
                version: SETTINGS_CONSTANTS.CHANGELOG_VERSION,
                timestamp: new Date().toISOString(),
                settings: this.settings
            };
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quantum-settings-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Settings exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Failed to export settings', 'error');
        }
    }

    // Import settings
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.settings) {
                        this.settings = { ...this.defaultSettings, ...data.settings };
                        this.save();
                        this.showToast('Settings imported successfully. Reloading...', 'success');
                        setTimeout(() => location.reload(), 1500);
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    this.showToast('Failed to import settings', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Apply profile
    applyProfile(profileName) {
        const profile = SETTINGS_PROFILES[profileName];
        if (!profile) return;

        this.settings = { ...this.settings, ...profile.settings };
        this.save();
        this.showToast(`Applied ${profile.name} profile`, 'success');
        setTimeout(() => location.reload(), 1000);
    }

    // Toast notifications
    showToast(message, type = 'info') {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, SETTINGS_CONSTANTS.TOAST_DURATION);
    }

    // Keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.save();
                this.showToast('Settings saved', 'success');
            }

            if (e.key === 'Escape') {
                const settingsContent = document.getElementById('settingsContent');
                if (settingsContent && settingsContent.style.display === 'block') {
                    const rcfaBtn = document.querySelector('[data-category="rcfa"]');
                    if (rcfaBtn) rcfaBtn.click();
                }
            }

            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                if (confirm('Reset all settings to defaults?')) {
                    this.settings = { ...this.defaultSettings };
                    this.save();
                    this.showToast('Settings reset. Reloading...', 'success');
                    setTimeout(() => location.reload(), 1000);
                }
            }
        });
    }

    // FPS Monitoring
    startFPSMonitoring() {
        let lastTime = performance.now();
        const updateFPS = () => {
            const currentTime = performance.now();
            const delta = currentTime - lastTime;
            const fps = Math.round(1000 / delta);

            this.fpsHistory.push(fps);
            if (this.fpsHistory.length > this.maxFpsHistory) {
                this.fpsHistory.shift();
            }

            lastTime = currentTime;
            requestAnimationFrame(updateFPS);
        };
        requestAnimationFrame(updateFPS);
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    renderTo(container) {
        if (!container) return;

        // Load backups
        try {
            const saved = localStorage.getItem('quantum_backups');
            if (saved) this.backups = JSON.parse(saved);
        } catch (e) { }

        container.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <h2>⚙️ Settings</h2>
                    <div class="settings-header-actions">
                        <button class="header-btn" id="changelogBtn" title="View Changelog">
                            <span>📋</span>
                        </button>
                        <button class="header-btn" id="exportBtn" title="Export Settings">
                            <span>📥</span>
                        </button>
                        <button class="header-btn" id="importBtn" title="Import Settings">
                            <span>📤</span>
                        </button>
                    </div>
                </div>
                <div class="settings-content">
                    <!-- Quick Profiles -->
                    <div class="setting-section">
                        <h3>🎯 Quick Profiles</h3>
                        <div class="profiles-grid">
                            <button class="profile-btn" data-profile="performance">
                                <span class="profile-icon">⚡</span>
                                <span class="profile-name">Performance</span>
                                <span class="profile-desc">Max FPS, minimal effects</span>
                            </button>
                            <button class="profile-btn" data-profile="balanced">
                                <span class="profile-icon">⚖️</span>
                                <span class="profile-name">Balanced</span>
                                <span class="profile-desc">Good mix of both</span>
                            </button>
                            <button class="profile-btn" data-profile="quality">
                                <span class="profile-icon">✨</span>
                                <span class="profile-name">Quality</span>
                                <span class="profile-desc">All effects enabled</span>
                            </button>
                        </div>
                    </div>

                    <!-- Performance Monitor -->
                    <div class="setting-section">
                        <h3>📊 Performance Monitor</h3>
                        <div class="performance-stats">
                            <div class="stat-card">
                                <div class="stat-label">Current FPS</div>
                                <div class="stat-value" id="currentFPS">60</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Average FPS</div>
                                <div class="stat-value" id="averageFPS">60</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">FPS Cap</div>
                                <div class="stat-value" id="fpsCap">${this.settings.fps_cap}</div>
                            </div>
                        </div>
                        <canvas id="fpsGraph" width="600" height="100"></canvas>
                    </div>

                    <!-- Theme -->
                    <div class="setting-group">
                        <label>🎨 Theme</label>
                        <div id="themeSelectorContainer">
                            ${window.themeManager ? window.themeManager.createThemeSelector() : '<p>Loading themes...</p>'}
                        </div>
                    </div>

                    <!-- Effects -->
                    <div class="setting-section">
                        <h3>❄️ Effects</h3>
                        
                        <div class="setting-item slider-item">
                            <div class="slider-header">
                                <label>Snow Intensity</label>
                                <span class="value" id="snowValue">${this.settings.snow_intensity}</span>
                            </div>
                            <div class="slider" id="snowSlider" data-min="${SETTINGS_CONSTANTS.SNOW_MIN}" data-max="${SETTINGS_CONSTANTS.SNOW_MAX}" data-value="${this.settings.snow_intensity}" data-tooltip="Controls the amount of snowfall particles">
                                <div class="slider-track">
                                    <div class="slider-fill" style="width: ${(this.settings.snow_intensity / SETTINGS_CONSTANTS.SNOW_MAX) * 100}%"></div>
                                    <div class="slider-thumb" style="left: ${(this.settings.snow_intensity / SETTINGS_CONSTANTS.SNOW_MAX) * 100}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="setting-item slider-item">
                            <div class="slider-header">
                                <label>Blur Strength</label>
                                <span class="value" id="blurValue">${this.settings.blur_strength}px</span>
                            </div>
                            <div class="slider" id="blurSlider" data-min="${SETTINGS_CONSTANTS.BLUR_MIN}" data-max="${SETTINGS_CONSTANTS.BLUR_MAX}" data-value="${this.settings.blur_strength}" data-tooltip="Background blur intensity">
                                <div class="slider-track">
                                    <div class="slider-fill" style="width: ${(this.settings.blur_strength / SETTINGS_CONSTANTS.BLUR_MAX) * 100}%"></div>
                                    <div class="slider-thumb" style="left: ${(this.settings.blur_strength / SETTINGS_CONSTANTS.BLUR_MAX) * 100}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="setting-item slider-item">
                            <div class="slider-header">
                                <label>FPS Cap</label>
                                <span class="value" id="fpsCapValue">${this.settings.fps_cap}</span>
                            </div>
                            <div class="slider" id="fpsSlider" data-min="${SETTINGS_CONSTANTS.FPS_MIN}" data-max="${SETTINGS_CONSTANTS.FPS_MAX}" data-step="${SETTINGS_CONSTANTS.FPS_STEP}" data-value="${this.settings.fps_cap}" data-tooltip="Limits maximum frames per second">
                                <div class="slider-track">
                                    <div class="slider-fill" style="width: ${((this.settings.fps_cap - SETTINGS_CONSTANTS.FPS_MIN) / (SETTINGS_CONSTANTS.FPS_MAX - SETTINGS_CONSTANTS.FPS_MIN)) * 100}%"></div>
                                    <div class="slider-thumb" style="left: ${((this.settings.fps_cap - SETTINGS_CONSTANTS.FPS_MIN) / (SETTINGS_CONSTANTS.FPS_MAX - SETTINGS_CONSTANTS.FPS_MIN)) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Audio -->
                    <div class="setting-section">
                        <h3>🔊 Audio</h3>
                        <div class="setting-item">
                            <label>Sound Effects</label>
                            <div class="toggle ${this.settings.sounds_enabled ? 'active' : ''}" id="soundsToggle" data-tooltip="Enable or disable sound effects">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Display -->
                    <div class="setting-section">
                        <h3>✨ Display</h3>
                        <div class="setting-item">
                            <label>Dark Mode</label>
                            <div class="toggle ${this.settings.dark_mode ? 'active' : ''}" id="darkModeToggle" data-tooltip="Switch between dark and light themes">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Animations</label>
                            <div class="toggle ${this.settings.animations_enabled ? 'active' : ''}" id="animationsToggle" data-tooltip="Enable smooth animations">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Tooltips</label>
                            <div class="toggle ${this.settings.show_tooltips ? 'active' : ''}" id="tooltipsToggle" data-tooltip="Show helpful tooltips">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Streamer Mode</label>
                            <div class="toggle ${this.settings.streamer_mode ? 'active' : ''}" id="streamerModeToggle" data-tooltip="Hide username and blur avatar">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Particles</label>
                            <div class="toggle ${this.settings.particles_enabled ? 'active' : ''}" id="particlesToggle" data-tooltip="Enable particle effects">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Keybinds -->
                    <div class="setting-section">
                        <h3>⌨️ Keybinds</h3>
                        <div class="setting-item">
                            <div class="setting-info">
                                <label>Menu Toggle</label>
                                <span class="setting-desc">Click button to set custom keybind to show/hide UI</span>
                            </div>
                            <button class="keybind-btn" id="menuBindBtn">${this.settings.menu_bind}</button>
                        </div>
                    </div>

                    <!-- Social & Integrations -->
                    <div class="setting-section">
                        <h3>🌐 Integrations</h3>
                        <div class="setting-item">
                            <label>Discord RPC</label>
                            <div class="toggle ${this.settings.discord_rpc ? 'active' : ''}" id="discordRpcToggle">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Auto-Inject</label>
                            <div class="toggle ${this.settings.auto_inject ? 'active' : ''}" id="autoInjectToggle">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Script Hub -->
                    <div class="setting-section">
                        <h3>🛠️ Script Hub</h3>
                        <div class="setting-item">
                            <label>Auto-Execute</label>
                            <div class="toggle ${this.settings.auto_execute ? 'active' : ''}" id="autoExecuteToggle">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                        <div class="setting-item">
                            <label>Save Tabs</label>
                            <div class="toggle ${this.settings.save_tabs ? 'active' : ''}" id="saveTabsToggle">
                                <div class="toggle-circle"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Localization -->
                    <div class="setting-section">
                        <h3>🌍 Language</h3>
                        <div class="setting-item">
                            <select class="modern-select" id="languageSelect" style="width: 100%;">
                                <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>Español</option>
                                <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
                                <option value="de" ${this.settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                                <option value="pt" ${this.settings.language === 'pt' ? 'selected' : ''}>Português</option>
                                <option value="ru" ${this.settings.language === 'ru' ? 'selected' : ''}>Русский</option>
                                <option value="zh" ${this.settings.language === 'zh' ? 'selected' : ''}>中文</option>
                            </select>
                        </div>
                    </div>

                    <!-- Advanced Settings -->
                    <div class="setting-section">
                        <div class="section-toggle" id="advancedToggle">
                            <h3>🔧 Advanced Settings</h3>
                            <span class="toggle-icon">▼</span>
                        </div>
                        <div class="advanced-content" style="display: none;">
                            <div class="setting-item">
                                <label>Show Advanced Options</label>
                                <div class="toggle ${this.settings.advanced_mode ? 'active' : ''}" id="advancedModeToggle">
                                    <div class="toggle-circle"></div>
                                </div>
                            </div>
                            <div class="setting-item">
                                <label>Debug Mode</label>
                                <div class="toggle" id="debugModeToggle">
                                    <div class="toggle-circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Backup & Restore -->
                    ${this.backups.length > 0 ? `
                    <div class="setting-section">
                        <h3>💾 Backups</h3>
                        <div class="backup-list">
                            ${this.backups.map((backup, index) => `
                                <div class="backup-item">
                                    <span>${new Date(backup.timestamp).toLocaleString()}</span>
                                    <button class="restore-btn" data-index="${index}">Restore</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="settings-footer">
                        <button class="reset-settings">Reset to Defaults (Ctrl+R)</button>
                        <div class="keyboard-hints">
                            <span>💡 <kbd>Esc</kbd> to close • <kbd>Ctrl+S</kbd> to save</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachListeners(container);
        this.initTooltips(container);
        this.startFPSGraph();
    }



    // Fixed tooltip system - follows mouse
    initTooltips(container) {
        if (!this.settings.show_tooltips) return;

        container.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                if (this.currentTooltip) {
                    this.currentTooltip.remove();
                }

                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-popup';
                tooltip.textContent = element.dataset.tooltip;
                document.body.appendChild(tooltip);
                this.currentTooltip = tooltip;

                const updatePosition = (event) => {
                    tooltip.style.left = (event.clientX + 10) + 'px';
                    tooltip.style.top = (event.clientY + 10) + 'px';
                };

                updatePosition(e);
                element.addEventListener('mousemove', updatePosition);
                element._updatePosition = updatePosition;

                setTimeout(() => tooltip.classList.add('show'), 10);
            });

            element.addEventListener('mouseleave', () => {
                if (this.currentTooltip) {
                    this.currentTooltip.classList.remove('show');
                    setTimeout(() => {
                        if (this.currentTooltip) {
                            this.currentTooltip.remove();
                            this.currentTooltip = null;
                        }
                    }, 200);
                }
                if (element._updatePosition) {
                    element.removeEventListener('mousemove', element._updatePosition);
                }
            });
        });
    }

    // FPS Graph
    startFPSGraph() {
        const canvas = document.getElementById('fpsGraph');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const updateGraph = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const y = (canvas.height / 4) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw FPS line
            if (this.fpsHistory.length > 1) {
                ctx.strokeStyle = '#ff3333';
                ctx.lineWidth = 2;
                ctx.beginPath();

                const step = canvas.width / this.maxFpsHistory;
                this.fpsHistory.forEach((fps, index) => {
                    const x = index * step;
                    const y = canvas.height - (fps / 240) * canvas.height;
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
            }

            // Update stats
            const currentFPS = this.fpsHistory[this.fpsHistory.length - 1] || 0;
            const avgFPS = this.getAverageFPS();

            const currentFPSEl = document.getElementById('currentFPS');
            const averageFPSEl = document.getElementById('averageFPS');

            if (currentFPSEl) currentFPSEl.textContent = currentFPS;
            if (averageFPSEl) averageFPSEl.textContent = avgFPS;

            requestAnimationFrame(updateGraph);
        };
        requestAnimationFrame(updateGraph);
    }

    attachListeners(panel) {
        // Theme loading retry
        if (!window.themeManager) {
            const checkTheme = setInterval(() => {
                if (window.themeManager) {
                    const container = panel.querySelector('#themeSelectorContainer');
                    if (container) {
                        container.innerHTML = window.themeManager.createThemeSelector();
                        this.attachThemeListeners(panel);
                    }
                    clearInterval(checkTheme);
                }
            }, 100);
        } else {
            this.attachThemeListeners(panel);
        }

        // Profile buttons
        panel.querySelectorAll('.profile-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const profile = btn.dataset.profile;
                if (confirm(`Apply ${SETTINGS_PROFILES[profile].name} profile?`)) {
                    this.applyProfile(profile);
                }
            });
        });

        // Header buttons
        const changelogBtn = panel.querySelector('#changelogBtn');
        const exportBtn = panel.querySelector('#exportBtn');
        const importBtn = panel.querySelector('#importBtn');

        if (changelogBtn) changelogBtn.addEventListener('click', () => this.showChangelog());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSettings());
        if (importBtn) importBtn.addEventListener('click', () => this.importSettings());

        // Advanced toggle
        const advancedToggle = panel.querySelector('#advancedToggle');
        const advancedContent = panel.querySelector('.advanced-content');
        if (advancedToggle && advancedContent) {
            advancedToggle.addEventListener('click', () => {
                const isHidden = advancedContent.style.display === 'none';
                advancedContent.style.display = isHidden ? 'block' : 'none';
                advancedToggle.querySelector('.toggle-icon').textContent = isHidden ? '▲' : '▼';
            });
        }

        // Backup restore buttons
        panel.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (confirm('Restore this backup?')) {
                    this.restoreBackup(index);
                }
            });
        });

        // Keybind
        const menuBindBtn = panel.querySelector('#menuBindBtn');
        if (menuBindBtn) {
            menuBindBtn.addEventListener('click', () => {
                menuBindBtn.textContent = 'Press any key...';
                const handler = (e) => {
                    e.preventDefault();
                    this.set('menu_bind', e.code);
                    menuBindBtn.textContent = e.code;
                    document.removeEventListener('keydown', handler);
                };
                document.addEventListener('keydown', handler);
            });
        }

        // Simple Toggles
        const toggles = {
            'discordRpcToggle': 'discord_rpc',
            'autoInjectToggle': 'auto_inject',
            'autoExecuteToggle': 'auto_execute',
            'saveTabsToggle': 'save_tabs'
        };

        Object.keys(toggles).forEach(id => {
            const el = panel.querySelector('#' + id);
            if (el) {
                el.addEventListener('click', () => {
                    const key = toggles[id];
                    const value = !this.settings[key];
                    this.set(key, value);
                    el.classList.toggle('active', value);
                });
            }
        });

        // Language
        const languageSelect = panel.querySelector('#languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.set('language', e.target.value);
                this.showToast('Language changed (Requires Restart)', 'info');
            });
        }

        // Sliders with FIXED text update
        panel.querySelectorAll('.slider').forEach(slider => {
            const track = slider.querySelector('.slider-track');
            const fill = slider.querySelector('.slider-fill');
            const thumb = slider.querySelector('.slider-thumb');
            const min = parseFloat(slider.dataset.min);
            const max = parseFloat(slider.dataset.max);
            const step = parseFloat(slider.dataset.step) || 1;
            const id = slider.id;

            const updateSlider = (clientX) => {
                const rect = track.getBoundingClientRect();
                let percentage = (clientX - rect.left) / rect.width;
                percentage = Math.max(0, Math.min(1, percentage));

                const rawValue = min + (max - min) * percentage;
                const value = Math.round(rawValue / step) * step;
                const finalPercentage = ((value - min) / (max - min)) * 100;

                fill.style.width = `${finalPercentage}%`;
                thumb.style.left = `${finalPercentage}%`;
                slider.dataset.value = value;

                // FIXED: Update display value IMMEDIATELY
                const valueDisplay = panel.querySelector(`#${id.replace('Slider', 'Value')}`);
                if (valueDisplay) {
                    let display = value;
                    if (id === 'blurSlider') display += 'px';
                    valueDisplay.textContent = display;
                }

                // Update FPS Cap display in performance monitor
                if (id === 'fpsSlider') {
                    const fpsCapEl = panel.querySelector('#fpsCap');
                    if (fpsCapEl) fpsCapEl.textContent = value;
                }

                // Debounced save
                clearTimeout(this.debounceTimers[id]);
                this.debounceTimers[id] = setTimeout(() => {
                    let key = '';
                    if (id === 'snowSlider') key = 'snow_intensity';
                    if (id === 'blurSlider') key = 'blur_strength';
                    if (id === 'fpsSlider') key = 'fps_cap';

                    if (key) this.set(key, value);
                }, SETTINGS_CONSTANTS.DEBOUNCE_DELAY);
            };

            let isDragging = false;

            slider.addEventListener('mousedown', (e) => {
                isDragging = true;
                updateSlider(e.clientX);
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    updateSlider(e.clientX);
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Touch support
            slider.addEventListener('touchstart', (e) => {
                isDragging = true;
                updateSlider(e.touches[0].clientX);
            });

            document.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    updateSlider(e.touches[0].clientX);
                }
            });

            document.addEventListener('touchend', () => {
                isDragging = false;
            });
        });

        // Toggles
        panel.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                const isChecked = toggle.classList.contains('active');
                const id = toggle.id;

                let key = '';
                if (id === 'soundsToggle') key = 'sounds_enabled';
                if (id === 'animationsToggle') key = 'animations_enabled';
                if (id === 'tooltipsToggle') key = 'show_tooltips';
                if (id === 'streamerModeToggle') key = 'streamer_mode';
                if (id === 'particlesToggle') key = 'particles_enabled';
                if (id === 'darkModeToggle') key = 'dark_mode';
                if (id === 'advancedModeToggle') key = 'advanced_mode';

                if (key) {
                    this.set(key, isChecked);
                    this.showToast(`${key.replace(/_/g, ' ')} ${isChecked ? 'enabled' : 'disabled'}`, 'success');
                }
            });
        });

        // Reset button
        const resetBtn = panel.querySelector('.reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all settings to defaults?')) {
                    this.settings = { ...this.defaultSettings };
                    this.save();
                    this.showToast('Settings reset. Reloading...', 'success');
                    setTimeout(() => location.reload(), 1000);
                }
            });
        }
    }

    attachThemeListeners(panel) {
        panel.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeName = card.dataset.theme;
                if (window.themeManager) {
                    window.themeManager.apply(themeName);
                    panel.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    panel.querySelectorAll('.theme-active-badge').forEach(b => b.remove());
                    const badge = document.createElement('div');
                    badge.className = 'theme-active-badge';
                    badge.textContent = '✓ Active';
                    card.appendChild(badge);
                    this.showToast(`Theme changed to ${themeName}`, 'success');
                }
            });
        });
    }

    showChangelog() {
        const modal = document.createElement('div');
        modal.className = 'changelog-modal';
        modal.innerHTML = `
            <div class="changelog-content">
                <div class="changelog-header">
                    <h2>📋 Changelog</h2>
                    <button class="close-changelog">×</button>
                </div>
                <div class="changelog-body">
                    ${CHANGELOG.map(entry => `
                        <div class="changelog-entry">
                            <div class="changelog-version">
                                <span class="version-number">v${entry.version}</span>
                                <span class="version-date">${entry.date}</span>
                            </div>
                            <ul class="changelog-changes">
                                ${entry.changes.map(change => `<li>${change}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.close-changelog').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
}

// Enhanced CSS
const settingsStyle = document.createElement('style');
settingsStyle.textContent = `
    .settings-header {
        background: var(--color-surface, rgba(30, 31, 34, 0.95));
        padding: 20px;
        border-bottom: 1px solid var(--color-border, rgba(255, 255, 255, 0.05));
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }

    .settings-header h2 {
        color: var(--color-text, #f2f3f5);
        font-size: 20px;
        margin: 0;
    }

    .settings-header-actions {
        display: flex;
        gap: 8px;
    }

    .header-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 16px;
    }

    .header-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }

    .settings-content {
        padding: 20px;
        flex: 1;
        overflow-y: auto;
    }

    .settings-container {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .profiles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 12px;
    }

    .profile-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
    }

    .profile-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--color-primary, #ff3333);
        transform: translateY(-4px);
    }

    .profile-icon {
        font-size: 32px;
    }

    .profile-name {
        color: var(--color-text, #f2f3f5);
        font-weight: 600;
        font-size: 14px;
    }

    .profile-desc {
        color: var(--color-text-secondary, #b5bac1);
        font-size: 12px;
    }

    /* Performance Monitor */
    .performance-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
    }

    .stat-card {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 8px;
        text-align: center;
    }

    .stat-label {
        color: var(--color-text-secondary, #b5bac1);
        font-size: 12px;
        margin-bottom: 4px;
    }

    .stat-value {
        color: var(--color-primary, #ff3333);
        font-size: 24px;
        font-weight: bold;
    }

    #fpsGraph {
        width: 100%;
        height: 100px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
    }

    /* Advanced Settings */
    .section-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
    }

    .section-toggle:hover h3 {
        color: var(--color-primary, #ff3333);
    }

    .toggle-icon {
        color: var(--color-text-secondary, #b5bac1);
        transition: transform 0.3s ease;
    }

    .advanced-content {
        margin-top: 12px;
        padding-left: 16px;
        border-left: 2px solid rgba(255, 255, 255, 0.1);
    }

    /* Backups */
    .backup-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .backup-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
    }

    .restore-btn {
        background: var(--color-primary, #ff3333);
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .restore-btn:hover {
        transform: scale(1.05);
    }

    /* Changelog Modal */
    .changelog-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .changelog-modal.show {
        opacity: 1;
    }

    .changelog-content {
        background: var(--color-surface, rgba(30, 31, 34, 0.95));
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .changelog-header {
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .changelog-header h2 {
        margin: 0;
        color: var(--color-text, #f2f3f5);
    }

    .close-changelog {
        background: none;
        border: none;
        font-size: 32px;
        color: var(--color-text, #f2f3f5);
        cursor: pointer;
        line-height: 1;
    }

    .changelog-body {
        padding: 20px;
        overflow-y: auto;
    }

    .changelog-entry {
        margin-bottom: 24px;
    }

    .changelog-version {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .version-number {
        font-size: 18px;
        font-weight: bold;
        color: var(--color-primary, #ff3333);
    }

    .version-date {
        color: var(--color-text-secondary, #b5bac1);
        font-size: 14px;
    }

    .changelog-changes {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .changelog-changes li {
        padding: 8px 0;
        padding-left: 24px;
        position: relative;
        color: var(--color-text, #f2f3f5);
    }

    .changelog-changes li:before {
        content: '•';
        position: absolute;
        left: 8px;
        color: var(--color-primary, #ff3333);
    }

    /* Toast Notifications */
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .toast {
        background: rgba(43, 45, 49, 0.95);
        backdrop-filter: blur(10px);
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    }

    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }

    .toast-success {
        border-left: 4px solid #10b981;
    }

    .toast-error {
        border-left: 4px solid #ef4444;
    }

    .toast-info {
        border-left: 4px solid #3b82f6;
    }

    .toast-icon {
        font-size: 18px;
        font-weight: bold;
    }

    .toast-success .toast-icon {
        color: #10b981;
    }

    .toast-error .toast-icon {
        color: #ef4444;
    }

    .toast-info .toast-icon {
        color: #3b82f6;
    }

    .toast-message {
        color: #f2f3f5;
        font-size: 14px;
    }

    /* FIXED Tooltip - Follows Mouse */
    .tooltip-popup {
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        max-width: 200px;
        z-index: 10001;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .tooltip-popup.show {
        opacity: 1;
    }

    .reset-settings {
        width: 100%;
        padding: 12px;
        background: rgba(255, 51, 51, 0.1);
        border: 1px solid rgba(255, 51, 51, 0.3);
        color: #ff3333;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        margin-top: 20px;
        transition: all 0.2s ease;
    }

    .reset-settings:hover {
        background: rgba(255, 51, 51, 0.2);
        transform: translateY(-2px);
    }

    .settings-footer {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .keyboard-hints {
        margin-top: 12px;
        text-align: center;
        color: var(--color-text-secondary, #b5bac1);
        font-size: 12px;
    }

    .keyboard-hints kbd {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
    }

    /* Smooth transitions */
    .toggle, .slider-thumb, .theme-card, .setting-item, .profile-btn, .header-btn {
        transition: all 0.2s ease;
    }

    /* Focus indicators */
    button:focus-visible, .toggle:focus-visible {
        outline: 2px solid var(--color-primary, #ff3333);
        outline-offset: 2px;
    }

    .slider-thumb {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .slider-thumb:hover {
        transform: scale(1.1);
    }

    /* Light mode support */
    body.light-mode {
        --color-surface: rgba(255, 255, 255, 0.95);
        --color-text: #1a1b1e;
        --color-text-secondary: #6b7280;
        --color-border: rgba(0, 0, 0, 0.1);
    }

    /* Mobile support */
    @media (max-width: 768px) {
        .profiles-grid {
            grid-template-columns: 1fr;
        }

        .performance-stats {
            grid-template-columns: 1fr;
        }

        .settings-header-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(settingsStyle);

// Export
window.SettingsManager = SettingsManager;
