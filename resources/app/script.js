// Global state for animations
let fireworkEngine;
let spinEngine;
let uiManager;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Engines
    fireworkEngine = new FireworkEngine('canvas');

    spinEngine = new SpinEngine({
        onDigitChange: (index, value) => {
            const el = document.getElementById(`number${index}`);
            if (el) el.textContent = value;
        },
        onDigitStop: (index, value, isLast) => {
            const el = document.getElementById(`number${index}`);
            if (el) {
                const audioSpin = document.getElementById("audio-player1");
                audioSpin.currentTime = 0;
                audioSpin.play().catch(e => console.log("Play failed"));
                
                el.classList.remove('glow', 'finalized');
                void el.offsetWidth; // Trigger reflow
                el.classList.add('glow', 'finalized');
            }
        },
        onSpinStart: () => {
            const manualSpinButton = document.querySelector(".manual-spin-button button");
            manualSpinButton.textContent = "Dừng";
            
            const audioSpin = document.getElementById("audio-player1");
            audioSpin.currentTime = 0;
            audioSpin.play().catch(e => console.log("Play failed"));

            const numberDisplayContainer = document.querySelector('.number-display');
            numberDisplayContainer.classList.remove('sync-spin');
            void numberDisplayContainer.offsetWidth; 
            numberDisplayContainer.classList.add('sync-spin');

            const digitCount = spinEngine.digitCount;
            for (let i = 1; i <= digitCount; i++) {
                const el = document.getElementById(`number${i}`);
                if (el) el.classList.remove('glow', 'finalized');
            }
        },
        onSpinStop: () => {
            const manualSpinButton = document.querySelector(".manual-spin-button button");
            manualSpinButton.textContent = "Quay";
            
            const audioSpin = document.getElementById("audio-player1");
            audioSpin.currentTime = 0;
            audioSpin.play().catch(e => console.log("Play failed"));
        },
        onSpinFinalized: (luckyString) => {
            uiManager.finalizeSpin(luckyString);
        }
    });

    // 2. Initialize UI Manager
    uiManager = new UIManager(spinEngine, fireworkEngine);

    // 3. IPC Event Listeners (using electronAPI from preload)
    window.electronAPI.on('open-settings', ({ tab }) => uiManager.openSettings(tab));

    window.electronAPI.on("sound-state-changed", ({ muted, isInitial }) => {
        uiManager.isMuted = muted;
        const toggleSoundButton = document.getElementById("toggle-sound-button");
        if (toggleSoundButton) toggleSoundButton.textContent = muted ? "Bật âm thanh" : "Tắt âm thanh";
        
        const audioBG = document.getElementById("audio-player2");
        if (audioBG) audioBG.muted = muted;
        
        if (!isInitial) uiManager.showNotification(`Đã ${muted ? 'tắt' : 'bật'} âm thanh`);
    });

    window.electronAPI.on("music-updated", ({ musicPath }) => {
        const audioBG = document.getElementById("audio-player2");
        const url = new URL(musicPath, 'file://');
        url.searchParams.set('t', Date.now());
        audioBG.src = url.href;
        if (!uiManager.isMuted) audioBG.play();
        uiManager.showNotification("Đã thay đổi nhạc nền!");
    });

    window.electronAPI.on("sound-effect-updated", ({ type, path }) => {
        const url = new URL(path, 'file://');
        url.searchParams.set('t', Date.now());
        if (type === 'spin') {
            document.getElementById("audio-player1").src = url.href;
        } else if (type === 'congrat') {
            document.getElementById("audio-player").src = url.href;
        }
        uiManager.showNotification(`Đã cập nhật âm thanh ${type === 'spin' ? 'quay số' : 'chúc mừng'}!`);
    });
    
    window.electronAPI.on("set-background", ({ backgroundUrl }) => {
        uiManager.setBackground(backgroundUrl);
        uiManager.showNotification("Đã thay đổi ảnh nền!");
    });
    
    window.electronAPI.on("info-image-updated", ({ infoImageUrl }) => {
        uiManager.setInfoImage(infoImageUrl);
        uiManager.showNotification("Đã thay đổi ảnh giới thiệu!");
    });

    window.electronAPI.on("branding-updated", ({ newName, newLogoUrl, newFaviconUrl }) => {
        uiManager.updateBranding(newName, newLogoUrl, newFaviconUrl);
        uiManager.showNotification("Đã cập nhật thương hiệu!");
    });

    window.electronAPI.on('effects-settings-updated', (effects) => {
        if (fireworkEngine) {
            fireworkEngine.setEnabled(effects.fireworks.enabled);
            fireworkEngine.setStyle(effects.fireworks.style || 'classic');
        }
        
        uiManager.setFlowerEffects(effects.flowers.enabled, effects.flowers.speed);
        uiManager.showNotification("Đã cập nhật cài đặt hiệu ứng!");
    });

    window.electronAPI.on("initial-data", (data) => {
        // Branding & Images
        uiManager.updateBranding(data.companyName, data.logoUrl, data.faviconUrl);
        uiManager.setBackground(data.backgroundUrl);
        uiManager.setInfoImage(data.infoImageUrl);

        // Static Assets
        if (data.maiUrl) document.getElementById('img-mai').src = data.maiUrl;
        if (data.daoUrl) document.getElementById('img-dao').src = data.daoUrl;
        if (data.gifCongratUrl) document.getElementById('img-congrat').src = data.gifCongratUrl;

        // Init Flower Animation with correct paths
        if (data.hoaMaiPath && data.hoaDaoPath) {
             uiManager.flowerAnimations.mai = uiManager.setupFlowerAnimation("fallingCanvasMai", new URL(data.hoaMaiPath, 'file://').href, false, 70);
             uiManager.flowerAnimations.dao = uiManager.setupFlowerAnimation("fallingCanvasDao", new URL(data.hoaDaoPath, 'file://').href, true, 70);
        }

        // Sound
        uiManager.isMuted = data.isMuted;
        const audioBG = document.getElementById("audio-player2");
        audioBG.muted = data.isMuted;
        
        if (data.bgMusicVolume !== undefined) {
            uiManager.currentBgVolume = data.bgMusicVolume;
            audioBG.volume = uiManager.currentBgVolume;
            const bgVolumeSlider = document.getElementById("bg-volume-slider");
            if (bgVolumeSlider) {
                bgVolumeSlider.value = Math.round(uiManager.currentBgVolume * 100);
                document.getElementById("bg-volume-value").textContent = bgVolumeSlider.value;
            }
        }

        if (data.musicPath) audioBG.src = new URL(data.musicPath, 'file://').href;
        if (data.spinSoundPath) document.getElementById("audio-player1").src = new URL(data.spinSoundPath, 'file://').href;
        if (data.congratSoundPath) document.getElementById("audio-player").src = new URL(data.congratSoundPath, 'file://').href;

        if (!uiManager.isMuted) audioBG.play().catch(e => console.log("Initial play failed"));
        const toggleSoundButton = document.getElementById("toggle-sound-button");
        if (toggleSoundButton) toggleSoundButton.textContent = uiManager.isMuted ? "Bật âm thanh" : "Tắt âm thanh";

        // Effects
        if (data.effects) {
            if (fireworkEngine) {
                fireworkEngine.setEnabled(data.effects.fireworks.enabled);
                fireworkEngine.setStyle(data.effects.fireworks.style || 'classic');
            }
            uiManager.setFlowerEffects(data.effects.flowers.enabled, data.effects.flowers.speed);
        }

        // Spin Config
        if (data.spinConfig) {
            spinEngine.updateConfig(data.spinConfig);
        }
        
        // Prize Status & Results
        if (data.prizeStatus) {
            uiManager.prizeStatus = data.prizeStatus;
        }
        
        if (data.results) {
            data.results.forEach(res => {
                uiManager.addResultToList(res.number, res.prize, false); 
            });
        }

        uiManager.renderNumberDisplay();
        uiManager.updatePrizeUI(); 
    });
});

// Logic pháo hoa đã được chuyển sang js/FireworkEngine.js
