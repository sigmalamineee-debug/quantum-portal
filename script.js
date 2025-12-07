// Quantum UI Logic
// Handles interactions, animations, and dynamic updates

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const FPS_TARGET = 240;
    const PING_BASE = 90;

    function updateExpiry() {
        if (!expiryDisplay) return;

        const activationTime = parseInt(localStorage.getItem('quantum_activation_time') || Date.now());
        const durationCode = localStorage.getItem('quantum_duration_code') || '1D';

        let durationMs = 0;
        switch (durationCode) {
            case '1D': durationMs = 24 * 60 * 60 * 1000; break;
            case '1W': durationMs = 7 * 24 * 60 * 60 * 1000; break;
            case '1M': durationMs = 30 * 24 * 60 * 60 * 1000; break;
            case 'LT': durationMs = -1; break; // Lifetime
            default: durationMs = 24 * 60 * 60 * 1000;
        }

        // Check for preview mode data first
        const previewMode = localStorage.getItem('quantum_preview_mode');
        const previewExpiry = localStorage.getItem('quantum_preview_expiry');

        if (previewMode === 'true' && previewExpiry) {
            if (previewExpiry === 'LT') {
                expiryDisplay.textContent = "Expiry: Lifetime";
                return;
            }
            // If it's a timestamp
            const expiryTime = parseInt(previewExpiry);
            if (!isNaN(expiryTime)) {
                const now = Date.now();
                const remaining = expiryTime - now;
                if (remaining <= 0) {
                    expiryDisplay.textContent = "Expiry: Expired";
                } else {
                    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                    expiryDisplay.textContent = `Expiry: ${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
                }
                return;
            }
        }

        if (durationMs === -1) {
            expiryDisplay.textContent = "Expiry: Lifetime";
            return;
        }

        const expiryTime = activationTime + durationMs;
        const now = Date.now();
        const remaining = expiryTime - now;

        if (remaining <= 0) {
            expiryDisplay.textContent = "Expiry: Expired";
            return;
        }

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        let timeString = "";
        if (days > 0) timeString += `${days}d, `;
        timeString += `${hours}h, ${minutes}m, ${seconds}s`;

        expiryDisplay.textContent = `Expiry: ${timeString}`;
    }

    setInterval(updateExpiry, 1000);
    updateExpiry(); // Initial call

    // --- Settings Initialization ---
    let settingsManager;
    if (window.SettingsManager) {
        settingsManager = new window.SettingsManager();
        const settingsContent = document.getElementById('settingsContent');
        if (settingsContent) {
            settingsManager.renderTo(settingsContent);
        }
    }

    // --- Real-time FPS & Ping Tracking ---
    let lastFrameTime = performance.now();
    let fpsHistory = [];
    const maxFpsHistory = 60;

    function updateRealFPS() {
        const currentTime = performance.now();
        const delta = currentTime - lastFrameTime;
        const fps = Math.round(1000 / delta);

        fpsHistory.push(fps);
        if (fpsHistory.length > maxFpsHistory) {
            fpsHistory.shift();
        }

        const avgFPS = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);

        let displayFPS = avgFPS;
        if (settingsManager) {
            const fpsCap = parseInt(settingsManager.get('fps_cap')) || 240;
            displayFPS = Math.min(avgFPS, fpsCap);
        }

        if (fpsDisplay) {
            fpsDisplay.textContent = displayFPS;
        }

        if (settingsManager && settingsManager.fpsHistory) {
            settingsManager.fpsHistory = fpsHistory;
        }

        lastFrameTime = currentTime;
        requestAnimationFrame(updateRealFPS);
    }

    let pingValue = 50;
    function updateRealPing() {
        try {
            const startTime = performance.now();
            fetch(window.location.href, {
                method: 'HEAD',
                cache: 'no-cache'
            }).then(() => {
                const endTime = performance.now();
                const measuredPing = Math.round(endTime - startTime);

                if (measuredPing > 0 && measuredPing < 1000) {
                    pingValue = measuredPing;
                }
            }).catch(() => { });
        } catch (e) {
            pingValue = 50;
        }

        if (pingDisplay) {
            pingDisplay.textContent = pingValue;
        }

        setTimeout(updateRealPing, 2000);
    }

    requestAnimationFrame(updateRealFPS);
    updateRealPing();
    // --- Tab Switching ---
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoryName = btn.querySelector('span:last-child').textContent;
            const settingsContent = document.getElementById('settingsContent');

            // Handle Settings tab
            if (categoryName === 'Settings') {
                // Hide main content and in-development
                if (mainContent) mainContent.style.display = 'none';
                if (inDevelopment) inDevelopment.style.display = 'none';

                // Show settings content
                if (settingsContent) settingsContent.style.display = 'block';
            } else if (categoryName === 'RCFA') {
                // Hide settings
                if (settingsContent) settingsContent.style.display = 'none';

                // Show Main Content
                mainContent.style.display = 'grid';
                inDevelopment.style.display = 'none';

                // Re-trigger animations for sections
                contentSections.forEach(section => {
                    section.style.animation = 'none';
                    section.offsetHeight; /* trigger reflow */
                    section.style.animation = 'slideIn 0.4s ease-out forwards';
                });
            } else {
                // Hide settings
                if (settingsContent) settingsContent.style.display = 'none';

                // Show In Development
                mainContent.style.display = 'none';
                inDevelopment.style.display = 'flex';
            }
        });
    });

    // --- Toggles ---
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });

    // --- Sliders ---
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const fill = slider.querySelector('.slider-fill');
        const thumb = slider.querySelector('.slider-thumb');
        const valueDisplay = slider.querySelector('.slider-value');

        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = track.getBoundingClientRect();
            let percentage = (clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));

            fill.style.width = `${percentage * 100}%`;
            thumb.style.left = `${percentage * 100}%`;

            // Update value based on range (0-100 example)
            const value = Math.round(percentage * 100); // You can customize range per slider
            valueDisplay.textContent = value;
        };

        thumb.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('mousemove', (e) => {
            if (isDragging) updateSlider(e.clientX);
        });

        // Click on track
        track.addEventListener('click', (e) => updateSlider(e.clientX));
    });

    // --- Section Collapse ---
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling; // The controls div
            const icon = header.querySelector('.dropdown-icon');

            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'none';
                icon.style.transform = 'rotate(-90deg)';
            }
        });
    });

    // --- Close Button ---
    closeBtn.addEventListener('click', () => {
        uiContainer.style.opacity = '0';
        uiContainer.style.transform = 'scale(0.95)';
        setTimeout(() => {
            // In a real environment, this would close the UI
            // For web preview, we can reload or show a message
            location.reload();
        }, 300);
    });

    // --- Draggable UI ---
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header || e.target.parentNode === header) {
            isDragging = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, uiContainer);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
});
