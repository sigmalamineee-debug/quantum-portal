
console.log('admin-keys.js loaded');
window.LOGO_BASE64 = null; // Use logo.png fallback

// Auth and Admin Logic

class AuthManager {
    constructor() {
        this.adminKey = 'ADMIN-123-456';
        this.modKey = 'MOD-789-012';
        this.ownerKey = 'OWNER-999-000';
        this.init();
    }

    init() {
        this.checkAuth();
    }

    checkAuth() {
        const role = localStorage.getItem('admin_role');
        if (role) {
            this.showAdminPanel(role);
        } else {
            this.renderLogin();
        }
    }

    getLogo() {
        return window.LOGO_BASE64 || 'logo.png';
    }

    renderLogin() {
        document.body.innerHTML = '';
        const announcement = JSON.parse(localStorage.getItem('admin_announcement'));

        const container = document.createElement('div');
        container.className = 'auth-container-modern';
        container.innerHTML = `
            <div class="auth-card-modern">
                <div class="auth-header">
                    <div class="auth-logo"><img src="${this.getLogo()}" class="auth-logo-img"></div>
                    <div class="auth-title">Quantum Admin</div>
                    <div class="auth-subtitle">Please sign in to continue</div>
                </div>
                
                ${announcement ? `
                <div class="login-announcement" style="
                    background: rgba(59, 130, 246, 0.1); 
                    border: 1px solid rgba(59, 130, 246, 0.2); 
                    padding: 10px; 
                    border-radius: 8px; 
                    margin-bottom: 20px; 
                    font-size: 13px; 
                    color: var(--text-secondary);
                    text-align: left;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                ">
                    <i class="fas fa-bullhorn" style="color: var(--accent-color);"></i>
                    <span>${announcement.message}</span>
                </div>
                ` : ''}

                <div class="auth-form">
                    <div class="input-group-modern">
                        <i class="fas fa-key input-icon"></i>
                        <input type="password" id="adminKeyInput" placeholder="Enter Access Key">
                    </div>
                    <label class="auth-checkbox">
                        <input type="checkbox" id="rememberMe"> Remember me
                    </label>
                    <a href="#" class="auth-link">Forgot password?</a>
                </div>
                <button class="auth-btn" id="loginBtn">Sign In</button>
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--text-secondary);">
                    <p>Demo Keys:</p>
                    <p>Owner: OWNER-999-000</p>
                    <p>Admin: ADMIN-123-456</p>
                    <p>Mod: MOD-789-012</p>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        container.querySelector('#loginBtn').addEventListener('click', () => this.handleLogin());

        // Enter key support
        document.getElementById('adminKeyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    handleLogin() {
        const key = document.getElementById('adminKeyInput').value;
        const role = this.validateKey(key);

        if (role) {
            localStorage.setItem('admin_auth', 'true');
            localStorage.setItem('admin_role', role);
            this.showNotification(`Login successful! Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}`, 'success');

            // Log login
            const tempAdmin = new AdminKeyManager(role);
            tempAdmin.logActivity('Login', `${role.charAt(0).toUpperCase() + role.slice(1)} logged in`);

            setTimeout(() => this.showAdminPanel(role), 1000);
        } else {
            this.showNotification('Invalid Access Key', 'error');
        }
    }

    validateKey(key) {
        if (key === this.ownerKey) return 'owner';
        if (key === this.adminKey) return 'admin';
        if (key === this.modKey) return 'moderator';
        return null;
    }

    showAdminPanel(role) {
        document.body.innerHTML = '';
        window.adminKeyManager = new AdminKeyManager(role);
    }

    showNotification(message, type = 'info') {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        const colors = {
            success: '#00ff00',
            warning: '#ffaa00',
            error: '#ff3333',
            info: '#3b82f6'
        };

        const notif = document.createElement('div');
        notif.className = 'modern-notification';
        notif.innerHTML = `
            <div class="notif-icon">${icons[type]}</div>
            <div class="notif-message">${message}</div>
        `;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(43, 45, 49, 0.95);
            color: #fff;
            padding: 15px 25px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border-left: 4px solid ${colors[type]};
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 15px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }
}

class AdminKeyManager {
    constructor(role = 'admin') {
        this.role = role;
        // Supabase Integration
        this.supabase = window.supabaseClient;
        this.keys = [];
        this.users = JSON.parse(localStorage.getItem('admin_users')) || [];
        this.activityLog = JSON.parse(localStorage.getItem('admin_activity')) || [];
        this.blacklist = JSON.parse(localStorage.getItem('admin_blacklist')) || [];
        this.announcement = JSON.parse(localStorage.getItem('admin_announcement')) || null;
        this.apiKey = localStorage.getItem('admin_api_key') || null;
        this.currentView = 'dashboard';
        this.init();
    }

    async init() {
        this.renderSidebar();
        await this.fetchKeys(); // Fetch keys from Supabase
        this.renderDashboardView();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.applyTheme(document.body, localStorage.getItem('admin_theme') || '');
    }

    async fetchKeys() {
        if (!this.supabase) {
            console.error('Supabase client not initialized');
            return;
        }

        const { data, error } = await this.supabase
            .from('keys')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            this.showNotification('Error fetching keys: ' + error.message, 'error');
            return;
        }

        this.keys = data || [];
        this.renderKeysView();
        this.renderDashboardView();
    }

    getLogo() {
        return window.LOGO_BASE64 || 'logo.png';
    }

    logActivity(action, details) {
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action: action,
            details: details
        };
        this.activityLog.unshift(log);
        // Keep last 100 logs
        if (this.activityLog.length > 100) this.activityLog.pop();
        localStorage.setItem('admin_activity', JSON.stringify(this.activityLog));
    }

    renderSidebar() {
        const container = document.createElement('div');
        container.className = 'admin-ui-container';
        container.innerHTML = `
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-overlay" id="mobileOverlay"></div>
            <div class="admin-sidebar admin-sidebar-modern" id="adminSidebar">
                <div class="sidebar-header">
                    <img src="${this.getLogo()}" class="sidebar-logo">
                    <span class="sidebar-title">Quantum</span>
                </div>
                <div class="sidebar-menu">
                    <div class="sidebar-item active" data-view="dashboard">
                        <i class="fas fa-chart-line"></i> Dashboard
                    </div>
                    <div class="sidebar-item" data-view="keys">
                        <i class="fas fa-key"></i> Keys
                    </div>
                    <div class="sidebar-item" data-view="users">
                        <i class="fas fa-users"></i> Users
                    </div>
                    <div class="sidebar-item" data-view="blacklist">
                        <i class="fas fa-ban"></i> Blacklist
                    </div>
                    <div class="sidebar-item" data-view="activity">
                        <i class="fas fa-history"></i> Activity
                    </div>
                    ${['admin', 'owner'].includes(this.role) ? `
                    <div class="sidebar-item" data-view="settings">
                        <i class="fas fa-cog"></i> Settings
                    </div>
                    ` : ''}
                </div>
                <div class="sidebar-footer">
                    <div class="sidebar-item" style="cursor: default; opacity: 0.7; font-size: 12px; margin-bottom: 10px;">
                        <i class="fas fa-user-circle"></i> ${this.role.charAt(0).toUpperCase() + this.role.slice(1)}
                    </div>
                    <div class="sidebar-item" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </div>
                </div>
            </div>
            <div class="admin-content" id="mainContent">
                <div class="admin-main-content">
                    <div id="dashboardView" class="admin-view active"></div>
                    <div id="keysView" class="admin-view"></div>
                    <div id="usersView" class="admin-view"></div>
                    <div id="blacklistView" class="admin-view"></div>
                    <div id="activityView" class="admin-view"></div>
                    <div id="settingsView" class="admin-view"></div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Initial render of views
        this.renderDashboardView();
        this.renderKeysView();
        this.renderUsersView();
        this.renderBlacklistView();
        this.renderActivityView();
        this.renderSettingsView();
    }

    renderDashboardView() {
        const view = document.getElementById('dashboardView');
        if (!view) return;

        const totalKeys = this.keys.length;
        const activeKeys = this.keys.filter(k => k.status === 'active').length;
        const totalUsers = this.users.length;
        const totalBans = this.blacklist.length;

        view.innerHTML = `
            <div class="view-header">
                <h2>Dashboard Overview</h2>
                <div class="header-actions">
                    <button class="action-btn" onclick="window.adminKeyManager.refreshDashboard(document.body)"><i class="fas fa-sync-alt"></i> Refresh</button>
                </div>
            </div>

            ${this.renderAnnouncementBanner()}

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6;"><i class="fas fa-key"></i></div>
                    <div class="stat-info">
                        <h3>Total Keys</h3>
                        <p>${totalKeys}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.2); color: #10b981;"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-info">
                        <h3>Active Keys</h3>
                        <p>${activeKeys}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;"><i class="fas fa-ban"></i></div>
                    <div class="stat-info">
                        <h3>Banned IDs</h3>
                        <p>${totalBans}</p>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions-section" style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px; color: rgba(255,255,255,0.7); font-size: 14px; text-transform: uppercase;">Quick Actions</h3>
                <div class="quick-actions-grid" style="display: flex; gap: 15px;">
                    <button class="action-btn primary" id="quickGenerateBtn" style="padding: 15px 25px; display: flex; align-items: center; gap: 10px; background: #ff3333; border: none; border-radius: 12px; color: white; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-plus-circle" style="font-size: 18px;"></i> Generate New Key <span style="font-size: 10px; opacity: 0.7; margin-left: 5px;">(Ctrl+G)</span>
                    </button>
                    ${['admin', 'owner'].includes(this.role) ? `
                    <button class="action-btn secondary" onclick="window.adminKeyManager.switchView(document.body, 'users')" style="padding: 15px 25px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-user-plus" style="font-size: 18px;"></i> Add User
                    </button>
                    ` : ''}
                </div>
            </div>

            <div class="charts-container">
                <div class="chart-card">
                    <h3>Key Usage Trend</h3>
                    <canvas id="trendChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Key Distribution</h3>
                    <canvas id="pieChart"></canvas>
                </div>
            </div>

            <!-- Geo-Analytics Map -->
            <div class="chart-card" style="margin-bottom: 32px;">
                <h3>Live Key Usage Map</h3>
                <div id="worldMap" style="height: 400px; width: 100%; border-radius: 12px; z-index: 1;"></div>
            </div>
        `;

        setTimeout(() => {
            this.initCharts(document.body);
            this.initMap();
        }, 100);
    }

    renderKeysView() {
        const view = document.getElementById('keysView');
        if (!view) return;

        // Initialize filter state if not exists
        if (!this.filterState) {
            this.filterState = {
                search: '',
                status: 'all',
                duration: 'all'
            };
        }

        // Filter keys
        const filteredKeys = this.keys.filter(k => {
            const matchesSearch = k.key.toLowerCase().includes(this.filterState.search.toLowerCase());
            const matchesStatus = this.filterState.status === 'all' || k.status === this.filterState.status;
            const matchesDuration = this.filterState.duration === 'all' || k.duration === this.filterState.duration;
            return matchesSearch && matchesStatus && matchesDuration;
        });

        view.innerHTML = `
            <div class="view-header">
                <h2>Key Management</h2>
                <div class="header-actions">
                    <button class="action-btn secondary" onclick="window.adminKeyManager.exportKeysToCSV()" style="margin-right: 10px;"><i class="fas fa-file-export"></i> Export CSV</button>
                    <button class="action-btn primary" id="generateKeyBtn"><i class="fas fa-plus"></i> Generate Key</button>
                </div>
            </div>
            
            <!-- Search & Filter Toolbar -->
            <div class="filter-toolbar" style="display: flex; gap: 15px; margin-bottom: 20px; background: var(--bg-card); padding: 15px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div class="input-group-modern" style="margin-bottom: 0; flex: 2;">
                    <i class="fas fa-search input-icon"></i>
                    <input type="text" id="keySearchInput" class="modern-input" placeholder="Search keys... (Ctrl+K)" value="${this.filterState.search}">
                </div>
                <select id="statusFilter" class="modern-select" style="flex: 1;">
                    <option value="all" ${this.filterState.status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="active" ${this.filterState.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="paused" ${this.filterState.status === 'paused' ? 'selected' : ''}>Paused</option>
                    <option value="expired" ${this.filterState.status === 'expired' ? 'selected' : ''}>Expired</option>
                </select>
                <select id="durationFilter" class="modern-select" style="flex: 1;">
                    <option value="all" ${this.filterState.duration === 'all' ? 'selected' : ''}>All Durations</option>
                    <option value="1D" ${this.filterState.duration === '1D' ? 'selected' : ''}>1 Day</option>
                    <option value="1W" ${this.filterState.duration === '1W' ? 'selected' : ''}>1 Week</option>
                    <option value="1M" ${this.filterState.duration === '1M' ? 'selected' : ''}>1 Month</option>
                    <option value="3M" ${this.filterState.duration === '3M' ? 'selected' : ''}>3 Months</option>
                    <option value="1Y" ${this.filterState.duration === '1Y' ? 'selected' : ''}>1 Year</option>
                    <option value="LT" ${this.filterState.duration === 'LT' ? 'selected' : ''}>Lifetime</option>
                </select>
            </div>

            <!-- Bulk Actions Toolbar -->
            <div class="bulk-actions-toolbar">
                <span style="color: var(--text-secondary); font-size: 13px; font-weight: 600; margin-right: 8px;">BULK ACTIONS:</span>
                <button class="bulk-action-btn" id="pauseAllBtn"><i class="fas fa-pause"></i> Pause All</button>
                <button class="bulk-action-btn" id="unpauseAllBtn"><i class="fas fa-play"></i> Unpause All</button>
                <button class="bulk-action-btn" id="addTimeAllBtn"><i class="fas fa-clock"></i> Add Time All</button>
            </div>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Expires</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="keysTableBody">
                        ${filteredKeys.length > 0 ? filteredKeys.map(k => `
                            <tr>
                                <td><code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">${k.key}</code></td>
                                <td>${this.getDurationLabel(k.duration)}</td>
                                <td><span class="status-badge ${k.status}">${k.status}</span></td>
                                <td>${new Date(k.created_at).toLocaleDateString()}</td>
                                <td>${k.expires_at ? new Date(parseInt(k.expires_at)).toLocaleDateString() : 'Never'}</td>
                                <td>
                                    <div class="action-btn-group">
                                        <button class="icon-btn copy-btn" onclick="window.adminKeyManager.copyToClipboard('${k.key}')" title="Copy Key">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                        <button class="icon-btn pause-btn" onclick="window.adminKeyManager.toggleKeyStatus('${k.key}')" title="${k.status === 'active' ? 'Pause' : 'Resume'}">
                                            <i class="fas ${k.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                                        </button>
                                        <button class="icon-btn time-btn" onclick="window.adminKeyManager.promptAddTime('${k.key}')" title="Add Time">
                                            <i class="fas fa-clock"></i>
                                        </button>
                                        ${['admin', 'owner'].includes(this.role) ? `
                                        <button class="icon-btn delete-key-btn" data-key="${k.key}" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                                    <i class="fas fa-search empty-state-icon"></i>
                                    No keys found matching your filters
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;

        // Re-attach listeners
        setTimeout(() => {
            const pauseAll = document.getElementById('pauseAllBtn');
            const unpauseAll = document.getElementById('unpauseAllBtn');
            const addTimeAll = document.getElementById('addTimeAllBtn');

            if (pauseAll) pauseAll.onclick = () => this.toggleAllKeys('paused');
            if (unpauseAll) unpauseAll.onclick = () => this.toggleAllKeys('active');
            if (addTimeAll) addTimeAll.onclick = () => this.promptAddTimeAll();

            // Filter Listeners
            document.getElementById('keySearchInput').addEventListener('input', (e) => {
                this.filterState.search = e.target.value;
                this.renderKeysView();
                // Restore focus
                const input = document.getElementById('keySearchInput');
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            });

            document.getElementById('statusFilter').addEventListener('change', (e) => {
                this.filterState.status = e.target.value;
                this.renderKeysView();
            });

            document.getElementById('durationFilter').addEventListener('change', (e) => {
                this.filterState.duration = e.target.value;
                this.renderKeysView();
            });
        }, 0);
    }

    getDurationLabel(code) {
        const map = {
            '1D': '1 Day',
            '1W': '1 Week',
            '1M': '1 Month',
            '3M': '3 Months',
            '1Y': '1 Year',
            'LT': 'Lifetime'
        };
        return map[code] || code || 'Unknown';
    }

    exportKeysToCSV() {
        if (this.keys.length === 0) {
            this.showNotification('No keys to export', 'warning');
            return;
        }

        const headers = ['Key', 'Duration', 'Status', 'Created', 'Expires', 'HWID'];
        const rows = this.keys.map(k => [
            k.key,
            k.duration,
            k.status,
            new Date(k.created_at).toISOString(),
            k.expires_at ? new Date(parseInt(k.expires_at)).toISOString() : 'Never',
            k.hwid || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'quantum_keys_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('Keys exported to CSV', 'success');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy', 'error');
        });
    }

    // --- New Key Management Logic ---

    async toggleKeyStatus(keyStr) {
        const key = this.keys.find(k => k.key === keyStr);
        if (key) {
            const newStatus = key.status === 'active' ? 'paused' : 'active';

            const { error } = await this.supabase
                .from('keys')
                .update({ status: newStatus })
                .eq('key', keyStr);

            if (error) {
                this.showNotification('Error updating status: ' + error.message, 'error');
                return;
            }

            key.status = newStatus;
            this.renderKeysView();
            this.renderDashboardView(); // Update stats
            this.showNotification(`Key ${key.status === 'active' ? 'Resumed' : 'Paused'}`, 'success');
            this.logActivity('Update Status', `Key ${key.key} set to ${key.status}`);
        }
    }

    promptAddTime(keyStr) {
        const duration = prompt("Enter duration to add (e.g., 1D, 1W, 1M):");
        if (duration) {
            this.addTime(keyStr, duration.toUpperCase());
        }
    }

    async addTime(keyStr, durationCode) {
        const key = this.keys.find(k => k.key === keyStr);
        if (!key) return;

        if (key.duration === 'LT' || !key.expires_at) { // Changed expiresAt to expires_at
            this.showNotification('Cannot add time to Lifetime keys', 'warning');
            return;
        }

        let msToAdd = 0;
        switch (durationCode) {
            case '1D': msToAdd = 24 * 60 * 60 * 1000; break;
            case '1W': msToAdd = 7 * 24 * 60 * 60 * 1000; break;
            case '1M': msToAdd = 30 * 24 * 60 * 60 * 1000; break;
            case '3M': msToAdd = 90 * 24 * 60 * 60 * 1000; break;
            case '1Y': msToAdd = 365 * 24 * 60 * 60 * 1000; break;
            default:
                this.showNotification('Invalid duration code (Use 1D, 1W, 1M, 3M, 1Y)', 'error');
                return;
        }

        const newExpiry = parseInt(key.expires_at) + msToAdd;

        const { error } = await this.supabase
            .from('keys')
            .update({ expires_at: newExpiry })
            .eq('key', keyStr);

        if (error) {
            this.showNotification('Error adding time: ' + error.message, 'error');
            return;
        }

        key.expires_at = newExpiry;
        this.renderKeysView();
        this.showNotification(`Added time to key`, 'success');
        this.logActivity('Add Time', `Added ${durationCode} to ${key.key}`);
    }

    toggleAllKeys(targetStatus) {
        if (!confirm(`Are you sure you want to ${targetStatus === 'paused' ? 'PAUSE' : 'UNPAUSE'} ALL keys?`)) return;

        let count = 0;
        this.keys.forEach(k => {
            if (k.status !== targetStatus) {
                k.status = targetStatus;
                count++;
            }
        });

        this.saveKeys();
        this.renderKeysView();
        this.renderDashboardView();
        this.showNotification(`Updated ${count} keys to ${targetStatus}`, 'success');
        this.logActivity('Bulk Update', `Set ${count} keys to ${targetStatus}`);
    }

    promptAddTimeAll() {
        const duration = prompt("Enter duration to add to ALL active keys (e.g., 1D, 1W):");
        if (duration) {
            this.addAllTime(duration.toUpperCase());
        }
    }

    addAllTime(durationCode) {
        let msToAdd = 0;
        switch (durationCode) {
            case '1D': msToAdd = 24 * 60 * 60 * 1000; break;
            case '1W': msToAdd = 7 * 24 * 60 * 60 * 1000; break;
            case '1M': msToAdd = 30 * 24 * 60 * 60 * 1000; break;
            case '3M': msToAdd = 90 * 24 * 60 * 60 * 1000; break;
            case '1Y': msToAdd = 365 * 24 * 60 * 60 * 1000; break;
            default:
                this.showNotification('Invalid duration code', 'error');
                return;
        }

        let count = 0;
        this.keys.forEach(k => {
            if (k.status === 'active' && k.expiresAt) {
                k.expiresAt += msToAdd;
                count++;
            }
        });

        this.saveKeys();
        this.renderKeysView();
        this.showNotification(`Added time to ${count} keys`, 'success');
        this.logActivity('Bulk Add Time', `Added ${durationCode} to ${count} keys`);
    }

    saveKeys() {
        localStorage.setItem('admin_keys', JSON.stringify(this.keys));
    }

    renderGenerateKeyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'generateKeyModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Generate New Key</h3>
                    <button class="close-modal-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="input-group-modern">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-secondary);">Key Duration</label>
                        <select id="keyDurationSelect" class="modern-select" style="width: 100%;">
                            <option value="1D">1 Day</option>
                            <option value="1W">1 Week</option>
                            <option value="1M">1 Month</option>
                            <option value="3M">3 Months</option>
                            <option value="1Y">1 Year</option>
                            <option value="LT">Lifetime</option>
                        </select>
                    </div>
                    <div class="input-group-modern">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-secondary);">Key Type</label>
                        <div style="display: flex; gap: 15px;">
                            <label class="auth-checkbox" style="margin: 0;">
                                <input type="radio" name="keyType" value="raw" checked> Raw Key
                            </label>
                            <label class="auth-checkbox" style="margin: 0;">
                                <input type="radio" name="keyType" value="hwid"> HWID Locked
                            </label>
                        </div>
                    </div>
                    <div id="hwidInputSection" style="display: none; margin-top: 15px;">
                        <input type="text" id="targetHwid" class="modern-input" placeholder="Enter Target HWID">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modern-btn secondary close-modal-btn" style="padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; cursor: pointer;">Cancel</button>
                    <button class="modern-btn primary" id="confirmGenerateBtn" style="padding: 10px 20px; border-radius: 8px; border: none; background: var(--accent-color, #ff3333); color: white; font-weight: 600; cursor: pointer;">Generate</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event Listeners
        const closeBtns = modal.querySelectorAll('.close-modal-btn');
        closeBtns.forEach(btn => btn.onclick = () => modal.remove());

        const typeRadios = modal.querySelectorAll('input[name="keyType"]');
        const hwidSection = modal.querySelector('#hwidInputSection');
        typeRadios.forEach(radio => {
            radio.onchange = (e) => {
                hwidSection.style.display = e.target.value === 'hwid' ? 'block' : 'none';
            };
        });

        modal.querySelector('#confirmGenerateBtn').onclick = () => {
            const duration = document.getElementById('keyDurationSelect').value;
            const type = document.querySelector('input[name="keyType"]:checked').value;
            const hwid = type === 'hwid' ? document.getElementById('targetHwid').value : null;

            if (type === 'hwid' && !hwid) {
                this.showNotification('Please enter a HWID', 'warning');
                return;
            }

            this.handleGenerateKey(duration, hwid);
            modal.remove();
        };
    }

    async handleGenerateKey(duration, hwid) {
        const prefix = localStorage.getItem('admin_key_prefix') || 'QTM';
        let key = "";
        if (hwid) {
            // Simple hash for demo
            const hash = btoa(hwid + "QUANTUM_SALT").substring(0, 16).toUpperCase();
            key = `${prefix}-${duration}-${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
        } else {
            const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
            const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
            key = `${prefix}-${duration}-${seg1}-${seg2}`;
        }

        let expiresAt = null;
        const now = Date.now();
        switch (duration) {
            case '1D': expiresAt = now + (24 * 60 * 60 * 1000); break;
            case '1W': expiresAt = now + (7 * 24 * 60 * 60 * 1000); break;
            case '1M': expiresAt = now + (30 * 24 * 60 * 60 * 1000); break;
            case '3M': expiresAt = now + (90 * 24 * 60 * 60 * 1000); break;
            case '1Y': expiresAt = now + (365 * 24 * 60 * 60 * 1000); break;
            case 'LT': expiresAt = null; break;
        }

        const newKey = {
            key: key,
            duration: duration,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: expiresAt,
            hwid: hwid || null
        };

        const { data, error } = await this.supabase
            .from('keys')
            .insert([newKey])
            .select();

        if (error) {
            this.showNotification('Error generating key: ' + error.message, 'error');
            return;
        }

        if (data && data.length > 0) {
            this.keys.unshift(data[0]);
            this.renderKeysView();
            this.renderDashboardView();
            this.showNotification(`Generated ${this.getDurationLabel(duration)} Key`, 'success');
            this.logActivity('Generate Key', `Generated ${duration} key`);
        }
    }

    renderUsersView() {
        const view = document.getElementById('usersView');
        if (!view) return;
        view.innerHTML = `
            <div class="view-header">
                <h2>User Management</h2>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        ${this.users.map(u => `
                            <tr>
                                <td>${u.username}</td>
                                <td>${u.email || 'N/A'}</td>
                                <td>${u.role || 'User'}</td>
                                <td>${new Date(u.joinedAt || Date.now()).toLocaleDateString()}</td>
                                <td>
                                    ${['admin', 'owner'].includes(this.role) ? `
                                    <button class="icon-btn"><i class="fas fa-edit"></i></button>
                                    <button class="icon-btn delete-user-btn"><i class="fas fa-trash"></i></button>
                                    ` : '<span style="color: var(--text-secondary); font-size: 12px;">Read Only</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderBlacklistView() {
        const view = document.getElementById('blacklistView');
        if (!view) return;
        view.innerHTML = `
            <div class="view-header">
                <h2>Ban System (Blacklist)</h2>
                ${['admin', 'owner'].includes(this.role) ? `
                <button class="action-btn primary" onclick="window.adminKeyManager.promptBan()"><i class="fas fa-ban"></i> Add Ban</button>
                ` : ''}
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Value (HWID/IP)</th>
                            <th>Reason</th>
                            <th>Date Banned</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="blacklistTableBody">
                        ${this.blacklist.length > 0 ? this.blacklist.map((ban, index) => `
                            <tr>
                                <td><span class="status-badge expired">${ban.type.toUpperCase()}</span></td>
                                <td><code>${ban.value}</code></td>
                                <td>${ban.reason || 'No reason provided'}</td>
                                <td>${new Date(ban.date).toLocaleDateString()}</td>
                                <td>
                                    ${['admin', 'owner'].includes(this.role) ? `
                                    <button class="icon-btn delete-key-btn" onclick="window.adminKeyManager.removeBan(${index})" title="Unban">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    ` : '<span style="color: var(--text-secondary); font-size: 12px;">Read Only</span>'}
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                                    <i class="fas fa-check-circle empty-state-icon" style="color: var(--success);"></i>
                                    No active bans
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    promptBan() {
        const type = prompt("Enter ban type (HWID or IP):", "HWID");
        if (!type) return;

        const value = prompt(`Enter ${type.toUpperCase()} to ban:`);
        if (!value) return;

        const reason = prompt("Enter reason for ban:", "Violation of TOS");

        this.addBan(type.toLowerCase(), value, reason);
    }

    addBan(type, value, reason) {
        this.blacklist.push({
            type: type,
            value: value,
            reason: reason,
            date: Date.now()
        });
        localStorage.setItem('admin_blacklist', JSON.stringify(this.blacklist));
        this.renderBlacklistView();
        this.renderDashboardView();
        this.showNotification('User banned successfully', 'success');
        this.logActivity('Ban User', `Banned ${type.toUpperCase()}: ${value}`);
    }

    removeBan(index) {
        if (!confirm('Are you sure you want to unban this user?')) return;
        const removed = this.blacklist.splice(index, 1)[0];
        localStorage.setItem('admin_blacklist', JSON.stringify(this.blacklist));
        this.renderBlacklistView();
        this.renderDashboardView();
        this.showNotification('User unbanned', 'success');
        this.logActivity('Unban User', `Unbanned ${removed.value}`);
    }

    renderActivityView() {
        const view = document.getElementById('activityView');
        if (!view) return;
        view.innerHTML = `
            <div class="view-header">
                <h2>Activity Log</h2>
                <button class="action-btn secondary" onclick="if(confirm('Clear log?')) { localStorage.removeItem('admin_activity'); window.adminKeyManager.activityLog = []; window.adminKeyManager.renderActivityView(); }"><i class="fas fa-trash"></i> Clear Log</button>
            </div>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody id="activityTableBody">
                        ${this.activityLog.length > 0 ? this.activityLog.map(log => `
                            <tr>
                                <td style="color: var(--text-secondary); font-size: 13px;">${new Date(log.timestamp).toLocaleString()}</td>
                                <td><span style="font-weight: 600; color: var(--accent-color);">${log.action}</span></td>
                                <td>${log.details}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="3" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                                    <i class="fas fa-history" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                                    No activity recorded
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderSettingsView() {
        const view = document.getElementById('settingsView');
        if (!view) return;

        const currentTheme = localStorage.getItem('admin_theme') || '';

        view.innerHTML = `
            <div class="view-header">
                <h2>Settings</h2>
            </div>
            <div class="settings-container">
                <div class="setting-group">
                    <h3>Appearance</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">Customize your admin panel experience.</p>
                    <div class="theme-selector" style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button class="theme-btn ${currentTheme === '' ? 'active' : ''}" data-theme="" style="background: linear-gradient(135deg, #0f1115, #1a1d23)">Cyberpunk</button>
                        <button class="theme-btn ${currentTheme === 'theme-midnight' ? 'active' : ''}" data-theme="theme-midnight" style="background: linear-gradient(135deg, #0f172a, #1e293b)">Midnight</button>
                        <button class="theme-btn ${currentTheme === 'theme-sunset' ? 'active' : ''}" data-theme="theme-sunset" style="background: linear-gradient(135deg, #2e1065, #5b21b6)">Sunset</button>
                        <button class="theme-btn ${currentTheme === 'theme-nature' ? 'active' : ''}" data-theme="theme-nature" style="background: linear-gradient(135deg, #052e16, #065f46)">Nature</button>
                        
                        <!-- Seasonal Themes -->
                        <button class="theme-btn ${currentTheme === 'theme-christmas' ? 'active' : ''}" data-theme="theme-christmas" style="background: linear-gradient(135deg, #0f2e1c, #c92a2a)">Christmas</button>
                        <button class="theme-btn ${currentTheme === 'theme-halloween' ? 'active' : ''}" data-theme="theme-halloween" style="background: linear-gradient(135deg, #1a0524, #ff6b00)">Halloween</button>
                        <button class="theme-btn ${currentTheme === 'theme-summer' ? 'active' : ''}" data-theme="theme-summer" style="background: linear-gradient(135deg, #0f3460, #f6d32d); color: #000;">Summer</button>
                        <button class="theme-btn ${currentTheme === 'theme-thanksgiving' ? 'active' : ''}" data-theme="theme-thanksgiving" style="background: linear-gradient(135deg, #2e1a0f, #d35400)">Thanksgiving</button>
                        <button class="theme-btn ${currentTheme === 'theme-newyears' ? 'active' : ''}" data-theme="theme-newyears" style="background: linear-gradient(135deg, #000000, #ffd700)">New Years</button>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>System</h3>
                    <div class="input-group-modern" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; color: var(--text-secondary);">Key Prefix</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="keyPrefixInput" class="modern-input" value="${localStorage.getItem('admin_key_prefix') || 'QTM'}" placeholder="e.g. MYGAME">
                            <button class="action-btn primary" onclick="
                                const prefix = document.getElementById('keyPrefixInput').value.trim().toUpperCase();
                                if(prefix) {
                                    localStorage.setItem('admin_key_prefix', prefix);
                                    window.adminKeyManager.showNotification('Key Prefix Updated', 'success');
                                }
                            ">Save</button>
                        </div>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Keys will be generated as: <span id="prefixPreview">${localStorage.getItem('admin_key_prefix') || 'QTM'}-1D-XXXX-XXXX</span></p>
                    </div>
                    <button class="action-btn" id="clearDataBtn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);"><i class="fas fa-trash-alt"></i> Clear All Data</button>
                </div>
                
                <div class="setting-group">
                    <h3>Global Announcement</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">Set a message for all users.</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="announcementInput" class="modern-input" placeholder="Enter announcement message..." value="${this.announcement ? this.announcement.message : ''}">
                        <select id="announcementType" class="modern-select" style="width: 150px;">
                            <option value="info" ${this.announcement && this.announcement.type === 'info' ? 'selected' : ''}>Info</option>
                            <option value="warning" ${this.announcement && this.announcement.type === 'warning' ? 'selected' : ''}>Warning</option>
                            <option value="error" ${this.announcement && this.announcement.type === 'error' ? 'selected' : ''}>Error</option>
                            <option value="success" ${this.announcement && this.announcement.type === 'success' ? 'selected' : ''}>Success</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="action-btn primary" onclick="
                            const msg = document.getElementById('announcementInput').value;
                            const type = document.getElementById('announcementType').value;
                            window.adminKeyManager.setAnnouncement(msg, type);
                        ">Update</button>
                        <button class="action-btn secondary" onclick="window.adminKeyManager.setAnnouncement(null)">Clear</button>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>Developer API</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">Manage your project's API key for external integrations.</p>
                    <div class="input-group-modern" style="display: flex; gap: 10px;">
                        <input type="text" id="apiKeyDisplay" class="modern-input" value="${this.apiKey || 'No API Key Generated'}" readonly style="font-family: monospace; letter-spacing: 1px;">
                        <button class="action-btn primary" onclick="window.adminKeyManager.generateApiKey()"><i class="fas fa-sync"></i> Generate</button>
                        <button class="action-btn secondary" onclick="navigator.clipboard.writeText(document.getElementById('apiKeyDisplay').value); window.adminKeyManager.showNotification('Copied to clipboard', 'success')"><i class="fas fa-copy"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    switchView(panel, view) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) item.classList.add('active');
        });
        document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');
        this.currentView = view;
        if (view === 'dashboard') this.refreshDashboard(panel);
        if (view === 'activity') this.renderActivityView();
        if (view === 'blacklist') this.renderBlacklistView();
    }

    refreshDashboard(panel) {
        this.renderDashboardView();
    }

    refreshActivityFeed(panel) {
        // Placeholder
    }

    showNotification(message, type = 'info') {
        const auth = new AuthManager();
        auth.showNotification(message, type);
    }

    applyTheme(element, theme) {
        // Remove all theme classes first
        document.body.classList.remove('theme-midnight', 'theme-sunset', 'theme-nature', 'theme-christmas', 'theme-halloween', 'theme-summer', 'theme-thanksgiving', 'theme-newyears');

        // Add new theme class if it's not default
        if (theme) {
            document.body.classList.add(theme);
        }

        localStorage.setItem('admin_theme', theme);

        // Update active state in settings if visible
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // Trigger Theme Effects
        this.clearThemeEffects();
        if (theme === 'theme-christmas') this.startSnowEffect();
        if (theme === 'theme-halloween') this.startHalloweenEffect();
        if (theme === 'theme-summer') this.startSummerEffect();
        if (theme === 'theme-thanksgiving') this.startThanksgivingEffect();
        if (theme === 'theme-newyears') this.startNewYearsEffect();
    }

    clearThemeEffects() {
        const container = document.getElementById('theme-effect-container');
        if (container) container.remove();
    }

    createEffectContainer() {
        let container = document.getElementById('theme-effect-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'theme-effect-container';
            document.body.appendChild(container);
        }
        return container;
    }

    startSnowEffect() {
        const container = this.createEffectContainer();
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'theme-particle particle-snow';
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationName = 'fall';
            container.appendChild(particle);
        }
    }

    startHalloweenEffect() {
        const container = this.createEffectContainer();
        const particleCount = 20;
        const icons = ['👻', '🦇', '🎃', '🕸️'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'theme-particle particle-ghost';
            particle.innerText = icons[Math.floor(Math.random() * icons.length)];
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.fontSize = `${Math.random() * 20 + 15}px`;
            particle.style.animationDuration = `${Math.random() * 5 + 3}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationName = 'floatUp';
            container.appendChild(particle);
        }
    }

    startSummerEffect() {
        const container = this.createEffectContainer();
        // Sun glare / subtle overlay
        const sun = document.createElement('div');
        sun.style.position = 'absolute';
        sun.style.top = '-100px';
        sun.style.right = '-100px';
        sun.style.width = '300px';
        sun.style.height = '300px';
        sun.style.background = 'radial-gradient(circle, rgba(246, 211, 45, 0.4) 0%, rgba(246, 211, 45, 0) 70%)';
        sun.style.borderRadius = '50%';
        sun.style.pointerEvents = 'none';
        container.appendChild(sun);
    }

    startThanksgivingEffect() {
        const container = this.createEffectContainer();
        const particleCount = 30;
        const icons = ['🍂', '🍁', '🦃', '🥧'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'theme-particle particle-leaf';
            particle.innerText = icons[Math.floor(Math.random() * icons.length)];
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.fontSize = `${Math.random() * 20 + 15}px`;
            particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationName = 'fall';
            container.appendChild(particle);
        }
    }

    startNewYearsEffect() {
        const container = this.createEffectContainer();
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'theme-particle particle-sparkle';
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.animationDuration = `${Math.random() * 2 + 1}s`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.animationName = 'explode';
            container.appendChild(particle);
        }
    }

    setupEventListeners() {
        document.body.addEventListener('click', (e) => {
            const sidebarItem = e.target.closest('.sidebar-item');
            if (sidebarItem && sidebarItem.dataset.view) {
                this.switchView(document.body, sidebarItem.dataset.view);
                // Close mobile menu on selection
                if (window.innerWidth <= 768) {
                    this.toggleMobileMenu(false);
                }
            }

            if (e.target.closest('#mobileMenuBtn')) {
                this.toggleMobileMenu(true);
            }

            if (e.target.closest('#mobileOverlay')) {
                this.toggleMobileMenu(false);
            }

            if (e.target.closest('#logoutBtn')) {
                this.logout();
            }

            if (e.target.closest('.theme-btn')) {
                const theme = e.target.closest('.theme-btn').dataset.theme;
                this.applyTheme(document.body, theme);
            }

            if (e.target.closest('#generateKeyBtn') || e.target.closest('#quickGenerateBtn')) {
                this.renderGenerateKeyModal();
            }

            if (e.target.closest('.delete-key-btn') && !e.target.closest('#blacklistView')) {
                const key = e.target.closest('.delete-key-btn').dataset.key;
                this.keys = this.keys.filter(k => k.key !== key);
                localStorage.setItem('admin_keys', JSON.stringify(this.keys));
                this.renderKeysView();
                this.renderDashboardView();
                this.showNotification('Key deleted', 'success');
                this.logActivity('Delete Key', `Deleted key ${key} `);
            }

            if (e.target.closest('#clearDataBtn')) {
                if (confirm('Are you sure? This will wipe all data.')) {
                    localStorage.clear();
                    location.reload();
                }
            }
        });
    }

    toggleMobileMenu(show) {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (show) {
            sidebar.classList.add('mobile-active');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Focus Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('keySearchInput');
                if (searchInput) {
                    searchInput.focus();
                    this.switchView(document.body, 'keys');
                }
            }
            // Ctrl/Cmd + G: Generate Key
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                this.renderGenerateKeyModal();
            }
        });
    }

    logout() {
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_role');
        location.reload();
    }

    initCharts(panel) {
        const trendCanvas = document.getElementById('trendChart');
        const pieCanvas = document.getElementById('pieChart');

        if (trendCanvas && pieCanvas) {
            // Destroy existing charts if any
            if (this.trendChart) this.trendChart.destroy();
            if (this.pieChart) this.pieChart.destroy();

            this.renderTrendChart(trendCanvas);
            this.renderDistributionChart(pieCanvas);
        }
    }

    renderTrendChart(canvas) {
        // Process data: Keys created per day (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const data = last7Days.map(date => {
            return this.keys.filter(k => {
                const kDate = new Date(k.createdAt || k.created).toISOString().split('T')[0];
                return kDate === date;
            }).length;
        });

        this.trendChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: last7Days.map(d => new Date(d).toLocaleDateString(undefined, { weekday: 'short' })),
                datasets: [{
                    label: 'New Keys',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    renderDistributionChart(canvas) {
        const active = this.keys.filter(k => k.status === 'active').length;
        const paused = this.keys.filter(k => k.status === 'paused').length;
        const expired = this.keys.filter(k => k.status === 'expired').length;

        this.pieChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Paused', 'Expired'],
                datasets: [{
                    data: [active, paused, expired],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#9ca3af' } }
                },
                cutout: '70%'
            }
        });
    }

    initMap() {
        const mapContainer = document.getElementById('worldMap');
        if (!mapContainer || this.mapInitialized) return;

        // Initialize Leaflet Map
        const map = L.map('worldMap').setView([20, 0], 2);

        // Dark theme tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Realistic Locations Database
        const locations = [
            { name: "New York, USA", lat: 40.7128, lng: -74.0060 },
            { name: "London, UK", lat: 51.5074, lng: -0.1278 },
            { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
            { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050 },
            { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
            { name: "Toronto, Canada", lat: 43.65107, lng: -79.347015 },
            { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
            { name: "Singapore", lat: 1.3521, lng: 103.8198 },
            { name: "Sao Paulo, Brazil", lat: -23.5505, lng: -46.6333 },
            { name: "Auckland, New Zealand", lat: -36.8485, lng: 174.7633 } // User's location
        ];

        // Process keys to assign locations if missing
        let updated = false;
        // Sort by creation date (oldest first) to identify the first key
        const sortedKeys = [...this.keys].sort((a, b) => (a.createdAt || a.created) - (b.createdAt || b.created));

        sortedKeys.forEach((key, index) => {
            // Find the actual key object in the main array to update
            const originalKey = this.keys.find(k => k.key === key.key);

            if (!originalKey.location) {
                updated = true;
                if (index === 0) {
                    // First key ever created -> New Zealand
                    originalKey.location = locations.find(l => l.name.includes("New Zealand"));
                } else {
                    // Random realistic location
                    originalKey.location = locations[Math.floor(Math.random() * locations.length)];
                }
            }
        });

        if (updated) {
            this.saveKeys();
        }

        // Render Markers
        this.keys.forEach(key => {
            if (key.status === 'active' && key.location) {
                L.circleMarker([key.location.lat, key.location.lng], {
                    radius: 6,
                    fillColor: "#3b82f6",
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map)
                    .bindPopup(`< b > Key Active</b > <br>Key: ${key.key.substring(0, 8)}...<br>Location: ${key.location.name}`);
            }
        });

        this.mapInitialized = true;
    }

    updateWorldMap(panel) {
        // Placeholder
    }

    setAnnouncement(message, type = 'info') {
        if (!message) {
            this.announcement = null;
            localStorage.removeItem('admin_announcement');
            this.showNotification('Announcement cleared', 'success');
        } else {
            this.announcement = {
                message: message,
                type: type, // info, warning, error, success
                date: Date.now(),
                author: this.role
            };
            localStorage.setItem('admin_announcement', JSON.stringify(this.announcement));
            this.showNotification('Announcement updated', 'success');
        }
        this.renderDashboardView();
        this.logActivity('Update Announcement', message ? 'Set new announcement' : 'Cleared announcement');
    }

    renderAnnouncementBanner() {
        if (!this.announcement) return '';

        const colors = {
            info: 'rgba(59, 130, 246, 0.15)',
            warning: 'rgba(245, 158, 11, 0.15)',
            error: 'rgba(239, 68, 68, 0.15)',
            success: 'rgba(16, 185, 129, 0.15)'
        };

        const borderColors = {
            info: '#3b82f6',
            warning: '#f59e0b',
            error: '#ef4444',
            success: '#10b981'
        };

        const icons = {
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-exclamation-circle',
            success: 'fa-check-circle'
        };

        return `
            <div class="announcement-banner" style="
                background: ${colors[this.announcement.type]}; 
                border-left: 4px solid ${borderColors[this.announcement.type]};
                padding: 15px 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: slideDown 0.3s ease-out;
            ">
                <i class="fas ${icons[this.announcement.type]}" style="color: ${borderColors[this.announcement.type]}; font-size: 20px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">Announcement</div>
                    <div style="color: var(--text-secondary); font-size: 14px;">${this.announcement.message}</div>
                </div>
                ${['admin', 'owner'].includes(this.role) ? `
                <button onclick="window.adminKeyManager.setAnnouncement(null)" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 5px;">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
            </div>
            `;
    }

    generateApiKey() {
        if (this.apiKey && !confirm('Generating a new API Key will invalidate the old one. Continue?')) return;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = 'QTM_API_';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        this.apiKey = key;
        localStorage.setItem('admin_api_key', key);
        this.renderSettingsView();
        this.showNotification('New API Key Generated', 'success');
        this.logActivity('Generate API Key', 'Regenerated Project API Key');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

