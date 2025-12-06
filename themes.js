// Quantum UI - Advanced Theme System
// Supports multiple preset themes and custom colors

class ThemeManager {
    constructor() {
        this.themes = {
            // Basic Themes
            christmas: {
                name: '🎄 Christmas',
                category: 'seasonal',
                colors: {
                    primary: '#ff3333',
                    secondary: '#00ff00',
                    background: '#1a1d23',
                    surface: '#2b2d31',
                    surfaceLight: '#383a40',
                    text: '#f2f3f5',
                    textSecondary: '#b5bac1',
                    border: 'rgba(255, 51, 51, 0.3)',
                    accent: '#ff3333'
                },
                effects: {
                    snow: true,
                    particles: 150
                }
            },
            dark: {
                name: '🌙 Dark Mode',
                category: 'basic',
                colors: {
                    primary: '#6366f1',
                    secondary: '#8b5cf6',
                    background: '#0f1115',
                    surface: '#1a1d23',
                    surfaceLight: '#2b2d31',
                    text: '#f2f3f5',
                    textSecondary: '#9ca3af',
                    border: 'rgba(99, 102, 241, 0.3)',
                    accent: '#6366f1'
                },
                effects: {
                    snow: false,
                    particles: 0
                }
            },
            light: {
                name: '☀️ Light Mode',
                category: 'basic',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#06b6d4',
                    background: '#f9fafb',
                    surface: '#ffffff',
                    surfaceLight: '#f3f4f6',
                    text: '#111827',
                    textSecondary: '#6b7280',
                    border: 'rgba(59, 130, 246, 0.3)',
                    accent: '#3b82f6'
                },
                effects: {
                    snow: false,
                    particles: 0
                }
            },
            blue: {
                name: '💙 Ocean Blue',
                category: 'colored',
                colors: {
                    primary: '#0ea5e9',
                    secondary: '#06b6d4',
                    background: '#0c1222',
                    surface: '#1e293b',
                    surfaceLight: '#334155',
                    text: '#f1f5f9',
                    textSecondary: '#94a3b8',
                    border: 'rgba(14, 165, 233, 0.3)',
                    accent: '#0ea5e9'
                },
                effects: {
                    snow: false,
                    particles: 50
                }
            },
            red: {
                name: '❤️ Crimson Red',
                category: 'colored',
                colors: {
                    primary: '#ef4444',
                    secondary: '#f97316',
                    background: '#1a0f0f',
                    surface: '#2d1a1a',
                    surfaceLight: '#3d2424',
                    text: '#fef2f2',
                    textSecondary: '#fca5a5',
                    border: 'rgba(239, 68, 68, 0.3)',
                    accent: '#ef4444'
                },
                effects: {
                    snow: false,
                    particles: 0
                }
            },
            gold: {
                name: '👑 Fancy Gold',
                category: 'premium',
                colors: {
                    primary: '#fbbf24',
                    secondary: '#f59e0b',
                    background: '#1a1410',
                    surface: '#2d2416',
                    surfaceLight: '#3d3420',
                    text: '#fef3c7',
                    textSecondary: '#fcd34d',
                    border: 'rgba(251, 191, 36, 0.3)',
                    accent: '#fbbf24'
                },
                effects: {
                    snow: false,
                    particles: 100,
                    particleColor: '#fbbf24'
                }
            },
            diamond: {
                name: '💎 Diamond',
                category: 'premium',
                colors: {
                    primary: '#a5f3fc',
                    secondary: '#67e8f9',
                    background: '#0a1420',
                    surface: '#1a2432',
                    surfaceLight: '#2a3442',
                    text: '#f0f9ff',
                    textSecondary: '#bae6fd',
                    border: 'rgba(165, 243, 252, 0.3)',
                    accent: '#a5f3fc'
                },
                effects: {
                    snow: false,
                    particles: 80,
                    particleColor: '#a5f3fc'
                }
            },
            halloween: {
                name: '🎃 Halloween',
                category: 'seasonal',
                colors: {
                    primary: '#ff6b00',
                    secondary: '#9333ea',
                    background: '#0f0a1a',
                    surface: '#1a0f2e',
                    surfaceLight: '#2a1f3e',
                    text: '#fef3c7',
                    textSecondary: '#c084fc',
                    border: 'rgba(255, 107, 0, 0.3)',
                    accent: '#ff6b00'
                },
                effects: {
                    snow: false,
                    particles: 60,
                    particleColor: '#ff6b00'
                }
            },
            thanksgiving: {
                name: '🦃 Thanksgiving',
                category: 'seasonal',
                colors: {
                    primary: '#d97706',
                    secondary: '#dc2626',
                    background: '#1a1108',
                    surface: '#2d1f10',
                    surfaceLight: '#3d2f20',
                    text: '#fef3c7',
                    textSecondary: '#fcd34d',
                    border: 'rgba(217, 119, 6, 0.3)',
                    accent: '#d97706'
                },
                effects: {
                    snow: false,
                    particles: 40,
                    particleColor: '#d97706'
                }
            },
            purple: {
                name: '💜 Royal Purple',
                category: 'colored',
                colors: {
                    primary: '#a855f7',
                    secondary: '#c084fc',
                    background: '#140a1f',
                    surface: '#1e1232',
                    surfaceLight: '#2e2242',
                    text: '#faf5ff',
                    textSecondary: '#d8b4fe',
                    border: 'rgba(168, 85, 247, 0.3)',
                    accent: '#a855f7'
                },
                effects: {
                    snow: false,
                    particles: 0
                }
            },
            green: {
                name: '💚 Forest Green',
                category: 'colored',
                colors: {
                    primary: '#10b981',
                    secondary: '#34d399',
                    background: '#0a1a0f',
                    surface: '#1a2d1f',
                    surfaceLight: '#2a3d2f',
                    text: '#f0fdf4',
                    textSecondary: '#86efac',
                    border: 'rgba(16, 185, 129, 0.3)',
                    accent: '#10b981'
                },
                effects: {
                    snow: false,
                    particles: 0
                }
            }
        };

        this.currentTheme = this.loadTheme();
        this.apply(this.currentTheme);
    }

    loadTheme() {
        const saved = localStorage.getItem('quantum_theme');
        return saved || 'christmas';
    }

    saveTheme(themeName) {
        localStorage.setItem('quantum_theme', themeName);
    }

    apply(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        const colors = theme.colors;

        // Apply CSS variables
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-surface', colors.surface);
        root.style.setProperty('--color-surface-light', colors.surfaceLight);
        root.style.setProperty('--color-text', colors.text);
        root.style.setProperty('--color-text-secondary', colors.textSecondary);
        root.style.setProperty('--color-border', colors.border);
        root.style.setProperty('--color-accent', colors.accent);

        // Apply effects
        if (window.snowManager) {
            if (theme.effects.snow) {
                window.snowManager.setIntensity(theme.effects.particles);
                window.snowManager.setColor(theme.effects.particleColor || '#ffffff');
            } else if (theme.effects.particles > 0) {
                window.snowManager.setIntensity(theme.effects.particles);
                window.snowManager.setColor(theme.effects.particleColor || colors.primary);
            } else {
                window.snowManager.setIntensity(0);
            }
        }

        this.currentTheme = themeName;
        this.saveTheme(themeName);

        // Trigger custom event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }

    getThemesByCategory() {
        const categories = {
            basic: [],
            colored: [],
            premium: [],
            seasonal: []
        };

        Object.entries(this.themes).forEach(([key, theme]) => {
            categories[theme.category].push({ key, ...theme });
        });

        return categories;
    }

    createThemeSelector() {
        const categories = this.getThemesByCategory();

        let html = '<div class="theme-selector">';

        // Basic Themes
        html += '<div class="theme-category">';
        html += '<h3>Basic Themes</h3>';
        html += '<div class="theme-grid">';
        categories.basic.forEach(theme => {
            html += this.createThemeCard(theme);
        });
        html += '</div></div>';

        // Colored Themes
        html += '<div class="theme-category">';
        html += '<h3>Colored Themes</h3>';
        html += '<div class="theme-grid">';
        categories.colored.forEach(theme => {
            html += this.createThemeCard(theme);
        });
        html += '</div></div>';

        // Premium Themes
        html += '<div class="theme-category">';
        html += '<h3>Premium Themes ✨</h3>';
        html += '<div class="theme-grid">';
        categories.premium.forEach(theme => {
            html += this.createThemeCard(theme);
        });
        html += '</div></div>';

        // Seasonal Themes
        html += '<div class="theme-category">';
        html += '<h3>Seasonal Themes 🎉</h3>';
        html += '<div class="theme-grid">';
        categories.seasonal.forEach(theme => {
            html += this.createThemeCard(theme);
        });
        html += '</div></div>';

        html += '</div>';
        return html;
    }

    createThemeCard(theme) {
        const isActive = this.currentTheme === theme.key;
        const colors = theme.colors;

        return `
            <div class="theme-card ${isActive ? 'active' : ''}" data-theme="${theme.key}">
                <div class="theme-preview" style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});">
                    <div class="theme-preview-surface" style="background: ${colors.surface};"></div>
                </div>
                <div class="theme-name">${theme.name}</div>
                ${isActive ? '<div class="theme-active-badge">✓ Active</div>' : ''}
            </div>
        `;
    }
}

// Add CSS for theme selector
const style = document.createElement('style');
style.textContent = `
    .theme-selector {
        max-height: 60vh;
        overflow-y: auto;
        padding: 10px;
    }

    .theme-category {
        margin-bottom: 30px;
    }

    .theme-category h3 {
        color: var(--color-text, #f2f3f5);
        font-size: 16px;
        margin-bottom: 15px;
        font-weight: 600;
    }

    .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
    }

    .theme-card {
        background: var(--color-surface-light, #383a40);
        border-radius: 12px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        position: relative;
    }

    .theme-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .theme-card.active {
        border-color: var(--color-primary, #ff3333);
        box-shadow: 0 4px 16px var(--color-border, rgba(255, 51, 51, 0.3));
    }

    .theme-preview {
        width: 100%;
        height: 80px;
        border-radius: 8px;
        margin-bottom: 10px;
        position: relative;
        overflow: hidden;
    }

    .theme-preview-surface {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40%;
        opacity: 0.8;
    }

    .theme-name {
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text, #f2f3f5);
    }

    .theme-active-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--color-primary, #ff3333);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 700;
    }
`;
document.head.appendChild(style);

// Export
window.ThemeManager = ThemeManager;
