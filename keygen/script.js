// Quantum Admin Panel Logic

// Configuration
const ADMIN_PASSWORD = "admin"; // Simple password for demo
const SALT = "QUANTUM_2024_SECRET";

// DOM Elements
const loginOverlay = document.getElementById('loginOverlay');
const mainPanel = document.getElementById('mainPanel');
const adminPass = document.getElementById('adminPass');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const durationBtns = document.querySelectorAll('.duration-btn');
const typeRadios = document.querySelectorAll('input[name="keyType"]');
const hwidSection = document.getElementById('hwidSection');
const hwidInput = document.getElementById('hwidInput');
const generateBtn = document.getElementById('generateBtn');
const keyResult = document.getElementById('keyResult');
const generatedKeyDisplay = document.getElementById('generatedKey');
const copyBtn = document.getElementById('copyKey');
const keyDurationInfo = document.getElementById('keyDurationInfo');
const keyTypeInfo = document.getElementById('keyTypeInfo');

// State
let selectedDuration = "1D";
let isRawKey = true;

// --- Login Logic ---
function attemptLogin() {
    if (adminPass.value === ADMIN_PASSWORD) {
        loginOverlay.style.opacity = '0';
        setTimeout(() => {
            loginOverlay.style.display = 'none';
            mainPanel.style.display = 'block';
        }, 300);
    } else {
        loginError.textContent = "Incorrect password";
        adminPass.classList.add('shake');
        setTimeout(() => adminPass.classList.remove('shake'), 500);
    }
}

loginBtn.addEventListener('click', attemptLogin);
adminPass.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
});

// --- Panel Logic ---

// Duration Selection
durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDuration = btn.dataset.value;
    });
});

// Type Selection
typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        isRawKey = e.target.id === 'typeRaw';
        hwidSection.style.display = isRawKey ? 'none' : 'block';
    });
});

// Key Generation
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash * 32) - hash) + char;
        hash = hash >>> 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(16, '0').substring(0, 16);
}

function generateRandomSegment() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function addKeyToAdminSystem(key, duration, hwid) {
    // Load existing keys
    const saved = localStorage.getItem('quantum_admin_keys');
    let keys = saved ? JSON.parse(saved) : [];

    // Calculate expiry based on duration
    let expiresAt = null;
    switch (duration) {
        case '1D': expiresAt = Date.now() + (24 * 60 * 60 * 1000); break;
        case '1W': expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); break;
        case '1M': expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); break;
        case 'LT': expiresAt = null; break; // Lifetime
    }

    // Create new key object
    const newKey = {
        key: key,
        hwid: hwid,
        status: hwid ? 'unused' : 'unused', // Both start as unused until activated
        created: Date.now(),
        activated: null,
        duration: duration,
        expiresAt: expiresAt,
        user: null
    };

    // Add to beginning of array (newest first)
    keys.unshift(newKey);

    // Save back to localStorage
    localStorage.setItem('quantum_admin_keys', JSON.stringify(keys));
}

generateBtn.addEventListener('click', () => {
    let key = "";
    let targetHWID = null;

    if (isRawKey) {
        // Raw Key Format: QTM-[DURATION]-[RANDOM]-[RANDOM]
        const segment1 = generateRandomSegment();
        const segment2 = generateRandomSegment();
        key = `QTM-${selectedDuration}-${segment1}-${segment2}`;
    } else {
        // HWID Key Format: QTM-[DURATION]-[HASH]
        const hwid = hwidInput.value.trim();
        if (!hwid) {
            alert("Please enter a Target HWID");
            return;
        }

        targetHWID = hwid.toUpperCase();
        const combined = hwid + SALT;
        const hash = simpleHash(combined);
        key = `QTM-${selectedDuration}-${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
    }

    // Add key to admin system
    addKeyToAdminSystem(key, selectedDuration, targetHWID);

    // Display Result
    generatedKeyDisplay.textContent = key;
    keyDurationInfo.textContent = `Duration: ${getDurationLabel(selectedDuration)}`;
    keyTypeInfo.textContent = `Type: ${isRawKey ? 'Raw (Bind on Use)' : 'HWID Locked'}`;

    keyResult.style.display = 'block'; // Show result area
    keyResult.classList.remove('active');
    void keyResult.offsetWidth; // Trigger reflow
    keyResult.classList.add('active');

    // Refresh admin panel if it's open
    if (window.adminKeyManager) {
        window.adminKeyManager.keys = window.adminKeyManager.loadKeys();
    }

    // Update history list
    updateHistoryList();
});

function getDurationLabel(code) {
    const map = {
        '1D': '1 Day',
        '1W': '1 Week',
        '1M': '1 Month',
        'LT': 'Lifetime'
    };
    return map[code] || code;
}

// Copy Functionality
copyBtn.addEventListener('click', () => {
    const key = generatedKeyDisplay.textContent;
    navigator.clipboard.writeText(key).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = originalText, 1500);
    });
});

// --- History List Logic ---
function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const saved = localStorage.getItem('quantum_admin_keys');
    const keys = saved ? JSON.parse(saved) : [];

    // Take top 5 recent keys
    const recentKeys = keys.slice(0, 5);

    if (recentKeys.length === 0) {
        historyList.innerHTML = '<div class="history-item" style="justify-content: center; color: var(--color-text-secondary);">No keys generated yet</div>';
        return;
    }

    historyList.innerHTML = recentKeys.map(k => `
        <div class="history-item">
            <span class="history-key">${k.key}</span>
            <span class="history-time">${new Date(k.created).toLocaleTimeString()}</span>
        </div>
    `).join('');
}

// Initial load
updateHistoryList();
