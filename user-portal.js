class UserPortal {
    constructor() {
        this.keys = JSON.parse(localStorage.getItem('admin_keys')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('user_auth_session')) || null;
        this.allUserData = JSON.parse(localStorage.getItem('quantum_user_data_store')) || {};

        this.activeTab = 'dashboard';
        this.scripts = [];

        if (!localStorage.getItem('device_hwid')) {
            localStorage.setItem('device_hwid', 'HWID-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now().toString(16).toUpperCase());
        }
        this.deviceHwid = localStorage.getItem('device_hwid');

        // Persistent Chat Data
        this.chatMessages = JSON.parse(localStorage.getItem('quantum_global_chat')) || [];
        this.chatRefreshInterval = null; // Auto-refresh timer

        // Music Player State
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isLooping = false;
        this.showLyrics = false;
        this.currentLyrics = "No lyrics available.";
        this.audioPlayer = new Audio();
        this.audioPlayer.crossOrigin = "anonymous";

        // Playlist now acts as the "Queue" or "Search Results"
        this.playlist = [
            { title: "Search for songs...", artist: "System", url: "", cover: "https://via.placeholder.com/200x200?text=Quantum" }
        ];

        // Local Lyrics Dictionary (Fallback)
        this.lyricsDB = {
            "Phantom (Blacked Out)": "[Chorus: EsDeeKid]\nBlacked out like a phantom (Phantom)\nMe phone keeps having a tantrum (Tantrum)\nEmo boy, I got the party lit (Party lit)\nThis song your national anthem (Anthem)\nFuck gold, I want platinum (Platinum)\nMe bros sipping on Magnums (Magnums)\nGot girls flocking all over\n'Cause I'm young, lit and I'm handsome (Okay)\n\nIf he talks shit, then I'll bang him (Bang him)\nYou're banned out of the mansion (Mansion)\nYou've never got no motion, lad\nYou've never got no action\nBitch, I'm all about me passion (Passion)\nMusic, money, and fashion (Fashion)\nDrugs and girls come later (Woah)\nIn the end, it's all a distraction",
            "Fade": "You were the shadow to my light\nDid you feel us?\nAnother start\nYou fade away\nAfraid our aim is out of sight\nWanna see us\nAlive\n\nWhere are you now?\nWhere are you now?\nWhere are you now?\nWas it all in my fantasy?\nWhere are you now?\nWere you only imaginary?"
        };

        this.searchQuery = "";
        this.searchTimeout = null;

        // Rank Definitions
        this.rankDefinitions = {
            'Founder': { color: '#00ffff', icon: 'fa-snowflake', priority: 100 },
            'Developer': { color: '#00FF00', icon: 'fa-terminal', priority: 90 },
            'Admin': { color: '#FF4500', icon: 'fa-user-shield', priority: 80 },
            'Moderator': { color: '#1E90FF', icon: 'fa-gavel', priority: 70 },
            'VIP': { color: '#E0FFFF', icon: 'fa-gem', priority: 50 },
            'User': { color: '#9ca3af', icon: 'fa-user', priority: 10 }
        };

        // Centralized Themes Definition
        this.availableThemes = [
            {
                name: "default",
                author: "System",
                downloads: 100000,
                colors: {
                    '--bg-primary': '#0f1115',
                    '--bg-secondary': '#1a1d23',
                    '--accent-color': '#3b82f6',
                    '--accent-glow': 'rgba(59, 130, 246, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#9ca3af',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#3b82f6'
            },
            {
                name: "midnight",
                author: "System",
                downloads: 50000,
                colors: {
                    '--bg-primary': '#020617',
                    '--bg-secondary': '#0f172a',
                    '--accent-color': '#6366f1',
                    '--accent-glow': 'rgba(99, 102, 241, 0.5)',
                    '--text-primary': '#f8fafc',
                    '--text-secondary': '#94a3b8',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#6366f1'
            },
            {
                name: "ocean",
                author: "System",
                downloads: 45000,
                colors: {
                    '--bg-primary': '#082f49',
                    '--bg-secondary': '#0c4a6e',
                    '--accent-color': '#0ea5e9',
                    '--accent-glow': 'rgba(14, 165, 233, 0.5)',
                    '--text-primary': '#f0f9ff',
                    '--text-secondary': '#bae6fd',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#0ea5e9'
            },
            {
                name: "sunset",
                author: "System",
                downloads: 30000,
                colors: {
                    '--bg-primary': '#2a1b1b',
                    '--bg-secondary': '#451a1a',
                    '--accent-color': '#f43f5e',
                    '--accent-glow': 'rgba(244, 63, 94, 0.5)',
                    '--text-primary': '#fff1f2',
                    '--text-secondary': '#fda4af',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#f43f5e'
            },
            {
                name: "hacker",
                author: "System",
                downloads: 1337,
                colors: {
                    '--bg-primary': '#000000',
                    '--bg-secondary': '#0a0a0a',
                    '--accent-color': '#00ff00',
                    '--accent-glow': 'rgba(0, 255, 0, 0.5)',
                    '--text-primary': '#00ff00',
                    '--text-secondary': '#008f00',
                    '--font-family': "'Courier New', monospace"
                },
                previewColor: '#00ff00'
            },
            {
                name: "Neon Nights",
                author: "Quantum",
                downloads: 15420,
                colors: {
                    '--bg-primary': '#0f0c29',
                    '--bg-secondary': '#302b63',
                    '--accent-color': '#ff00cc',
                    '--accent-glow': 'rgba(255, 0, 204, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#b39ddb',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#ff00cc'
            },
            {
                name: "Forest",
                author: "Nature",
                downloads: 8340,
                colors: {
                    '--bg-primary': '#1a2f1a',
                    '--bg-secondary': '#2d4a2d',
                    '--accent-color': '#4caf50',
                    '--accent-glow': 'rgba(76, 175, 80, 0.5)',
                    '--text-primary': '#e8f5e9',
                    '--text-secondary': '#a5d6a7',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#4caf50'
            },
            {
                name: "Royal Gold",
                author: "King",
                downloads: 21050,
                colors: {
                    '--bg-primary': '#1c1c1c',
                    '--bg-secondary': '#2c2c2c',
                    '--accent-color': '#ffd700',
                    '--accent-glow': 'rgba(255, 215, 0, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#e0e0e0',
                    '--font-family': "'Playfair Display', serif"
                },
                previewColor: '#ffd700'
            },
            {
                name: "Cherry Blossom",
                author: "Sakura",
                downloads: 12600,
                colors: {
                    '--bg-primary': '#fff0f5',
                    '--bg-secondary': '#ffe4e1',
                    '--accent-color': '#ff69b4',
                    '--accent-glow': 'rgba(255, 105, 180, 0.5)',
                    '--text-primary': '#4a4a4a',
                    '--text-secondary': '#8b8b8b',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#ff69b4'
            },
            {
                name: "Void Walker",
                author: "Unknown",
                downloads: 5432,
                type: 'premium',
                code: 'VOID_ENTRY',
                colors: {
                    '--bg-primary': '#050505',
                    '--bg-secondary': '#0a0a0a',
                    '--accent-color': '#9d00ff',
                    '--accent-glow': 'rgba(157, 0, 255, 0.5)',
                    '--text-primary': '#e0e0e0',
                    '--text-secondary': '#4a4a4a',
                    '--font-family': "'Courier New', monospace"
                },
                previewColor: '#9d00ff'
            },
            {
                name: "Glitch Protocol",
                author: "System",
                downloads: 3210,
                type: 'premium',
                code: 'SYSTEM_FAILURE',
                colors: {
                    '--bg-primary': '#000000',
                    '--bg-secondary': '#111111',
                    '--accent-color': '#ff0000',
                    '--accent-glow': 'rgba(255, 0, 0, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#ff0000',
                    '--font-family': "'Courier New', monospace"
                },
                previewColor: '#ff0000'
            },
            {
                name: "Abyssal Void",
                author: "DeepOne",
                downloads: 1500,
                type: 'premium',
                code: 'DEEP_DIVE',
                colors: {
                    '--bg-primary': '#000000',
                    '--bg-secondary': '#02020a',
                    '--accent-color': '#000080',
                    '--accent-glow': 'rgba(0, 0, 128, 0.5)',
                    '--text-primary': '#e0e0e0',
                    '--text-secondary': '#505070',
                    '--font-family': "'Cinzel', serif"
                },
                previewColor: '#000080'
            },
            {
                name: "Inferno",
                author: "Blaze",
                downloads: 2800,
                type: 'premium',
                code: 'BLAZE_ON',
                colors: {
                    '--bg-primary': '#1a0500',
                    '--bg-secondary': '#2d0a00',
                    '--accent-color': '#ff4500',
                    '--accent-glow': 'rgba(255, 69, 0, 0.5)',
                    '--text-primary': '#ffcc00',
                    '--text-secondary': '#ff8800',
                    '--font-family': "'Impact', sans-serif"
                },
                previewColor: '#ff4500'
            },
            {
                name: "Golden Era",
                author: "Midas",
                downloads: 45000,
                type: 'premium',
                code: 'RICH_KID',
                colors: {
                    '--bg-primary': '#1a1a1a',
                    '--bg-secondary': '#262626',
                    '--accent-color': '#d4af37',
                    '--accent-glow': 'rgba(212, 175, 55, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#d4af37',
                    '--font-family': "'Playfair Display', serif"
                },
                previewColor: '#d4af37'
            },
            {
                name: "Radioactive",
                author: "Hazmat",
                downloads: 950,
                type: 'premium',
                code: 'TOXIC_WASTE',
                colors: {
                    '--bg-primary': '#0a0f0a',
                    '--bg-secondary': '#141f14',
                    '--accent-color': '#39ff14',
                    '--accent-glow': 'rgba(57, 255, 20, 0.5)',
                    '--text-primary': '#ccffcc',
                    '--text-secondary': '#39ff14',
                    '--font-family': "'Courier New', monospace"
                },
                previewColor: '#39ff14'
            },
            {
                name: "VIP Lounge",
                author: "Quantum VIP",
                requiredRank: 'VIP',
                downloads: 888,
                colors: {
                    '--bg-primary': '#101010',
                    '--bg-secondary': '#1a1a1a',
                    '--accent-color': '#e5c100',
                    '--accent-glow': 'rgba(229, 193, 0, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#e5c100',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#e5c100'
            },
            {
                name: "Mod Shield",
                author: "Quantum Staff",
                requiredRank: 'Moderator',
                downloads: 420,
                colors: {
                    '--bg-primary': '#0d1117',
                    '--bg-secondary': '#161b22',
                    '--accent-color': '#58a6ff',
                    '--accent-glow': 'rgba(88, 166, 255, 0.5)',
                    '--text-primary': '#c9d1d9',
                    '--text-secondary': '#8b949e',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#58a6ff'
            },
            {
                name: "Admin Power",
                author: "Quantum Staff",
                requiredRank: 'Admin',
                downloads: 100,
                colors: {
                    '--bg-primary': '#1a0000',
                    '--bg-secondary': '#2b0000',
                    '--accent-color': '#ff3333',
                    '--accent-glow': 'rgba(255, 51, 51, 0.5)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#ff9999',
                    '--font-family': "'Inter', sans-serif"
                },
                previewColor: '#ff3333'
            },
            {
                name: "Dev Terminal",
                author: "Quantum Dev",
                requiredRank: 'Developer',
                downloads: 50,
                colors: {
                    '--bg-primary': '#0d1117',
                    '--bg-secondary': '#000000',
                    '--accent-color': '#238636',
                    '--accent-glow': 'rgba(35, 134, 54, 0.5)',
                    '--text-primary': '#e6edf3',
                    '--text-secondary': '#7d8590',
                    '--font-family': "'Fira Code', monospace"
                },
                previewColor: '#238636'
            },
            {
                name: "Founder's Legacy",
                author: "The Creator",
                requiredRank: 'Founder',
                downloads: 1,
                colors: {
                    '--bg-primary': '#050505',
                    '--bg-secondary': '#0a0a0a',
                    '--accent-color': '#00ffff',
                    '--accent-glow': 'rgba(0, 255, 255, 0.6)',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#00ffff',
                    '--font-family': "'Orbitron', sans-serif"
                },
                previewColor: '#00ffff'
            }
        ];

        this.audioPlayer.addEventListener('ended', () => {
            if (this.isLooping) {
                this.audioPlayer.currentTime = 0;
                this.audioPlayer.play();
            } else {
                this.nextTrack();
            }
        });

        this.init();

        // Poll for chat updates
        setInterval(() => {
            const storedChat = JSON.parse(localStorage.getItem('quantum_global_chat')) || [];
            if (storedChat.length !== this.chatMessages.length) {
                this.chatMessages = storedChat;
                if (this.activeTab === 'chat') this.renderChatContent();
            }
        }, 1000);

        // Visualizer Loop
        this.visualizerInterval = null;
    }

    init() {
        this.initParticles();
        if (this.currentUser) {
            const keyData = this.keys.find(k => k.key === this.currentUser.key);
            if (keyData && keyData.status === 'active') {
                this.loadUserData(this.currentUser.key);
                this.renderPortal(keyData);
            } else {
                this.logout();
            }
        } else {
            this.renderLogin();
        }

        // Ghost Mode Listener
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'g' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                this.toggleGhostMode();
            }
        });
    }

    loadUserData(key) {
        if (!this.allUserData[key]) {
            this.allUserData[key] = {
                scripts: [],
                theme: 'default',
                avatar: null,
                username: 'Quantum User',
                rank: 'User',
                badges: ['Early Access'],
                spotifyConnected: false,
                reputation: 0,
                installedThemes: []
            };
        }
        this.currentUser.theme = this.allUserData[key].theme;
        this.currentUser.avatar = this.allUserData[key].avatar;
        this.currentUser.username = this.allUserData[key].username;
        this.scripts = this.allUserData[key].scripts || [];
        this.rank = this.allUserData[key].rank || 'User';
        this.badges = this.allUserData[key].badges || [];
        this.spotifyConnected = this.allUserData[key].spotifyConnected || false;
        this.reputation = this.allUserData[key].reputation || 0;
        this.installedThemes = this.allUserData[key].installedThemes || [];
    }

    saveUserData() {
        if (this.currentUser && this.currentUser.key) {
            this.allUserData[this.currentUser.key] = {
                scripts: this.scripts,
                theme: this.currentUser.theme,
                avatar: this.currentUser.avatar,
                username: this.currentUser.username,
                rank: this.rank,
                badges: this.badges,
                spotifyConnected: this.spotifyConnected,
                reputation: this.reputation,
                installedThemes: this.installedThemes
            };
            localStorage.setItem('quantum_user_data_store', JSON.stringify(this.allUserData));
            localStorage.setItem('user_auth_session', JSON.stringify(this.currentUser));
        }
    }

    initParticles() {
        if (window.particlesJS) {
            particlesJS('particles-js', {
                "particles": {
                    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": "#ffffff" },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.5, "random": false },
                    "size": { "value": 3, "random": true },
                    "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
                    "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                    "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } }
                },
                "retina_detect": true
            });
        }
    }

    renderLogin() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-container">
                <div class="glass-card">
                    <div class="brand-header">
                        <div class="brand-logo" style="width: 60px; height: 60px; margin: 0 auto 15px auto;">
                            <img src="logo.png" alt="Quantum Logo" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                        <h1 class="brand-title">Quantum Portal</h1>
                        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 5px;">Enter your access key to continue</p>
                    </div>
                    <div class="input-group">
                        <input type="text" id="keyInput" class="modern-input" placeholder="QTM_API_..." autocomplete="off">
                    </div>
                    <button id="loginBtn" class="btn-primary" style="margin-bottom: 15px;">
                        Access Dashboard <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>
                    </button>
                    <button class="btn-primary" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); font-size: 14px; padding: 10px;" onclick="window.userPortal.copyDeviceHwid()">
                        <i class="fas fa-fingerprint"></i> Copy HWID
                    </button>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://discord.gg/KjuYafU7UB" target="_blank" style="color: var(--text-secondary); font-size: 12px; text-decoration: none;">Don't have a key? Purchase here</a>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('keyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    copyDeviceHwid() {
        navigator.clipboard.writeText(this.deviceHwid).then(() => {
            this.showNotification('HWID copied to clipboard!', 'success');
        });
    }

    handleLogin() {
        this.keys = JSON.parse(localStorage.getItem('admin_keys')) || [];
        const input = document.getElementById('keyInput');
        const keyStr = input.value.trim();

        if (!keyStr) {
            this.showNotification('Please enter a key', 'error');
            return;
        }

        const keyData = this.keys.find(k => k.key === keyStr);

        if (!keyData) {
            this.showNotification('Invalid Key', 'error');
            return;
        }

        if (keyData.status !== 'active') {
            this.showNotification(`Key is ${keyData.status}`, 'warning');
            return;
        }

        this.currentUser = {
            key: keyData.key,
            loginTime: Date.now()
        };

        this.loadUserData(keyData.key);
        this.saveUserData();

        this.showNotification('Welcome back!', 'success');
        this.renderPortal(keyData);
    }

    renderPortal(keyData) {
        const app = document.getElementById('app');
        const isMobile = window.innerWidth <= 768;
        const rankData = this.rankDefinitions[this.rank] || this.rankDefinitions['User'];

        app.innerHTML = `
            <div class="portal-layout">
                <div class="portal-sidebar">
                    <div class="brand-header" style="margin-bottom: 40px; text-align: left;">
                        <div class="brand-logo" style="width: 40px; height: 40px; margin: 0 0 10px 0;">
                            <img src="logo.png" alt="Quantum Logo" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                        <h2 class="brand-title" style="font-size: 20px;">Quantum</h2>
                    </div>
                    
                    <nav class="portal-nav">
                        <a href="#" class="nav-item ${this.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                            <i class="fas fa-home"></i> Dashboard
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'chat' ? 'active' : ''}" data-tab="chat">
                            <i class="fas fa-comments"></i> Global Chat
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'marketplace' ? 'active' : ''}" data-tab="marketplace">
                            <i class="fas fa-store"></i> Marketplace
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'music' ? 'active' : ''}" data-tab="music">
                            <i class="fab fa-spotify"></i> Music
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'scripts' ? 'active' : ''}" data-tab="scripts">
                            <i class="fas fa-code"></i> My Scripts
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'news' ? 'active' : ''}" data-tab="news">
                            <i class="fas fa-newspaper"></i> News
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
                            <i class="fas fa-user-cog"></i> Profile
                        </a>
                        <a href="#" class="nav-item ${this.activeTab === 'support' ? 'active' : ''}" data-tab="support">
                            <i class="fas fa-headset"></i> Support
                        </a>
                    </nav>

                    <div style="margin-top: auto;">
                        ${isMobile ? `
                            <div class="mobile-companion-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align: center; font-size: 12px;">
                                <i class="fas fa-mobile-alt"></i> Mobile Companion Active
                            </div>
                        ` : ''}
                        <div class="user-profile" style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; margin-bottom: 15px;">
                            <div class="avatar" style="width: 32px; height: 32px; font-size: 14px; overflow: hidden; position: relative;">
                                ${this.currentUser.avatar ? `<img src="${this.currentUser.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-user"></i>'}
                            </div>
                            <div class="user-info">
                                <h3 style="font-size: 14px;">
                                    ${this.currentUser.username || 'User'}
                                    <i class="fas ${rankData.icon}" style="color: ${rankData.color}; font-size: 12px; margin-left: 5px;" title="${this.rank}"></i>
                                </h3>
                                <span style="font-size: 10px; color: ${rankData.color};">${this.rank}</span>
                            </div>
                        </div>
                        <button class="logout-btn" style="width: 100%;" onclick="window.userPortal.logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>

                <div class="portal-content" id="portalContent">
                    ${this.getTabContent(this.activeTab, keyData)}
                </div>
            </div>
            <input type="file" id="avatarUpload" accept="image/*" style="display: none;" onchange="window.userPortal.handleAvatarUpload(this)">
        `;

        this.attachNavListeners(keyData);
        this.applyTheme(this.currentUser.theme || 'default');

        if (this.activeTab === 'music' && this.spotifyConnected) {
            this.startVisualizer();
        } else {
            this.stopVisualizer();
        }
    }

    getRankColor(rank) {
        return (this.rankDefinitions[rank] || this.rankDefinitions['User']).color;
    }

    getTabContent(tab, keyData) {
        switch (tab) {
            case 'dashboard': return this.renderDashboardContent(keyData);
            case 'chat': return this.renderChatContent();
            case 'marketplace': return this.renderMarketplaceContent();
            case 'music': return this.renderMusicContent();
            case 'scripts': return this.renderScriptsContent();
            case 'news': return this.renderNewsContent();
            case 'profile': return this.renderProfileContent();
            case 'support': return this.renderSupportContent();
            default: return this.renderDashboardContent(keyData);
        }
    }

    renderDashboardContent(keyData) {
        let timeRemaining = 'Lifetime';
        if (keyData.expiresAt) {
            const diff = keyData.expiresAt - Date.now();
            timeRemaining = diff > 0 ? `${Math.floor(diff / (1000 * 60 * 60 * 24))} Days` : 'Expired';
        }

        return `
            <h2 style="margin-bottom: 20px;">Dashboard</h2>
            
            <div class="status-widget glass-card" style="margin-bottom: 25px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--success);">
                <div>
                    <h4 style="margin-bottom: 5px;">System Status</h4>
                    <p style="font-size: 12px; color: var(--text-secondary);">All systems operational</p>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--success); font-weight: bold; font-size: 14px;"><i class="fas fa-check-circle"></i> UNDETECTED</div>
                    <div style="font-size: 10px; color: var(--text-secondary);">Last updated: Just now</div>
                    <div style="font-size: 10px; color: var(--accent-color); margin-top: 2px;"><i class="fas fa-wifi"></i> WebSocket: Connected</div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-details"><h4>Status</h4><p style="color: var(--success);">Active</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: var(--accent-color);"><i class="fas fa-clock"></i></div>
                    <div class="stat-details"><h4>Time Remaining</h4><p>${timeRemaining}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning);"><i class="fas fa-shield-alt"></i></div>
                    <div class="stat-details"><h4>HWID</h4><p>${keyData.hwid ? 'Linked' : 'Unlinked'}</p></div>
                </div>
            </div>

            <div class="script-section" style="margin-top: 30px;">
                <h2 style="margin-bottom: 10px; font-size: 28px;">Quantum Loader</h2>
                <p style="color: var(--text-secondary); margin-bottom: 30px;">Latest Version: v2.4.0 | Status: <span style="color: var(--success);">Undetected</span></p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="get-script-btn" onclick="window.userPortal.copyLoaderScript()">
                        <i class="fas fa-copy"></i> Get Script
                    </button>
                    <button class="get-script-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);" onclick="window.location.href='index.html'">
                        <i class="fas fa-eye"></i> Preview UI
                    </button>
                </div>
            </div>
        `;
    }

    renderMusicContent() {
        if (!this.spotifyConnected) {
            return `
                <h2 style="margin-bottom: 20px;">Music</h2>
                <div class="glass-card" style="text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <i class="fab fa-spotify" style="font-size: 64px; color: #1DB954; margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">Connect to Spotify</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 400px;">
                        Connect your Spotify account to listen to your favorite playlists directly within the Quantum Portal.
                    </p>
                    <button class="btn-primary" style="background: #1DB954; width: auto; padding: 12px 30px; font-weight: bold; border-radius: 30px;" onclick="window.userPortal.connectSpotify()">
                        Connect Spotify
                    </button>
                </div>
            `;
        }

        const currentTrack = this.playlist[this.currentTrackIndex] || this.playlist[0];

        return `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <h2 style="margin: 0;">Music</h2>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" alt="Spotify" style="height: 24px;">
                </div>
            </div>
            
            <div class="glass-card" style="padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <i class="fas fa-user-circle" style="font-size: 24px; color: #1DB954; margin-right: 10px;"></i>
                    <span style="font-weight: bold;">${this.currentUser.username}</span>
                    <button style="margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer;" onclick="window.userPortal.disconnectSpotify()">Disconnect</button>
                </div>
                
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 250px; height: 250px; background: #333; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <img src="${currentTrack.cover}" style="width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <canvas id="visualizerCanvas" width="250" height="250" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; z-index: 2; opacity: 0.8;"></canvas>
                        </div>
                        <h3 style="margin-bottom: 5px; text-align: center;">${currentTrack.title}</h3>
                        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; text-align: center;">${currentTrack.artist}</p>
                        
                        <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
                            <i class="fas fa-random" style="cursor: pointer; font-size: 16px; color: var(--text-secondary);" title="Shuffle"></i>
                            <i class="fas fa-step-backward" style="cursor: pointer; font-size: 24px;" onclick="window.userPortal.prevTrack()"></i>
                            <div style="width: 60px; height: 60px; background: #1DB954; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: black; cursor: pointer; box-shadow: 0 5px 15px rgba(29, 185, 84, 0.4);" onclick="window.userPortal.togglePlay()">
                                <i class="fas fa-${this.isPlaying ? 'pause' : 'play'}" style="font-size: 20px; margin-left: ${this.isPlaying ? '0' : '3px'};"></i>
                            </div>
                            <i class="fas fa-step-forward" style="cursor: pointer; font-size: 24px;" onclick="window.userPortal.nextTrack()"></i>
                            <i class="fas fa-redo" style="cursor: pointer; font-size: 16px; color: ${this.isLooping ? '#1DB954' : 'var(--text-secondary)'};" onclick="window.userPortal.toggleLoop()"></i>
                        </div>

                        <button class="btn-primary" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); width: 100%;" onclick="window.userPortal.toggleLyrics()">
                            <i class="fas fa-microphone-alt"></i> ${this.showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                        </button>

                        ${this.showLyrics ? `
                            <div style="margin-top: 20px; width: 100%; max-height: 200px; overflow-y: auto; text-align: center; color: var(--text-secondary); font-size: 14px; line-height: 1.6; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                                ${this.currentLyrics.replace(/\n/g, '<br>')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="flex: 1; min-width: 300px;">
                        <div style="margin-bottom: 15px; position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);"></i>
                            <input type="text" class="modern-input" placeholder="Search for any song..." value="${this.searchQuery}" oninput="window.userPortal.handleSearch(this.value)" style="margin-bottom: 0; padding-left: 40px;">
                        </div>
                        <h3 style="margin-bottom: 10px;">Search Results</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
                            ${this.playlist.map((track, index) => `
                                <div style="background: ${index === this.currentTrackIndex ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255,255,255,0.05)'}; padding: 10px; border-radius: 8px; display: flex; align-items: center; cursor: pointer; transition: background 0.2s;" onclick="window.userPortal.playTrack(${index})">
                                    <div style="width: 40px; height: 40px; background: #333; border-radius: 4px; margin-right: 15px; overflow: hidden;">
                                        <img src="${track.cover}" style="width: 100%; height: 100%; object-fit: cover;">
                                    </div>
                                    <div style="flex-grow: 1;">
                                        <div style="font-size: 14px; font-weight: bold;">${track.title}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${track.artist}</div>
                                    </div>
                                    ${index === this.currentTrackIndex && this.isPlaying ? '<div class="playing-indicator"><span></span><span></span><span></span></div>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .playing-indicator { display: flex; gap: 2px; align-items: flex-end; height: 15px; }
                .playing-indicator span { background: #1DB954; width: 3px; animation: bounce 1s infinite ease-in-out; }
                .playing-indicator span:nth-child(1) { height: 60%; animation-delay: 0s; }
                .playing-indicator span:nth-child(2) { height: 100%; animation-delay: 0.2s; }
                .playing-indicator span:nth-child(3) { height: 40%; animation-delay: 0.4s; }
                @keyframes bounce { 0%, 100% { height: 20%; } 50% { height: 100%; } }
            </style>
        `;
    }

    handleSearch(query) {
        this.searchQuery = query;

        // Debounce search
        if (this.searchTimeout) clearTimeout(this.searchTimeout);

        if (!query) {
            this.playlist = [{ title: "Search for songs...", artist: "System", url: "", cover: "https://via.placeholder.com/200x200?text=Quantum" }];
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            return;
        }

        this.searchTimeout = setTimeout(() => {
            // Check for specific "Blacked Out" request
            if (query.toLowerCase().includes("blacked out") || query.toLowerCase().includes("phantom") || query.toLowerCase().includes("esdee")) {
                const blackedOutSong = {
                    title: "Phantom (Blacked Out)",
                    artist: "EsDeeKid",
                    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3", // Placeholder audio
                    cover: "https://via.placeholder.com/300x300/000000/00FF00?text=Phantom"
                };

                fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=25`)
                    .then(res => res.json())
                    .then(data => {
                        let results = [];
                        if (data.results) {
                            results = data.results.map(item => ({
                                title: item.trackName,
                                artist: item.artistName,
                                url: item.previewUrl,
                                cover: item.artworkUrl100.replace('100x100', '300x300')
                            }));
                        }
                        // Prepend our hardcoded song
                        results.unshift(blackedOutSong);
                        this.playlist = results;
                        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
                    })
                    .catch(err => {
                        this.playlist = [blackedOutSong];
                        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
                    });
                return;
            }

            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=25`)
                .then(res => res.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        this.playlist = data.results.map(item => ({
                            title: item.trackName,
                            artist: item.artistName,
                            url: item.previewUrl,
                            cover: item.artworkUrl100.replace('100x100', '300x300')
                        }));
                        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));

                        // Keep focus
                        setTimeout(() => {
                            const input = document.querySelector('input[placeholder="Search for any song..."]');
                            if (input) {
                                input.focus();
                                input.setSelectionRange(input.value.length, input.value.length);
                            }
                        }, 0);
                    }
                })
                .catch(err => console.error('Search failed:', err));
        }, 500);
    }

    toggleLyrics() {
        this.showLyrics = !this.showLyrics;
        if (this.showLyrics) {
            this.fetchLyrics();
        }
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
    }

    fetchLyrics() {
        const track = this.playlist[this.currentTrackIndex];
        if (!track) return;

        // Check local DB first
        if (this.lyricsDB[track.title]) {
            this.currentLyrics = this.lyricsDB[track.title];
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            return;
        }

        this.currentLyrics = "Loading lyrics...";
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));

        // Timeout promise
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        // Fetch promise
        const fetchPromise = fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`)
            .then(res => res.json());

        Promise.race([fetchPromise, timeout])
            .then(data => {
                if (data.lyrics) {
                    this.currentLyrics = data.lyrics;
                } else {
                    this.currentLyrics = "Lyrics not found for this song.";
                }
                this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            })
            .catch(err => {
                this.currentLyrics = "Lyrics unavailable (API Error or Timeout).";
                this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            });
    }

    startVisualizer() {
        const canvas = document.getElementById('visualizerCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (this.visualizerInterval) clearInterval(this.visualizerInterval);

        this.visualizerInterval = setInterval(() => {
            if (!this.isPlaying) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bars = 30;
            const barWidth = canvas.width / bars;

            for (let i = 0; i < bars; i++) {
                const height = Math.random() * 50 + 10; // Random height for wave
                const x = i * barWidth;
                const y = canvas.height - height;

                ctx.fillStyle = '#1DB954';
                ctx.fillRect(x, y, barWidth - 2, height);
            }
        }, 100);
    }

    stopVisualizer() {
        if (this.visualizerInterval) clearInterval(this.visualizerInterval);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play();
        }
        this.isPlaying = !this.isPlaying;
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
    }

    playTrack(index) {
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        if (track && track.url) {
            this.audioPlayer.src = track.url;
            this.audioPlayer.play();
            this.isPlaying = true;

            // Reset lyrics if changing track
            if (this.showLyrics) {
                this.fetchLyrics();
            }

            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        }
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.playTrack(this.currentTrackIndex);
    }

    prevTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playTrack(this.currentTrackIndex);
    }

    connectSpotify() {
        // Simulate OAuth Popup
        const width = 450;
        const height = 730;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);

        const win = window.open('', 'Spotify Login', `width=${width},height=${height},top=${top},left=${left}`);
        win.document.write(`
            <html>
                <body style="background: #191414; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                    <h2 style="margin-bottom: 20px;">Spotify</h2>
                    <p>Connecting to Quantum Portal...</p>
                    <div style="margin-top: 20px; width: 30px; height: 30px; border: 3px solid #1DB954; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                </body>
            </html>
        `);

        setTimeout(() => {
            win.close();
            this.spotifyConnected = true;
            this.saveUserData();
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            this.showNotification('Spotify Connected Successfully!', 'success');
        }, 2000);
    }

    disconnectSpotify() {
        this.spotifyConnected = false;
        this.audioPlayer.pause();
        this.isPlaying = false;
        this.saveUserData();
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        this.showNotification('Spotify Disconnected', 'info');
    }

    renderChatContent() {
        // Start auto-refresh for chat
        this.startChatAutoRefresh();

        // Auto-scroll to bottom logic needs to be handled after render
        setTimeout(() => {
            const chatBox = document.getElementById('chatBox');
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 0);

        return `
            <h2 style="margin-bottom: 20px;">Global Chat</h2>
            <div class="glass-card" style="height: 400px; display: flex; flex-direction: column; padding: 0;">
                <div id="chatBox" style="flex-grow: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                    ${this.chatMessages.length > 0 ? this.chatMessages.map(msg => `
                        <div style="display: flex; gap: 10px; align-items: flex-start;">
                            <div style="font-weight: bold; color: ${this.getRankColor(msg.rank)}; font-size: 14px; min-width: 80px;">
                                [${msg.rank}] ${msg.user}:
                            </div>
                            <div style="color: var(--text-primary); font-size: 14px; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 0 8px 8px 8px;">
                                ${msg.msg}
                            </div>
                            <div style="font-size: 10px; color: var(--text-secondary); margin-left: auto;">${msg.time}</div>
                        </div>
                    `).join('') : '<div style="text-align: center; color: var(--text-secondary); margin-top: 50px;">No messages yet. Start the conversation!</div>'}
                </div>
                <div style="padding: 15px; border-top: 1px solid var(--glass-border); display: flex; gap: 10px;">
                    <input type="text" id="chatInput" class="modern-input" placeholder="Type a message..." style="margin-bottom: 0;" onkeypress="if(event.key === 'Enter') window.userPortal.sendChatMessage()">
                    <button class="btn-primary" style="width: auto;" onclick="window.userPortal.sendChatMessage()">Send</button>
                </div>
            </div>
            ${this.rank === 'Founder' || this.rank === 'Developer' || this.rank === 'Admin' ? `
                <div style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
                    <strong>Staff Commands:</strong> <code>/givekey</code>, <code>@everyone [msg]</code>, <code>/setrank [rank]</code>, <code>/clear</code>
                </div>
            ` : ''}
        `;
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const msg = input.value.trim();
        if (!msg) return;

        const allowedCommandRanks = ['Founder', 'Developer'];
        const isCommandUser = allowedCommandRanks.includes(this.rank);

        // Command Handling
        if (isCommandUser && msg.startsWith('/')) {
            this.handleOwnerCommand(msg);
            input.value = '';
            return;
        }

        if (isCommandUser && msg.startsWith('@everyone')) {
            this.addChatMessage(this.currentUser.username, this.rank, `<span style="color: #ff4444; font-weight: bold; background: rgba(255,0,0,0.1); padding: 2px 5px; border-radius: 4px;">@everyone</span> ${msg.replace('@everyone', '')}`);
            input.value = '';
            return;
        }

        this.addChatMessage(this.currentUser.username || 'User', this.rank, msg);
        input.value = '';
    }

    handleOwnerCommand(cmd) {
        const parts = cmd.split(' ');
        const command = parts[0];

        if (command === '/givekey') {
            const newKey = 'QTM_GIFT_' + Math.random().toString(36).substr(2, 6).toUpperCase();

            // Add key to admin_keys in localStorage
            this.keys.push({
                key: newKey,
                status: 'active',
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 1 Day
                hwid: null,
                createdAt: Date.now()
            });
            localStorage.setItem('admin_keys', JSON.stringify(this.keys));

            this.addChatMessage('System', 'Bot', `🎁 <strong>GIFT KEY DROP!</strong> First to claim: <code style="user-select: all; background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px;">${newKey}</code>`);
            this.showNotification('Key generated and dropped in chat!', 'success');

        } else if (command === '/setrank') {
            const newRank = parts[1];
            if (newRank && this.rankDefinitions[newRank]) {
                this.rank = newRank;
                this.saveUserData();
                this.showNotification(`Rank updated to ${newRank}`, 'success');
                this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            } else {
                this.showNotification('Invalid Rank Name', 'error');
            }
        } else if (command === '/clear') {
            this.chatMessages = [];
            localStorage.setItem('quantum_global_chat', JSON.stringify([]));
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            this.showNotification('Chat cleared', 'success');
        } else {
            this.showNotification('Unknown command', 'error');
        }
    }

    addChatMessage(user, rank, msg) {
        const newMessage = {
            user,
            rank,
            msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.chatMessages.push(newMessage);

        // Save to localStorage for persistence
        localStorage.setItem('quantum_global_chat', JSON.stringify(this.chatMessages));

        // Re-render chat if active
        if (this.activeTab === 'chat') {
            this.refreshChatDisplay();
        }
    }

    refreshChatDisplay() {
        // Only refresh the chat box, not the entire portal
        const chatBox = document.getElementById('chatBox');
        if (!chatBox) return;

        const scrolledToBottom = chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 50;

        chatBox.innerHTML = this.chatMessages.length > 0 ? this.chatMessages.map(msg => `
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <div style="font-weight: bold; color: ${this.getRankColor(msg.rank)}; font-size: 14px; min-width: 80px;">
                    [${msg.rank}] ${msg.user}:
                </div>
                <div style="color: var(--text-primary); font-size: 14px; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 0 8px 8px 8px;">
                    ${msg.msg}
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-left: auto;">${msg.time}</div>
            </div>
        `).join('') : '<div style="text-align: center; color: var(--text-secondary); margin-top: 50px;">No messages yet. Start the conversation!</div>';

        // Auto-scroll to bottom if user was already at bottom
        if (scrolledToBottom) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    startChatAutoRefresh() {
        // Clear any existing interval
        if (this.chatRefreshInterval) {
            clearInterval(this.chatRefreshInterval);
        }

        // Refresh chat every 1 second
        this.chatRefreshInterval = setInterval(() => {
            if (this.activeTab === 'chat') {
                // Reload messages from localStorage (in case another tab updated them)
                this.chatMessages = JSON.parse(localStorage.getItem('quantum_global_chat')) || [];
                this.refreshChatDisplay();
            }
        }, 1000);
    }

    stopChatAutoRefresh() {
        if (this.chatRefreshInterval) {
            clearInterval(this.chatRefreshInterval);
            this.chatRefreshInterval = null;
        }
    }

    renderScriptsContent() {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>My Scripts</h2>
                <button class="btn-primary" style="width: auto; padding: 8px 16px;" onclick="window.userPortal.createNewScript()">
                    <i class="fas fa-plus"></i> New Script
                </button>
            </div>
            
            <div class="script-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                ${this.scripts.length > 0 ? this.scripts.map((script, index) => `
                    <div class="glass-card" style="padding: 15px; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div style="background: rgba(59, 130, 246, 0.1); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent-color);">
                                <i class="fas fa-scroll"></i>
                            </div>
                            <button onclick="window.userPortal.deleteScript(${index})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 5px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <h3 style="font-size: 16px; margin-bottom: 5px;">${script.name}</h3>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 15px; flex-grow: 1;">${script.content.substring(0, 50)}...</p>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn-primary" style="font-size: 12px; padding: 6px; background: var(--success); border: none;" onclick="window.userPortal.executeScript(${index})"><i class="fas fa-play"></i> Exec</button>
                            <button class="btn-primary" style="font-size: 12px; padding: 6px;" onclick="window.userPortal.viewScript(${index})">View</button>
                            <button class="btn-primary" style="font-size: 12px; padding: 6px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);" onclick="window.userPortal.copyScript(${index})">Copy</button>
                        </div>
                    </div>
                `).join('') : `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-code" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>No scripts saved yet. Create one to get started!</p>
                    </div>
                `}
            </div>
        `;
    }

    renderNewsContent() {
        const news = [
            { title: "v2.5.0 Released!", date: "Today", type: "update", content: "Added new Magnet logic, improved Catch consistency, and fixed crash on injection." },
            { title: "Maintenance Scheduled", date: "Yesterday", type: "alert", content: "Servers will be down for 1 hour on Dec 10th for upgrades." },
            { title: "New Game Supported", date: "2 days ago", type: "new", content: "Added support for 'Touchdown Simulator' with auto-catch." }
        ];

        return `
            <h2 style="margin-bottom: 20px;">News & Updates</h2>
            <div class="news-grid">
                ${news.map(item => `
                    <div class="news-card">
                        <span class="news-badge badge-${item.type}">${item.type}</span>
                        <h3 style="margin-bottom: 5px;">${item.title}</h3>
                        <span style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 10px;">${item.date}</span>
                        <p style="color: var(--text-secondary); font-size: 14px;">${item.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProfileContent() {
        const rankData = this.rankDefinitions[this.rank] || this.rankDefinitions['User'];
        return `
            <h2 style="margin-bottom: 20px;">Profile Settings</h2>
            <div class="profile-edit-header">
                <div class="profile-avatar-edit" onclick="document.getElementById('avatarUpload').click()" style="overflow: hidden;">
                    ${this.currentUser.avatar ? `<img src="${this.currentUser.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-user-astronaut"></i>'}
                </div>
                <div>
                    <h3 style="font-size: 24px; margin-bottom: 5px;">
                        ${this.currentUser.username || 'Quantum User'}
                        <i class="fas ${rankData.icon}" style="color: ${rankData.color}; font-size: 16px; margin-left: 5px;" title="${this.rank}"></i>
                    </h3>
                    <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                        ${this.badges.map(b => `<span class="news-badge badge-update" style="font-size: 10px;">${b}</span>`).join('')}
                        <span class="news-badge" style="background: ${rankData.color}; color: black; font-weight: bold; font-size: 10px;">${this.rank}</span>
                    </div>
                    <button class="btn-primary" style="padding: 5px 15px; font-size: 12px;" onclick="window.userPortal.changeUsername()">Change Username</button>
                </div>
            </div>
            
            <div class="security-card" style="margin-bottom: 20px;">
                <h3>Account Details</h3>
                <div class="security-item">
                    <span>Member Since</span>
                    <span style="color: var(--text-secondary);">Dec 2025</span>
                </div>
                <div class="security-item">
                    <span>Subscription Tier</span>
                    <span style="color: var(--accent-color);">Premium</span>
                </div>
            </div>

            <div class="glass-card" style="padding: 20px; margin-bottom: 20px;">
                <h3>Redeem Code</h3>
                <p style="color: var(--text-secondary); margin-bottom: 10px; font-size: 14px;">Enter a special code to unlock ranks or rewards.</p>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="redeemInput" class="modern-input" placeholder="Enter code..." style="margin-bottom: 0;">
                    <button class="btn-primary" style="width: auto;" onclick="window.userPortal.redeemCode()">Redeem</button>
                </div>
            </div>
        `;
    }

    redeemCode() {
        const input = document.getElementById('redeemInput');
        const code = input.value.trim();

        // Rank Codes
        const rankCodes = {
            'QUANTUM_FOUNDER_999': 'Founder',
            'DEV_MODE_ON': 'Developer',
            'ADMIN_POWER_UP': 'Admin',
            'MOD_SQUAD_2025': 'Moderator',
            'VIP_STATUS_NOW': 'VIP'
        };

        if (rankCodes[code]) {
            const newRank = rankCodes[code];
            this.rank = newRank;
            this.badges.push(newRank); // Add rank as badge too
            this.saveUserData();
            this.showNotification(`🌟 ACCESS GRANTED: Welcome, ${newRank}.`, 'success');
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        } else if (code === 'HACKER_MODE') {
            this.setTheme('hacker');
            this.showNotification('Hacker Mode Activated', 'success');
        } else {
            this.showNotification('Invalid Code', 'error');
        }
    }

    renderSupportContent() {
        return `
            <h2 style="margin-bottom: 20px;">Support</h2>
            
            <div class="support-widget" style="margin-bottom: 30px;">
                <i class="fab fa-discord" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3>Join our Discord</h3>
                <p style="margin-bottom: 20px; opacity: 0.8;">Get 24/7 support, chat with other users, and get exclusive updates.</p>
                <a href="https://discord.gg/KjuYafU7UB" target="_blank" class="btn-primary" style="background: white; color: #5865F2; width: auto; padding: 10px 30px; text-decoration: none; display: inline-block;">Join Server</a>
            </div>
            
            <div style="margin-top: 30px;">
                <h3>Themes</h3>
                <div class="theme-grid" style="margin-top: 15px;">
                    <div class="theme-card ${this.currentUser.theme === 'default' ? 'active' : ''}" onclick="window.userPortal.setTheme('default')">
                        <div class="theme-preview" style="background: #0f1115; color: white;">Default</div>
                    </div>
                    <div class="theme-card ${this.currentUser.theme === 'midnight' ? 'active' : ''}" onclick="window.userPortal.setTheme('midnight')">
                        <div class="theme-preview" style="background: #1e293b; color: #94a3b8;">Midnight</div>
                    </div>
                    <div class="theme-card ${this.currentUser.theme === 'ocean' ? 'active' : ''}" onclick="window.userPortal.setTheme('ocean')">
                        <div class="theme-preview" style="background: #0f172a; color: #38bdf8;">Ocean</div>
                    </div>
                    <div class="theme-card ${this.currentUser.theme === 'sunset' ? 'active' : ''}" onclick="window.userPortal.setTheme('sunset')">
                        <div class="theme-preview" style="background: #2a1b1b; color: #f43f5e;">Sunset</div>
                    </div>
                     <div class="theme-card ${this.currentUser.theme === 'hacker' ? 'active' : ''}" onclick="window.userPortal.setTheme('hacker')">
                        <div class="theme-preview" style="background: #000000; color: #00ff00; font-family: monospace;">Hacker</div>
                    </div>
                    ${this.installedThemes.map(theme => `
                        <div class="theme-card ${this.currentUser.theme === theme.name ? 'active' : ''}" onclick="window.userPortal.setTheme('${theme.name}')">
                            <div class="theme-preview" style="background: ${theme.colors['--bg-primary']}; color: ${theme.colors['--accent-color']};">${theme.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachNavListeners(keyData) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.activeTab = item.dataset.tab;
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                document.getElementById('portalContent').innerHTML = this.getTabContent(this.activeTab, keyData);

                // Handle visualizer state
                if (this.activeTab === 'music' && this.spotifyConnected) {
                    this.startVisualizer();
                } else {
                    this.stopVisualizer();
                }
            });
        });
    }

    changeUsername() {
        const newName = prompt("Enter new username:");
        if (newName) {
            this.currentUser.username = newName;
            this.saveUserData();
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            this.showNotification('Username updated!', 'success');
        }
    }

    handleAvatarUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentUser.avatar = e.target.result;
                this.saveUserData();
                this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
                this.showNotification('Avatar updated!', 'success');
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    showHwid(hwid) {
        alert(`Your HWID is:\n${hwid}`);
    }

    setTheme(theme) {
        this.currentUser.theme = theme;
        this.saveUserData();
        this.applyTheme(theme);
        if (this.activeTab === 'support') {
            document.getElementById('portalContent').innerHTML = this.renderSupportContent();
        }
        this.showNotification(`Theme set to ${theme}`, 'success');
    }

    applyTheme(theme) {
        const root = document.documentElement;

        // Check installed themes first (user overrides)
        let themeData = this.installedThemes.find(t => t.name === theme);

        // If not installed, check available themes (system defaults)
        if (!themeData) {
            themeData = this.availableThemes.find(t => t.name === theme);
        }

        // Fallback to default
        if (!themeData) {
            themeData = this.availableThemes.find(t => t.name === 'default');
        }

        if (themeData && themeData.colors) {
            for (const [key, value] of Object.entries(themeData.colors)) {
                root.style.setProperty(key, value);
            }
        }
    }

    createNewScript() {
        const name = prompt("Enter script name:");
        if (!name) return;
        const content = prompt("Enter script content:");
        if (!content) return;

        this.scripts.push({ name, content, date: Date.now() });
        this.saveUserData();
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        this.showNotification('Script saved!', 'success');
    }

    deleteScript(index) {
        if (confirm('Are you sure you want to delete this script?')) {
            this.scripts.splice(index, 1);
            this.saveUserData();
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            this.showNotification('Script deleted', 'success');
        }
    }

    viewScript(index) {
        const script = this.scripts[index];
        alert(`Script: ${script.name}\n\n${script.content}`);
    }

    copyScript(index) {
        const script = this.scripts[index];
        navigator.clipboard.writeText(script.content).then(() => {
            this.showNotification('Script copied to clipboard!', 'success');
        });
    }

    copyLoaderScript() {
        const loaderScript = "-- Quantum Loader\n-- Status: In Development\nprint('Quantum Loader Initialized')";
        navigator.clipboard.writeText(loaderScript).then(() => {
            this.showNotification('Loader script copied!', 'success');
        });
    }

    toggleGhostMode() {
        const app = document.getElementById('app');
        if (app.style.display === 'none') {
            app.style.display = 'block';
            document.body.style.background = '';
            document.title = 'Quantum Portal';
        } else {
            app.style.display = 'none';
            document.body.style.background = '#fff';
            document.body.innerHTML += '<div id="ghostOverlay" style="padding: 20px; font-family: Arial, sans-serif; color: #333;"><h1>Untitled Document</h1><p>Loading content...</p></div>';
            document.title = 'Google Docs';
        }
    }

    getThemeDownloads(themeName) {
        const stats = JSON.parse(localStorage.getItem('quantum_theme_stats') || '{}');
        return stats[themeName] || 1;
    }

    incrementThemeDownloads(themeName) {
        const stats = JSON.parse(localStorage.getItem('quantum_theme_stats') || '{}');
        stats[themeName] = (stats[themeName] || 1) + 1;
        localStorage.setItem('quantum_theme_stats', JSON.stringify(stats));
    }

    renderMarketplaceContent() {
        const themes = this.availableThemes;

        return `
    <h2 style="margin-bottom: 20px;">Theme Marketplace</h2>
    <div class="glass-card" style="margin-bottom: 20px; text-align: center;">
        <i class="fas fa-paint-brush" style="font-size: 48px; color: var(--accent-color); margin-bottom: 15px;"></i>
        <h3>Free Themes</h3>
        <p style="color: var(--text-secondary);">Customize your portal with these exclusive free themes.</p>
    </div>
    
    <div class="script-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
        ${themes.map(theme => {
            // Rank Visibility Logic
            if (theme.requiredRank) {
                if (this.rank !== 'Founder' && this.rank !== theme.requiredRank) {
                    return ''; // Hide if not Founder and not matching rank
                }
            }

            const isInstalled = this.installedThemes.some(t => t.name === theme.name);
            const isPremium = theme.type === 'premium';
            const hasAccess = ['Founder', 'Developer'].includes(this.rank);
            const canInstall = !isPremium || hasAccess || isInstalled;
            const downloads = this.getThemeDownloads(theme.name);

            return `
            <div class="glass-card" style="padding: 15px; position: relative; overflow: hidden; border: ${isPremium ? '1px solid ' + theme.previewColor : 'none'};">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: ${theme.previewColor};"></div>
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h3 style="margin: 0;">${theme.name}</h3>
                    <span style="font-size: 10px; background: ${isPremium ? theme.previewColor : 'rgba(255,255,255,0.1)'}; color: ${isPremium ? 'black' : 'white'}; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${theme.requiredRank ? theme.requiredRank.toUpperCase() : (isPremium ? 'PREMIUM' : 'Free')}</span>
                </div>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;">by ${theme.author}</p>
                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 15px;"><i class="fas fa-download"></i> ${downloads}</p>
                ${!canInstall ? `
                     <button class="btn-primary" style="font-size: 12px; padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);" 
                        onclick='window.userPortal.unlockTheme(${JSON.stringify(theme).replace(/'/g, "&#39;")})'>
                        <i class="fas fa-lock"></i> Unlock
                    </button>
                ` : `
                    <button class="btn-primary" style="font-size: 12px; padding: 8px; background: ${isInstalled ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)'}; border: ${isInstalled ? '1px solid var(--glass-border)' : 'none'};" 
                        onclick='window.userPortal.installTheme(${JSON.stringify(theme).replace(/'/g, "&#39;")})' ${isInstalled ? 'disabled' : ''}>
                        ${isInstalled ? '<i class="fas fa-check"></i> Installed' : 'Install Theme'}
                    </button>
                `}
            </div>
        `}).join('')}
    </div>
`;
    }

    unlockTheme(theme) {
        const code = prompt(`Enter unlock code for ${theme.name}:`);
        if (code === theme.code) {
            this.showNotification('Code Accepted! Unlocking...', 'success');
            this.installTheme(theme);
        } else {
            this.showNotification('Invalid Code', 'error');
        }
    }

    installTheme(theme) {
        if (this.installedThemes.some(t => t.name === theme.name)) return;

        this.showNotification(`Installing ${theme.name}...`, 'info');

        setTimeout(() => {
            this.installedThemes.push(theme);
            this.saveUserData();
            this.showNotification(`${theme.name} Installed! Check Support tab.`, 'success');
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        }, 1000);
    }

    executeScript(index) {
        const script = this.scripts[index];
        this.showNotification(`Executing: ${script.name}...`, 'info');
        // Simulate WebSocket execution
        setTimeout(() => {
            this.showNotification(`Successfully executed ${script.name} in-game!`, 'success');
        }, 1000);
    }

    logout() {
        localStorage.removeItem('user_auth_session');
        this.currentUser = null;
        this.renderLogin();
    }

    showNotification(message, type = 'info') {
        const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };

        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.style.borderLeft = `4px solid ${colors[type]}`;
        notif.innerHTML = `<i class="fas ${icons[type]}" style="color: ${colors[type]}"></i> ${message}`;

        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(100%)';
            notif.style.transition = 'all 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.particlesJS) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.onload = () => {
            window.userPortal = new UserPortal();
        };
        document.body.appendChild(script);
    } else {
        window.userPortal = new UserPortal();
    }
});
