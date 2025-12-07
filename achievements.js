// Quantum UI - Achievement System
// Tracks user progress and unlocks rewards

class AchievementManager {
    constructor() {
        this.achievements = {
            first_login: {
                id: 'first_login',
                name: '🎯 First Steps',
                description: 'Log in for the first time',
                reward: 0, // No time reward
                unlocked: false
            },
            week_streak: {
                id: 'week_streak',
                name: '🔥 Week Warrior',
                description: 'Log in 7 days in a row',
                reward: 86400000, // +1 day
                unlocked: false
            },
            month_streak: {
                id: 'month_streak',
                name: '💎 Monthly Master',
                description: 'Log in 30 days in a row',
                reward: 604800000, // +7 days
                unlocked: false
            },
            ten_logins: {
                id: 'ten_logins',
                name: '⭐ Dedicated User',
                description: 'Log in 10 times total',
                reward: 172800000, // +2 days
                unlocked: false
            },
            fifty_logins: {
                id: 'fifty_logins',
                name: '👑 Quantum Veteran',
                description: 'Log in 50 times total',
                reward: 1209600000, // +14 days
                unlocked: false
            },
            christmas_special: {
                id: 'christmas_special',
                name: '🎄 Christmas Spirit',
                description: 'Log in on Christmas Day',
                reward: 2592000000, // +30 days
                unlocked: false
            },
            settings_explorer: {
                id: 'settings_explorer',
                name: '⚙️ Customizer',
                description: 'Change 5 different settings',
                reward: 43200000, // +12 hours
                unlocked: false
            },
            perfect_week: {
                id: 'perfect_week',
                name: '✨ Perfect Week',
                description: 'Complete all daily tasks for 7 days',
                reward: 259200000, // +3 days
                unlocked: false
            }
        };

        this.load();
        this.checkAchievements();
    }

    load() {
        const saved = localStorage.getItem('quantum_achievements');
        if (saved) {
            const unlocked = JSON.parse(saved);
            unlocked.forEach(id => {
                if (this.achievements[id]) {
                    this.achievements[id].unlocked = true;
                }
            });
        }
    }

    save() {
        const unlocked = Object.values(this.achievements)
            .filter(a => a.unlocked)
            .map(a => a.id);
        localStorage.setItem('quantum_achievements', JSON.stringify(unlocked));
    }

    checkAchievements() {
        // First Login
        if (!this.achievements.first_login.unlocked) {
            this.unlock('first_login');
        }

        // Check streak
        const streak = this.getStreak();
        if (streak >= 7 && !this.achievements.week_streak.unlocked) {
            this.unlock('week_streak');
        }
        if (streak >= 30 && !this.achievements.month_streak.unlocked) {
            this.unlock('month_streak');
        }

        // Check total logins
        const totalLogins = this.getTotalLogins();
        if (totalLogins >= 10 && !this.achievements.ten_logins.unlocked) {
            this.unlock('ten_logins');
        }
        if (totalLogins >= 50 && !this.achievements.fifty_logins.unlocked) {
            this.unlock('fifty_logins');
        }

        // Christmas Special
        const today = new Date();
        if (today.getMonth() === 11 && today.getDate() === 25) {
            if (!this.achievements.christmas_special.unlocked) {
                this.unlock('christmas_special');
            }
        }

        // Settings Explorer
        const settingsChanged = parseInt(localStorage.getItem('quantum_settings_changed') || '0');
        if (settingsChanged >= 5 && !this.achievements.settings_explorer.unlocked) {
            this.unlock('settings_explorer');
        }
    }

    unlock(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        this.save();

        // Apply reward (extend key time)
        if (achievement.reward > 0) {
            this.applyReward(achievement.reward);
        }

        // Show notification
        this.showNotification(achievement);
    }

    applyReward(milliseconds) {
        const currentExpiry = parseInt(localStorage.getItem('quantum_activation_time') || Date.now());
        const durationCode = localStorage.getItem('quantum_duration_code') || '1D';

        // Calculate current expiry time
        let durationMs = 0;
        switch (durationCode) {
            case '1D': durationMs = 24 * 60 * 60 * 1000; break;
            case '1W': durationMs = 7 * 24 * 60 * 60 * 1000; break;
            case '1M': durationMs = 30 * 24 * 60 * 60 * 1000; break;
            case 'LT': return; // Can't extend lifetime
            default: durationMs = 24 * 60 * 60 * 1000;
        }

        // Extend the activation time backwards (making expiry later)
        const newActivationTime = currentExpiry - milliseconds;
        localStorage.setItem('quantum_activation_time', newActivationTime);
    }

    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.name.split(' ')[0]}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.reward > 0 ? `<div class="achievement-reward">+${this.formatTime(achievement.reward)} added to key!</div>` : ''}
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255, 51, 51, 0.95) 0%, rgba(204, 0, 0, 0.95) 100%);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            z-index: 10001;
            min-width: 300px;
            animation: slideInRight 0.5s ease-out;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        document.body.appendChild(notification);

        // Play sound
        this.playAchievementSound();

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    formatTime(ms) {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    }

    playAchievementSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const settings = JSON.parse(localStorage.getItem('quantum_settings') || '{"sounds_enabled": true}');
        if (!settings.sounds_enabled) return;

        // Play a triumphant sound
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = freq;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 100);
        });
    }

    getStreak() {
        const lastLogin = localStorage.getItem('quantum_last_login');
        const streak = parseInt(localStorage.getItem('quantum_streak') || '0');

        if (!lastLogin) {
            localStorage.setItem('quantum_last_login', new Date().toDateString());
            localStorage.setItem('quantum_streak', '1');
            return 1;
        }

        const last = new Date(lastLogin);
        const today = new Date();
        const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return streak; // Same day
        } else if (diffDays === 1) {
            const newStreak = streak + 1;
            localStorage.setItem('quantum_streak', newStreak);
            localStorage.setItem('quantum_last_login', today.toDateString());
            return newStreak;
        } else {
            localStorage.setItem('quantum_streak', '1');
            localStorage.setItem('quantum_last_login', today.toDateString());
            return 1;
        }
    }

    getTotalLogins() {
        const total = parseInt(localStorage.getItem('quantum_total_logins') || '0');
        const newTotal = total + 1;
        localStorage.setItem('quantum_total_logins', newTotal);
        return newTotal;
    }

    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }

    getAllAchievements() {
        return Object.values(this.achievements);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .achievement-notification {
        display: flex;
        gap: 15px;
        align-items: center;
    }

    .achievement-icon {
        font-size: 48px;
        line-height: 1;
    }

    .achievement-content {
        flex: 1;
    }

    .achievement-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 4px;
    }

    .achievement-name {
        font-size: 18px;
        font-weight: 700;
        color: white;
        margin-bottom: 4px;
    }

    .achievement-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 6px;
    }

    .achievement-reward {
        font-size: 12px;
        font-weight: 600;
        color: #ffeb3b;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
    }
`;
document.head.appendChild(style);

// Export for use in other scripts
window.AchievementManager = AchievementManager;
