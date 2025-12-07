
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
        this.chatMessages = [];
        this.chatRefreshInterval = null; // Auto-refresh timer
        this.supabase = window.supabaseClient;

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
            'Founder': { color: '#FFD700', icon: 'fa-crown', priority: 100 },
            'Developer': { color: '#00FF00', icon: 'fa-code', priority: 90 },
            'Admin': { color: '#FF4500', icon: 'fa-shield-alt', priority: 80 },
            'Moderator': { color: '#1E90FF', icon: 'fa-gavel', priority: 70 },
            'VIP': { color: '#9D00FF', icon: 'fa-star', priority: 50 },
            'User': { color: '#9ca3af', icon: 'fa-user', priority: 10 }
        };

        // Command Definitions
        this.commands = {
            '/kick': { rank: 'Moderator', desc: 'Kick a user from the server', usage: '/kick [username]' },
            '/unkick': { rank: 'Moderator', desc: 'Unkick a user', usage: '/unkick [username]' },

            '/ban': { rank: 'Founder', desc: 'Permanently ban a user', usage: '/ban [username]' },
            '/unban': { rank: 'Founder', desc: 'Unban a user', usage: '/unban [username]' },
            '/mute': { rank: 'Moderator', desc: 'Mute a user for 10m', usage: '/mute [username]' },
            '/warn': { rank: 'Moderator', desc: 'Issue a warning', usage: '/warn [username]' },
            '/announce': { rank: 'Admin', desc: 'Send a global announcement', usage: '/announce [msg]' },
            '/givekey': { rank: 'Developer', desc: 'Generate a new access key', usage: '/givekey' },
            '/setrank': { rank: 'Founder', desc: 'Change a user\'s rank', usage: '/setrank [rank]' },
            '/clear': { rank: 'Moderator', desc: 'Clear the chat history', usage: '/clear' }
        };

        // Initialize Visuals
        this.initBackground();
        this.initCursorTrails();

        // Global Announcement
        this.announcement = "📢 WELCOME TO QUANTUM PORTAL V2.5! NEW FEATURES ADDED: SCRIPT GENERATOR, AI ASSISTANT, AND MORE! 🎉";

        // Poll Data
        // Poll Data
        this.pollData = {
            question: "What feature should we add next?",
            options: [
                { id: 1, text: "More Games Support", votes: 0 },
                { id: 2, text: "Cloud Scripts", votes: 0 },
                { id: 3, text: "Mobile App", votes: 0 },
                { id: 4, text: "Theme Creator", votes: 0 }
            ],
            userVoted: false
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
                banner: null,
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
        this.currentUser.banner = this.allUserData[key].banner;
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
                banner: this.currentUser.banner,
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

    initCursorTrails() {
        const trail = [];
        const maxTrail = 20;

        document.addEventListener('mousemove', (e) => {
            trail.push({ x: e.clientX, y: e.clientY, age: 0 });
            if (trail.length > maxTrail) trail.shift();
        });

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; pointer-events: none;';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const animate = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < trail.length; i++) {
                const point = trail[i];
                point.age++;

                if (point.age > 50) {
                    trail.splice(i, 1);
                    i--;
                    continue;
                }

                const alpha = 1 - (i / trail.length); // Fade out tail
                const size = (i / trail.length) * 5; // Taper tail

                ctx.fillStyle = `rgba(0, 255, 255, ${1 - alpha})`; // Cyan trail
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(animate);
        };
        animate();
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
                            <img src="assets/logo_christmas.png" alt="Quantum Logo" style="width: 100%; height: 100%; object-fit: contain;">
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
                    <button class="btn-primary" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); font-size: 14px; padding: 10px; margin-bottom: 10px;" onclick="window.userPortal.copyDeviceHwid()">
                        <i class="fas fa-fingerprint"></i> Copy HWID
                    </button>
                    <button class="btn-primary" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); font-size: 14px; padding: 10px;" onclick="window.userPortal.previewUI()">
                        <i class="fas fa-eye"></i> Preview UI
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

    previewUI() {
        window.open('index2.html', '_blank');
    }

    async handleLogin() {
        // Supabase Integration
        this.supabase = window.supabaseClient;
        if (!this.supabase) {
            this.showNotification('System Error: Database not connected', 'error');
            return;
        }

        const input = document.getElementById('keyInput');
        const keyStr = input.value.trim();

        if (!keyStr) {
            this.showNotification('Please enter a key', 'error');
            return;
        }

        // Fetch key from Supabase
        const { data: keyData, error } = await this.supabase
            .from('keys')
            .select('*')
            .eq('key', keyStr)
            .single();

        if (error || !keyData) {
            this.showNotification('Invalid Key', 'error');
            return;
        }

        if (keyData.status !== 'active') {
            this.showNotification(`Key is ${keyData.status}`, 'warning');
            return;
        }

        if (keyData.expires_at && Date.now() > parseInt(keyData.expires_at)) {
            this.showNotification('Key is expired', 'error');
            return;
        }

        if (keyData.hwid && keyData.hwid !== this.deviceHwid) {
            this.showNotification('This key is HWID locked', 'error');
            return;
        }

        // Bind HWID if not set
        if (!keyData.hwid) {
            const { error: updateError } = await this.supabase
                .from('keys')
                .update({ hwid: this.deviceHwid })
                .eq('key', keyStr);

            if (updateError) {
                this.showNotification('Error binding HWID', 'error');
                return;
            }
            keyData.hwid = this.deviceHwid;
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
        // Ban Check
        const blacklist = JSON.parse(localStorage.getItem('quantum_blacklist') || '[]');
        if (this.currentUser && blacklist.includes(this.currentUser.username)) {
            this.logout();
            setTimeout(() => alert("You have been BANNED."), 100);
            return;
        }

        // Kick Check
        const kicked = JSON.parse(localStorage.getItem('quantum_kicked_users') || '[]');
        if (this.currentUser && kicked.includes(this.currentUser.username)) {
            const newKicked = kicked.filter(u => u !== this.currentUser.username);
            localStorage.setItem('quantum_kicked_users', JSON.stringify(newKicked));
            this.logout();
            setTimeout(() => alert("You have been KICKED from the server."), 100);
            return;
        }

        // Session Expiration Check
        if (this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);
        if (keyData.expires_at) {
            this.sessionCheckInterval = setInterval(() => {
                if (Date.now() > parseInt(keyData.expires_at)) {
                    clearInterval(this.sessionCheckInterval);
                    this.logout();
                    alert("Your key has expired.");
                }
            }, 60000); // Check every minute
        }

        const app = document.getElementById('app');
        const isMobile = window.innerWidth <= 768;
        const rankData = this.rankDefinitions[this.rank] || this.rankDefinitions['User'];

        app.innerHTML = `
            <div class="portal-layout">
                <div class="portal-sidebar">
                    <div class="brand-header" style="margin-bottom: 40px; text-align: left;">
                        <div class="brand-logo" style="width: 40px; height: 40px; margin: 0 0 10px 0;">
                            <img src="assets/logo_christmas.png" alt="Quantum Logo" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                        <h2 class="brand-title" style="font-size: 20px;">Quantum</h2>
                    </div>
                    
                    <!-- Announcement Marquee -->
                    <div style="background: rgba(0, 255, 255, 0.1); color: cyan; padding: 5px; font-size: 10px; margin-bottom: 20px; border-radius: 4px; border: 1px solid rgba(0, 255, 255, 0.2);">
                        <marquee scrollamount="5">${this.announcement}</marquee>
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
                        <a href="#" class="nav-item ${this.activeTab === 'generator' ? 'active' : ''}" data-tab="generator">
                            <i class="fas fa-magic"></i> Script Gen
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
                        ${(this.rankDefinitions[this.rank]?.priority >= 70) ? `
                            <a href="#" class="nav-item ${this.activeTab === 'commands' ? 'active' : ''}" data-tab="commands" style="color: var(--warning);">
                                <i class="fas fa-terminal"></i> Commands
                            </a>
                        ` : ''}
                    </nav>

                    <div style="margin-top: auto;">
                        <a href="javascript:void(0)" class="nav-item" onclick="window.userPortal.logout()" style="color: #ef4444; margin-bottom: 10px;">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                        ${isMobile ? `
                            <div class="mobile-companion-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align: center; font-size: 12px;">
                                <i class="fas fa-mobile-alt"></i> Mobile Companion Active
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="portal-content" id="portalContent">
                    ${this.getTabContent(this.activeTab, keyData)}
                </div>
            </div>
            <input type="file" id="avatarUpload" accept="image/*" style="display: none;" onchange="window.userPortal.handleAvatarUpload(this)">
        `;

        if (!this.chatInitialized) {
            this.initChat();
            this.chatInitialized = true;
        }

        this.attachNavListeners(keyData);
        this.applyTheme(this.currentUser.theme || 'default');

        if (this.activeTab === 'music' && this.spotifyConnected) {
            this.startVisualizer();
        } else {
            this.stopVisualizer();
        }
    }

    attachNavListeners(keyData) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.activeTab = tab;
                this.renderPortal(keyData);
            });
        });
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
            case 'music': return this.renderMusicContent();
            case 'scripts': return this.renderScriptsContent();
            case 'generator': return this.renderGeneratorContent();
            case 'news': return this.renderNewsContent();
            case 'profile': return this.renderProfileContent();
            case 'support': return this.renderSupportContent();
            case 'commands': return this.renderCommandsContent();
            default: return this.renderDashboardContent(keyData);
        }
    }

    renderDashboardContent(keyData) {
        let timeRemaining = 'Lifetime';
        if (keyData.expires_at) {
            const diff = parseInt(keyData.expires_at) - Date.now();
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
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(157, 0, 255, 0.1); color: #9D00FF;"><i class="fas fa-trophy"></i></div>
                    <div class="stat-details">
                        <h4>Level ${this.currentUser.level || 1}</h4>
                        <p style="font-size: 10px; color: var(--text-secondary);">${this.currentUser.xp || 0} XP</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(157, 0, 255, 0.1); color: #9D00FF;"><i class="fas fa-trophy"></i></div>
                    <div class="stat-details">
                        <h4>Level ${this.currentUser.level || 1}</h4>
                        <p style="font-size: 10px; color: var(--text-secondary);">${this.currentUser.xp || 0} XP</p>
                    </div>
                </div>
            </div>

            <!-- Community Poll -->
            <div class="glass-card" style="margin-top: 20px; padding: 20px;">
                <h3 style="margin-bottom: 15px;"><i class="fas fa-poll"></i> Community Poll</h3>
                <p style="margin-bottom: 15px; color: var(--text-secondary);">${this.pollData.question}</p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${this.pollData.options.map(opt => {
            const totalVotes = this.pollData.options.reduce((a, b) => a + b.votes, 0);
            const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
            return `
                            <div style="position: relative; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; cursor: pointer; overflow: hidden;" onclick="window.userPortal.votePoll(${opt.id})">
                                <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${percent}%; background: rgba(0, 255, 255, 0.1); transition: width 0.5s;"></div>
                                <div style="position: relative; display: flex; justify-content: space-between; align-items: center;">
                                    <span>${opt.text}</span>
                                    <span style="font-size: 12px; color: var(--text-secondary);">${percent}% (${opt.votes})</span>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>

            <div class="script-section" style="margin-top: 30px;">
                <h2 style="margin-bottom: 10px; font-size: 28px;">Quantum Loader</h2>
                <p style="color: var(--text-secondary); margin-bottom: 30px;">Latest Version: v2.4.0 | Status: <span style="color: var(--success);">Undetected</span></p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="get-script-btn" onclick="window.userPortal.copyLoaderScript()">
                        <i class="fas fa-copy"></i> Get Script
                    </button>
                    <button class="get-script-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);" onclick="window.userPortal.previewUI()">
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
                    <a href="https://soundcloud.com" target="_blank" style="color: #ff5500; text-decoration: none; font-size: 24px;"><i class="fab fa-soundcloud"></i></a>
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

    async initChat() {
        if (!this.supabase) return;

        // Fetch initial messages
        const { data, error } = await this.supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            this.chatMessages = data.reverse().map(m => ({
                user: m.username,
                rank: m.rank,
                msg: m.message,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            this.refreshChatDisplay();
        }

        // Subscribe to new messages
        this.supabase
            .channel('public:chat_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
                const m = payload.new;
                const msg = {
                    user: m.username,
                    rank: m.rank,
                    msg: m.message,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                this.chatMessages.push(msg);
                if (this.chatMessages.length > 50) this.chatMessages.shift(); // Keep last 50
                this.refreshChatDisplay();
            })
            .subscribe();
    }

    sendChatMessage() {
        // Ban Check
        const blacklist = JSON.parse(localStorage.getItem('quantum_blacklist') || '[]');
        if (blacklist.includes(this.currentUser.username)) {
            this.showNotification('You are banned and cannot chat.', 'error');
            return;
        }

        // Mute Check
        const muted = JSON.parse(localStorage.getItem('quantum_muted_users') || '[]');
        if (muted.includes(this.currentUser.username)) {
            this.showNotification('You are muted.', 'error');
            return;
        }

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
        this.addXP(10); // Give 10 XP per message
        input.value = '';
    }

    handleOwnerCommand(cmd) {
        const parts = cmd.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        // Check if command exists
        if (!this.commands[command]) {
            return this.showNotification('Unknown command', 'error');
        }

        // Check Permissions
        const requiredRank = this.commands[command].rank;
        const userPriority = this.rankDefinitions[this.rank].priority;
        const requiredPriority = this.rankDefinitions[requiredRank].priority;

        if (userPriority < requiredPriority) {
            return this.showNotification(`Permission Denied. Requires ${requiredRank}+`, 'error');
        }

        // Execute Command
        if (command === '/givekey') {
            const newKey = 'QTM_GIFT_' + Math.random().toString(36).substr(2, 6).toUpperCase();
            this.keys.push({
                key: newKey,
                status: 'active',
                expiresAt: Date.now() + (24 * 60 * 60 * 1000),
                hwid: null,
                createdAt: Date.now()
            });
            localStorage.setItem('admin_keys', JSON.stringify(this.keys));
            this.addChatMessage('System', 'Bot', `🎁 <strong>GIFT KEY DROP!</strong> First to claim: <code style="user-select: all; background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px;">${newKey}</code>`);
            this.showNotification('Key generated!', 'success');

        } else if (command === '/setrank') {
            const newRank = args[0];
            if (newRank && this.rankDefinitions[newRank]) {
                this.rank = newRank;
                this.saveUserData();
                this.showNotification(`Rank updated to ${newRank}`, 'success');
                this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            } else {
                this.showNotification('Invalid Rank Name', 'error');
            }

        } else if (command === '/kick') {
            const target = args[0];
            if (!target) return this.showNotification('Usage: /kick [username]', 'error');

            const kicked = JSON.parse(localStorage.getItem('quantum_kicked_users') || '[]');
            kicked.push(target);
            localStorage.setItem('quantum_kicked_users', JSON.stringify(kicked));

            this.addChatMessage('System', 'Console', `🚫 <strong>${target}</strong> has been kicked from the server.`);

        } else if (command === '/unkick') {
            const target = args[0];
            if (!target) return this.showNotification('Usage: /unkick [username]', 'error');

            const kicked = JSON.parse(localStorage.getItem('quantum_kicked_users') || '[]');
            const newKicked = kicked.filter(u => u !== target);
            localStorage.setItem('quantum_kicked_users', JSON.stringify(newKicked));

            this.showNotification(`Unkicked ${target}`, 'success');

        } else if (command === '/ban') {
            const target = args[0];
            if (!target) return this.showNotification('Usage: /ban [username]', 'error');

            const blacklist = JSON.parse(localStorage.getItem('quantum_blacklist') || '[]');
            if (!blacklist.includes(target)) {
                blacklist.push(target);
                localStorage.setItem('quantum_blacklist', JSON.stringify(blacklist));
            }

            this.addChatMessage('System', 'Console', `🔨 <strong>${target}</strong> has been BANNED from the server.`);

        } else if (command === '/unban') {
            const target = args[0];
            if (!target) return this.showNotification('Usage: /unban [username]', 'error');

            const blacklist = JSON.parse(localStorage.getItem('quantum_blacklist') || '[]');
            const newBlacklist = blacklist.filter(u => u !== target);
            localStorage.setItem('quantum_blacklist', JSON.stringify(newBlacklist));

            this.showNotification(`Unbanned ${target}`, 'success');

        } else if (command === '/mute') {
            const target = args[0];
            if (!target) return this.showNotification('Usage: /mute [username]', 'error');

            const muted = JSON.parse(localStorage.getItem('quantum_muted_users') || '[]');
            if (!muted.includes(target)) {
                muted.push(target);
                localStorage.setItem('quantum_muted_users', JSON.stringify(muted));
            }

            this.addChatMessage('System', 'Console', `🔇 <strong>${target}</strong> has been muted.`);

        } else if (command === '/warn') {
            const target = args[0];
            if (!target) return this.showNotification('Usage: /warn [username]', 'error');

            const warnings = JSON.parse(localStorage.getItem('quantum_warnings') || '{}');
            if (!warnings[target]) warnings[target] = 0;
            warnings[target]++;
            localStorage.setItem('quantum_warnings', JSON.stringify(warnings));

            this.addChatMessage('System', 'Console', `⚠️ <strong>${target}</strong> has been warned. (Total: ${warnings[target]})`);

        } else if (command === '/announce') {
            const msg = args.join(' ');
            if (!msg) return this.showNotification('Usage: /announce [msg]', 'error');
            this.announcement = msg;
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            this.addChatMessage('System', 'Announcement', `📢 <strong>ANNOUNCEMENT:</strong> ${msg}`);

        } else if (command === '/clear') {
            this.chatMessages = [];
            localStorage.setItem('quantum_global_chat', JSON.stringify([]));
            this.refreshChatDisplay();
            this.showNotification('Chat cleared', 'success');
        }
    }

    addXP(amount) {
        if (!this.currentUser.xp) this.currentUser.xp = 0;
        if (!this.currentUser.level) this.currentUser.level = 1;

        this.currentUser.xp += amount;

        // Level Formula: Level = sqrt(XP / 100)
        const newLevel = Math.floor(Math.sqrt(this.currentUser.xp / 100)) || 1;

        if (newLevel > this.currentUser.level) {
            this.currentUser.level = newLevel;
            this.showNotification(`🎉 Level Up! You are now Level ${newLevel}`, 'success');
            this.addChatMessage('System', 'Bot', `🎉 <strong>${this.currentUser.username}</strong> reached <strong>Level ${newLevel}</strong>!`);

            // Play sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => { });
        }

        this.saveUserData();
    }

    async addChatMessage(user, rank, msg) {
        if (!this.supabase) return;

        const newMessage = {
            username: user,
            rank: rank,
            message: msg
        };

        const { error } = await this.supabase
            .from('chat_messages')
            .insert([newMessage]);

        if (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message', 'error');
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

    renderGeneratorContent() {
        return `
            <h2 style="margin-bottom: 20px;">Script Generator</h2>
            <div class="glass-card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h3 style="margin-bottom: 15px;">Features</h3>
                        <div class="input-group">
                            <label>WalkSpeed</label>
                            <input type="number" id="genWalkSpeed" class="modern-input" value="16">
                        </div>
                        <div class="input-group">
                            <label>JumpPower</label>
                            <input type="number" id="genJumpPower" class="modern-input" value="50">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="genEsp"> ESP (Wallhack)
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="genAimbot"> Aimbot
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="genInfiniteJump"> Infinite Jump
                            </label>
                        </div>
                        <button class="btn-primary" onclick="window.userPortal.generateScript()">
                            <i class="fas fa-bolt"></i> Generate Script
                        </button>
                    </div>
                    <div>
                        <h3 style="margin-bottom: 15px;">Output</h3>
                        <textarea id="genOutput" class="modern-input" style="height: 300px; font-family: monospace;" readonly placeholder="Generated script will appear here..."></textarea>
                        <button class="btn-primary" style="margin-top: 10px; background: rgba(255,255,255,0.1);" onclick="window.userPortal.copyGeneratedScript()">
                            <i class="fas fa-copy"></i> Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMarketplaceContent() {
        return `
            <h2 style="margin-bottom: 20px;">Theme Marketplace</h2>
            <div style="margin-bottom: 20px; display: flex; gap: 10px;">
                <input type="text" id="themeCodeInput" class="modern-input" placeholder="Enter Code (Rank or Theme)..." style="margin-bottom: 0;">
                <button class="btn-primary" style="width: auto;" onclick="window.userPortal.redeemCode()">Redeem</button>
            </div>
            
            <div class="theme-grid">
                ${this.availableThemes.map(theme => `
                    <div class="theme-card ${this.currentUser.theme === theme.name ? 'active' : ''}" onclick="window.userPortal.installTheme('${theme.name}')">
                        <div class="theme-preview" style="background: ${theme.colors['--bg-primary']}; color: ${theme.colors['--text-primary']}; border: 1px solid ${theme.colors['--accent-color']};">
                            ${theme.name}
                        </div>
                        <div style="padding: 10px; text-align: center;">
                            <div style="font-weight: bold; font-size: 14px;">${theme.name}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${theme.author}</div>
                            <div style="font-size: 10px; color: var(--accent-color); margin-top: 5px;">FREE</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    redeemCode() {
        const input = document.getElementById('themeCodeInput');
        const code = input.value.trim().toUpperCase();
        if (!code) return;

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
            if (this.rank === newRank) {
                this.showNotification(`You are already ${newRank}!`, 'info');
                return;
            }
            this.rank = newRank;
            this.saveUserData();
            this.showNotification(`Success! Rank updated to ${newRank}`, 'success');
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));

            // Play success sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => { });
            return;
        }

        // Theme Codes
        const theme = this.availableThemes.find(t => t.code === code);
        if (theme) {
            this.installTheme(theme.name);
            this.showNotification(`Theme ${theme.name} Unlocked & Applied!`, 'success');
            return;
        }

        this.showNotification('Invalid or expired code.', 'error');
    }

    renderCommandsContent() {
        const userPriority = this.rankDefinitions[this.rank].priority;

        return `
            <h2 style="margin-bottom: 20px;">Command Center</h2>
            <div class="glass-card">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--glass-border);">
                    <div style="width: 50px; height: 50px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        <i class="fas ${this.rankDefinitions[this.rank].icon}" style="color: ${this.rankDefinitions[this.rank].color};"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0;">${this.currentUser.username}</h3>
                        <p style="color: var(--text-secondary); margin: 0;">Current Rank: <span style="color: ${this.rankDefinitions[this.rank].color}; font-weight: bold;">${this.rank}</span></p>
                    </div>
                </div>

                <div style="display: grid; gap: 10px;">
                    ${Object.entries(this.commands).map(([cmd, details]) => {
            const requiredPriority = this.rankDefinitions[details.rank].priority;
            const hasPermission = userPriority >= requiredPriority;

            return `
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; opacity: ${hasPermission ? 1 : 0.5};">
                                <div>
                                    <div style="font-family: monospace; font-weight: bold; font-size: 16px; color: ${hasPermission ? 'var(--accent-color)' : 'var(--text-secondary)'};">
                                        ${cmd}
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">${details.desc}</div>
                                    <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">Usage: ${details.usage}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Requires</div>
                                    <div style="font-weight: bold; color: ${this.rankDefinitions[details.rank].color};">
                                        ${details.rank.toUpperCase()}
                                    </div>
                                    ${!hasPermission ? '<div style="color: #ef4444; font-size: 10px; margin-top: 5px;"><i class="fas fa-lock"></i> LOCKED</div>' : '<div style="color: #10b981; font-size: 10px; margin-top: 5px;"><i class="fas fa-check"></i> UNLOCKED</div>'}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    installTheme(themeName) {
        const theme = this.availableThemes.find(t => t.name === themeName);
        if (theme) {
            this.currentUser.theme = themeName;
            this.saveUserData();
            this.applyTheme(themeName);
            this.showNotification(`Theme applied: ${themeName}`, 'success');
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        }
    }

    applyTheme(themeName) {
        const theme = this.availableThemes.find(t => t.name === themeName) || this.availableThemes[0];
        const root = document.documentElement;
        for (const [key, value] of Object.entries(theme.colors)) {
            root.style.setProperty(key, value);
        }
    }

    renderProfileContent() {
        return `
            <h2 style="margin-bottom: 20px;">Profile Settings</h2>
            <div class="glass-card">
                <div class="profile-edit-header">
                    <div class="profile-avatar-edit" onclick="document.getElementById('avatarUpload').click()">
                        ${this.currentUser.avatar ? `<img src="${this.currentUser.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : '<i class="fas fa-user"></i>'}
                    </div>
                    <div>
                        <h3>${this.currentUser.username}</h3>
                        <p style="color: var(--text-secondary);">Rank: ${this.rank}</p>
                    </div>
                </div>
                
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" class="modern-input" value="${this.currentUser.username}" id="editUsername">
                </div>
                
                <div class="input-group">
                    <label>Profile Banner URL</label>
                    <input type="text" class="modern-input" value="${this.currentUser.banner || ''}" id="editBanner" placeholder="https://example.com/image.jpg">
                </div>

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 10px;">Theme Selection</label>
                    <div class="theme-grid">
                        ${this.availableThemes.map(theme => `
                            <div class="theme-card ${this.currentUser.theme === theme.name ? 'active' : ''}" onclick="window.userPortal.installTheme('${theme.name}')">
                                <div class="theme-preview" style="background: ${theme.colors['--bg-primary']}; color: ${theme.colors['--text-primary']}; border: 1px solid ${theme.colors['--accent-color']};">
                                    ${theme.name}
                                </div>
                                <div style="padding: 5px; text-align: center;">
                                    <div style="font-size: 10px; color: var(--text-secondary);">${theme.name}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button class="btn-primary" style="margin-top: 20px;" onclick="window.userPortal.saveProfile()">Save Changes</button>
            </div>
        `;
    }

    saveProfile() {
        const newUsername = document.getElementById('editUsername').value;
        const newBanner = document.getElementById('editBanner').value;

        if (newUsername) this.currentUser.username = newUsername;
        this.currentUser.banner = newBanner;

        this.saveUserData();
        this.showNotification('Profile updated!', 'success');
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
    }

    handleAvatarUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentUser.avatar = e.target.result;
                this.saveUserData();
                this.showNotification('Avatar updated!', 'success');
                this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    renderSupportContent() {
        return `
            <h2 style="margin-bottom: 20px;">Support</h2>
            <div class="support-widget">
                <i class="fab fa-discord" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3>Need Help?</h3>
                <p style="margin-bottom: 20px;">Join our Discord server for 24/7 support and updates.</p>
                <button class="btn-primary" style="background: white; color: #5865F2; width: auto;" onclick="window.open('https://discord.gg/quantum', '_blank')">Join Discord</button>
            </div>
            
            <div class="glass-card" style="margin-top: 20px;">
                <h3><i class="fas fa-robot"></i> AI Assistant</h3>
                <div id="aiChatBox" style="height: 200px; overflow-y: auto; margin: 15px 0; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <div style="color: var(--text-secondary);">Quantum AI: How can I help you today?</div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="aiInput" class="modern-input" placeholder="Ask about scripts, key system..." style="margin-bottom: 0;" onkeypress="if(event.key === 'Enter') window.userPortal.askAI()">
                    <button class="btn-primary" style="width: auto;" onclick="window.userPortal.askAI()">Ask</button>
                </div>
            </div>
        `;
    }

    askAI() {
        const input = document.getElementById('aiInput');
        const question = input.value.trim();
        if (!question) return;

        const chatBox = document.getElementById('aiChatBox');
        chatBox.innerHTML += `<div style="margin-top: 10px; text-align: right; color: var(--text-primary);">You: ${question}</div>`;
        input.value = '';

        // Simulate AI Response
        setTimeout(() => {
            let answer = "I'm not sure about that yet.";
            if (question.toLowerCase().includes('key')) answer = "Keys are generated by admins. You can buy one in our Discord.";
            if (question.toLowerCase().includes('script')) answer = "You can find scripts in the 'My Scripts' tab or generate one in 'Script Gen'.";
            if (question.toLowerCase().includes('hello')) answer = "Hello! I am the Quantum AI Assistant.";

            chatBox.innerHTML += `<div style="margin-top: 10px; color: var(--accent-color);">Quantum AI: ${answer}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    }

    votePoll(optionId) {
        if (this.pollData.userVoted) {
            this.showNotification('You have already voted!', 'warning');
            return;
        }

        const option = this.pollData.options.find(o => o.id === optionId);
        if (option) {
            option.votes++;
            this.pollData.userVoted = true;
            localStorage.setItem('quantum_poll_data_v2', JSON.stringify(this.pollData));
            this.showNotification('Vote recorded!', 'success');
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
        }
    }

    generateScript() {
        const ws = document.getElementById('genWalkSpeed').value || 16;
        const jp = document.getElementById('genJumpPower').value || 50;
        const esp = document.getElementById('genEsp').checked;
        const aimbot = document.getElementById('genAimbot').checked;
        const infJump = document.getElementById('genInfiniteJump').checked;

        let script = `-- Generated by Quantum Portal\n\n`;
        script += `local plr = game.Players.LocalPlayer\n`;
        script += `local char = plr.Character or plr.CharacterAdded:Wait()\n\n`;

        if (ws != 16) script += `char.Humanoid.WalkSpeed = ${ws}\n`;
        if (jp != 50) script += `char.Humanoid.JumpPower = ${jp}\n`;

        if (infJump) {
            script += `\n-- Infinite Jump\ngame:GetService("UserInputService").JumpRequest:Connect(function()\n    char.Humanoid:ChangeState("Jumping")\nend)\n`;
        }

        if (esp) {
            script += `\n-- Simple ESP\nfor _,p in pairs(game.Players:GetPlayers()) do\n    if p ~= plr and p.Character then\n        local h = Instance.new("Highlight", p.Character)\n        h.FillColor = Color3.new(1,0,0)\n    end\nend\n`;
        }

        if (aimbot) {
            script += `\n-- Simple Aimbot (Camera)\nlocal cam = workspace.CurrentCamera\ngame:GetService("RunService").RenderStepped:Connect(function()\n    local target = nil\n    local dist = math.huge\n    for _,p in pairs(game.Players:GetPlayers()) do\n        if p ~= plr and p.Character and p.Character:FindFirstChild("Head") then\n            local d = (p.Character.Head.Position - char.Head.Position).Magnitude\n            if d < dist then target = p.Character.Head; dist = d end\n        end\n    end\n    if target then cam.CFrame = CFrame.new(cam.CFrame.Position, target.Position) end\nend)\n`;
        }

        document.getElementById('genOutput').value = script;
        this.showNotification('Script Generated!', 'success');
    }

    copyGeneratedScript() {
        const output = document.getElementById('genOutput');
        if (!output.value) return;
        navigator.clipboard.writeText(output.value).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        });
    }

    initBackground() {
        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'bgCanvas';
        canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Init Particles
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw connections
            particles.forEach((p, index) => {
                p.update();
                p.draw();

                // Connect nearby particles
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        };
        animate();
    }

    createNewScript() {
        const name = prompt("Enter script name:");
        if (!name) return;
        const content = prompt("Enter script content (Lua):");
        if (!content) return;

        this.scripts.push({ name, content, createdAt: Date.now() });
        this.saveUserData();
        this.showNotification('Script saved!', 'success');
        this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
    }

    deleteScript(index) {
        if (confirm("Are you sure you want to delete this script?")) {
            this.scripts.splice(index, 1);
            this.saveUserData();
            this.showNotification('Script deleted!', 'success');
            this.renderPortal(this.keys.find(k => k.key === this.currentUser.key));
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
        const loader = `loadstring(game:HttpGet("https://raw.githubusercontent.com/sigmalamineee-debug/quantum-portal/main/loader.lua"))()`;
        navigator.clipboard.writeText(loader).then(() => {
            this.showNotification('Loader copied to clipboard!', 'success');
        });
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
        if (this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);
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
