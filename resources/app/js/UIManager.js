class UIManager {
    constructor(spinEngine, fireworkEngine) {
        this.spinEngine = spinEngine;
        this.fireworkEngine = fireworkEngine;
        
        // State
        this.selectedPrize = null;
        this.prizeStatus = {};
        this.isMuted = true;
        this.currentBgVolume = 1;
        this.flowerAnimations = { mai: null, dao: null };

        // Cache DOM Elements
        this.cacheElements();
        
        // Initialize
        this.initEventListeners();
        this.initPrizeEvents();
    }

    cacheElements() {
        this.elements = {
            numberDisplayContainer: document.querySelector('.number-display'),
            resultList: document.getElementById("result-list"),
            manualSpinButton: document.querySelector(".manual-spin-button button"),
            priceElement: document.querySelector(".price"),
            numberButtonsContainer: document.querySelector(".number-buttons"),
            
            // Audio
            audioCongrat: document.getElementById("audio-player"),
            audioSpin: document.getElementById("audio-player1"),
            audioBG: document.getElementById("audio-player2"),
            
            // Modals
            notificationModal: document.getElementById("notification-modal"),
            modalMessage: document.getElementById("modal-message"),
            infoModal: document.getElementById("infoModal"),
            congratulationsModal: document.getElementById("congratulationsModal"),
            luckyNumberDisplay: document.getElementById("lucky-number-display"),
            settingsModal: document.getElementById("settings-modal"),
            
            // Settings Inputs
            companyNameInput: document.getElementById("company-name-input"),
            hideLogoCheckbox: document.getElementById("hide-logo-checkbox"),
            logoFileInput: document.getElementById("logo-file-input"),
            infoImageInput: document.getElementById("info-image-input"),
            backgroundImageInput: document.getElementById("background-image-input"),
            prizeListEditor: document.getElementById("prize-list-editor"),
            bgVolumeSlider: document.getElementById("bg-volume-slider"),
            bgVolumeValue: document.getElementById("bg-volume-value"),
            
            // Spin Settings Inputs
            digitCountInput: document.getElementById('digit-count-input'),
            stopIntervalInput: document.getElementById('stop-interval-input'),
            resultDisplayTimeInput: document.getElementById('result-display-time-input'),
            minValueInput: document.getElementById('min-value-input'),
            maxValueInput: document.getElementById('max-value-input'),
            allowDuplicateCheckbox: document.getElementById('allow-duplicate-checkbox'),
            
            // Effects Inputs
            toggleFlowersCheckbox: document.getElementById('toggle-flowers-checkbox'),
            toggleFixedFlowersCheckbox: document.getElementById('toggle-fixed-flowers-checkbox'),
            flowerSpeedSlider: document.getElementById('flower-speed-slider'),
            flowerSpeedValue: document.getElementById('flower-speed-value'),
            toggleFireworksCheckbox: document.getElementById('toggle-fireworks-checkbox'),
            fireworkStyleCardsContainer: document.getElementById('firework-style-cards'),
            
            // Fixed Flowers
            fixedMai: document.getElementById('img-mai'),
            fixedDao: document.getElementById('img-dao'),
            
            // Control Buttons
            saveBrandingButton: document.getElementById("save-branding-button"),
            showInfoModalButton: document.getElementById("show-info-modal-button"),
            addPrizeButton: document.getElementById("add-prize-button"),
            savePrizesButton: document.getElementById("save-prizes-button"),
            toggleSoundButton: document.getElementById("toggle-sound-button"),
            changeMusicButton: document.getElementById("change-music-button"),
            spinSoundInput: document.getElementById("spin-sound-input"),
            congratSoundInput: document.getElementById("congrat-sound-input"),
            saveSoundsButton: document.getElementById("save-sounds-button"),
            saveEffectsButton: document.getElementById('save-effects-button'),
            saveSpinConfigButton: document.getElementById('save-spin-config-button'),
            resetSpinConfigButton: document.getElementById('reset-spin-config-button'),
            resetPrizesButton: document.getElementById('reset-prizes-button'),
        };
    }

    initEventListeners() {
        // Modal close buttons
        document.getElementById("close-modal").addEventListener("click", () => this.hideNotification());
        document.getElementById("close-settings-button").addEventListener("click", () => this.hideSettings());
        
        // Manual Spin
        this.elements.manualSpinButton.addEventListener("click", () => this.handleSpinToggle());
        
        // Tab switching
        document.querySelectorAll(".settings-sidebar li").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                this.switchTab(link.getAttribute("data-tab"));
            });
        });

        // Volume slider
        if (this.elements.bgVolumeSlider) {
            this.elements.bgVolumeSlider.addEventListener("input", (e) => {
                const val = e.target.value;
                this.elements.bgVolumeValue.textContent = val;
                this.currentBgVolume = val / 100;
                this.elements.audioBG.volume = this.currentBgVolume;
            });
        }

        // Flower speed slider
        if (this.elements.flowerSpeedSlider) {
            this.elements.flowerSpeedSlider.addEventListener('input', (e) => {
                this.elements.flowerSpeedValue.textContent = e.target.value;
            });
        }
        
        // Settings Action Buttons
        this.elements.saveBrandingButton.addEventListener("click", () => this.handleSaveBranding());
        this.elements.showInfoModalButton.addEventListener("click", () => {
            this.hideSettings();
            this.elements.infoModal.classList.remove("hidden");
        });
        this.elements.addPrizeButton.addEventListener("click", () => this.elements.prizeListEditor.appendChild(this.createPrizeEntry()));
        this.elements.savePrizesButton.addEventListener("click", () => this.handleSavePrizes());
        this.elements.toggleSoundButton.addEventListener("click", () => window.electronAPI.send('toggle-sound-from-renderer'));
        this.elements.changeMusicButton.addEventListener("click", () => window.electronAPI.send('open-change-music-dialog'));
        this.elements.saveSoundsButton.addEventListener("click", () => this.handleSaveSounds());
        this.elements.saveEffectsButton.addEventListener("click", () => this.handleSaveEffects());
        
        this.elements.saveSpinConfigButton.addEventListener('click', () => this.handleSaveSpinConfig());
        this.elements.resetSpinConfigButton.addEventListener('click', () => this.handleResetSpinConfig());
        this.elements.resetPrizesButton.addEventListener('click', () => this.handleResetPrizes());

        // Global Enter key
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !this.elements.settingsModal.classList.contains('hidden')) return;
            if (event.key === "Enter") {
                this.handleSpinToggle();
            }
        });
    }

    updateBranding(name, logoUrl, faviconUrl, isLogoHidden) {
        if (name) document.title = `Quay số trúng thưởng - ${name}`;
        if (logoUrl) document.querySelector(".logo").src = logoUrl;
        if (faviconUrl) {
            const link = document.querySelector("link[rel='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.href = faviconUrl;
            document.head.appendChild(link);
        }
        if (isLogoHidden !== undefined) {
            this.setLogoVisibility(isLogoHidden);
        }
    }

    setLogoVisibility(hidden) {
        const logo = document.querySelector(".logo");
        if (logo) {
            logo.style.visibility = hidden ? 'hidden' : 'visible';
        }
    }

    setBackground(url) {
        if (url) document.body.style.backgroundImage = `url('${url}')`;
    }

    setInfoImage(url) {
        const img = document.querySelector("#infoModal img");
        if (img && url) img.src = url;
    }

    // --- Flower Animations Logic (Merged from fallingFlowers.js) ---
    setupFlowerAnimation(canvasId, imagePath, isFromLeft, flowerCount) {
        // Chờ imagePath hợp lệ mới khởi tạo
        if (!imagePath) return null;

        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
      
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      
        const flowers = [];
        const flowerImage = new Image();
        flowerImage.src = imagePath;
      
        let animationFrameId = null;
        let speedMultiplier = 1.0;

        const createFlower = () => {
          return {
            x: isFromLeft ? -Math.random() * 200 : canvas.width + Math.random() * 200,
            y: -Math.random() * 200,
            size: Math.random() * 20 + 15,
            baseSpeed: Math.random() * 1.5 + 0.5,
            sway: Math.random() * 1.5 - 0.75,
            swayOffset: Math.random() * 80 + 50,
            spreadFactor: Math.random() * 0.4 + 0.3,
          };
        }
      
        const updateAndDrawFlower = (flower) => {
          flower.y += flower.baseSpeed * speedMultiplier;
      
          if (isFromLeft) {
            flower.x += (canvas.width / 2) * flower.spreadFactor / canvas.height;
          } else {
            flower.x -= (canvas.width - canvas.width / 2) * flower.spreadFactor / canvas.height;
          }
      
          flower.x += Math.sin(flower.y / flower.swayOffset) * flower.sway;
      
          ctx.drawImage(flowerImage, flower.x, flower.y, flower.size, flower.size);
      
          if (flower.y > canvas.height || (isFromLeft && flower.x > canvas.width / 2 + 150) || (!isFromLeft && flower.x < canvas.width / 2 - 150)) {
            flower.y = -20 - Math.random() * 200;
            flower.x = isFromLeft ? -150 - Math.random() * 150 : canvas.width + Math.random() * 150;
          }
        }
      
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          flowers.forEach(updateAndDrawFlower);
          animationFrameId = requestAnimationFrame(animate);
        }
      
        const controller = {
            start: () => {
                if (!animationFrameId) {
                    canvas.style.display = 'block';
                    animate();
                }
            },
            stop: () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.style.display = 'none';
                }
            },
            setSpeed: (multiplier) => {
                speedMultiplier = Math.max(0, multiplier);
            }
        };

        flowerImage.onload = () => {
          flowers.length = 0;
          for (let i = 0; i < flowerCount; i++) {
            flowers.push(createFlower());
          }
        };
      
        window.addEventListener("resize", () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        });

        return controller;
    }

    initFlowerAnimations() {
        this.flowerAnimations.mai = this.setupFlowerAnimation("fallingCanvasMai", "./images/hoamai.png", false, 70);
        this.flowerAnimations.dao = this.setupFlowerAnimation("fallingCanvasDao", "./images/hoadao.png", true, 70);
    }

    setFlowerEffects(enabled, speed) {
        if (enabled) {
            this.flowerAnimations.mai?.setSpeed(speed);
            this.flowerAnimations.dao?.setSpeed(speed);
            this.flowerAnimations.mai?.start();
            this.flowerAnimations.dao?.start();
        } else {
            this.flowerAnimations.mai?.stop();
            this.flowerAnimations.dao?.stop();
        }
    }

    setFixedFlowerEffects(enabled) {
        // Default to true if enabled is undefined
        const isVisible = enabled !== false; 
        const displayStyle = isVisible ? 'block' : 'none';
        
        if (this.elements.fixedMai) this.elements.fixedMai.style.display = displayStyle;
        if (this.elements.fixedDao) this.elements.fixedDao.style.display = displayStyle;
    }

    // --- Modal Management ---
    showNotification(message) {
        this.elements.modalMessage.textContent = message;
        this.elements.notificationModal.classList.remove("hidden");
    }

    hideNotification() {
        this.elements.notificationModal.classList.add("hidden");
    }

    openSettings(tab = 'general') {
        // Populate prizes
        this.elements.prizeListEditor.innerHTML = "";
        document.querySelectorAll(".spin-small").forEach(button => {
            const name = button.dataset.prize;
            const count = button.dataset.count;
            this.elements.prizeListEditor.appendChild(this.createPrizeEntry(name, count));
        });

        // Populate company name
        window.electronAPI.invoke('get-setting', 'companyName').then(name => {
            this.elements.companyNameInput.value = name || "";
        });

        // Populate logo visibility
        window.electronAPI.invoke('get-setting', 'isLogoHidden').then(isHidden => {
            this.elements.hideLogoCheckbox.checked = !!isHidden;
        });

        // Populate effects settings
        window.electronAPI.invoke('get-setting', 'effects').then(effects => {
            if(effects) {
                this.elements.toggleFlowersCheckbox.checked = effects.flowers.enabled;
                this.elements.toggleFixedFlowersCheckbox.checked = effects.fixedFlowers !== undefined ? effects.fixedFlowers : true;
                this.elements.flowerSpeedSlider.value = effects.flowers.speed;
                this.elements.flowerSpeedValue.textContent = effects.flowers.speed;
                this.elements.toggleFireworksCheckbox.checked = effects.fireworks.enabled;
                
                const selectedStyle = effects.fireworks.style || 'classic';
                this.renderFireworkStyleCards(selectedStyle);
                if (this.fireworkEngine) this.fireworkEngine.setStyle(selectedStyle);
            } else {
                this.renderFireworkStyleCards('classic');
            }
        });

        // Populate spin settings
        window.electronAPI.invoke('get-setting', 'spinConfig').then(config => {
            if (config) {
                this.spinEngine.updateConfig(config);
                this.elements.digitCountInput.value = this.spinEngine.digitCount;
                this.elements.stopIntervalInput.value = this.spinEngine.stopInterval;
                this.elements.resultDisplayTimeInput.value = this.spinEngine.resultDisplayTime;
                this.elements.minValueInput.value = this.spinEngine.minSpinValue;
                this.elements.maxValueInput.value = this.spinEngine.maxSpinValue;
                this.elements.allowDuplicateCheckbox.checked = this.spinEngine.allowDuplicates;
            }
        });
        
        this.switchTab(tab);
        this.elements.settingsModal.classList.remove("hidden");
    }

    hideSettings() {
        this.elements.settingsModal.classList.add("hidden");
    }

    switchTab(activeTab) {
        document.querySelectorAll(".settings-sidebar li").forEach(link => {
            link.classList.toggle('active', link.dataset.tab === activeTab);
        });
        document.querySelectorAll(".settings-tab").forEach(tab => {
            tab.classList.toggle('active', tab.id === `${activeTab}-settings`);
        });
    }

    // --- Spin & Prize Management ---
    handleSpinToggle() {
        if (!this.checkSpinAvailability()) return;
        
        if (!this.spinEngine.isSpinning) {
            this.spinEngine.startSpinning();
        } else {
            const existingNumbers = Array.from(this.elements.resultList.querySelectorAll('li'))
                .map(li => li.textContent.split(': ')[1])
                .filter(n => n !== undefined);
            this.spinEngine.stopSpinning(existingNumbers);
        }
    }

    checkSpinAvailability() {
        if (!this.selectedPrize) {
            this.showNotification("Vui lòng chọn một giải trước khi bấm quay!");
            return false;
        }
        const currentStatus = this.prizeStatus[this.selectedPrize];
        if (currentStatus?.isCompleted || currentStatus?.spinsLeft <= 0) {
            this.showNotification(`${this.selectedPrize} đã hoàn tất quay. Vui lòng chọn giải khác!`);
            return false;
        }
        return true;
    }

    finalizeSpin(luckyString) {
        setTimeout(() => {
            this.elements.luckyNumberDisplay.textContent = luckyString;
            this.elements.congratulationsModal.style.display = "flex";
            
            if (!this.isMuted) this.fadeAudio(this.elements.audioBG, this.currentBgVolume * 0.1, 500);

            this.elements.audioCongrat.currentTime = 0;
            this.elements.audioCongrat.play().catch(e => console.log("Play failed"));

            if (this.fireworkEngine) this.fireworkEngine.reset(); 

            setTimeout(() => {
                this.elements.congratulationsModal.style.display = "none";
                
                if (!this.isMuted) {
                    this.elements.audioBG.play();
                    this.fadeAudio(this.elements.audioBG, this.currentBgVolume, 1000);
                }

                this.addResultToList(luckyString, this.selectedPrize, true);
                
                if (this.selectedPrize && this.prizeStatus[this.selectedPrize]) {
                    this.prizeStatus[this.selectedPrize].spinsLeft--;
                    if (this.prizeStatus[this.selectedPrize].spinsLeft <= 0) {
                        this.prizeStatus[this.selectedPrize].isCompleted = true;
                    }
                    this.updatePrizeUI();
                    this.savePrizeStatus();
                }
            }, this.spinEngine.resultDisplayTime * 1000);
        }, 500);
    }

    addResultToList(number, prizeName, shouldSave = true) {
        const li = document.createElement("li");
        const displayPrize = prizeName || this.selectedPrize || "Giải thưởng";
        li.textContent = `${displayPrize}: ${number}`;
        this.elements.resultList.appendChild(li);
        
        if (shouldSave) {
            window.electronAPI.invoke('get-setting', 'results').then(results => {
                const newResults = results || [];
                newResults.push({ number, prize: displayPrize, timestamp: new Date().getTime() });
                window.electronAPI.invoke('save-setting', 'results', newResults);
            });
        }
    }

    initPrizeEvents() {
        this.elements.numberButtonsContainer.addEventListener("click", (e) => {
            const button = e.target.closest(".spin-small");
            if (!button) return;

            const prize = button.getAttribute("data-prize");
            const count = parseInt(button.getAttribute("data-count"), 10);
            
            this.elements.audioSpin.play();
            if (this.prizeStatus[prize]?.isCompleted) {
                this.showNotification(`${prize} đã hoàn tất quay. Vui lòng chọn giải khác!`);
                return;
            }
            this.updateSelectedPrize(prize, count);
        });
    }

    updateSelectedPrize(prize, count) {
        if (!this.prizeStatus[prize]) {
            this.prizeStatus[prize] = { spinsLeft: count, isCompleted: false };
        }
        this.selectedPrize = prize;
        this.updatePrizeUI();
    }

    updatePrizeUI() {
        if (this.selectedPrize && this.prizeStatus[this.selectedPrize]) {
            const status = this.prizeStatus[this.selectedPrize];
            this.elements.priceElement.textContent = status.isCompleted 
                ? `${this.selectedPrize} đã hoàn tất!` 
                : `Đang quay: ${this.selectedPrize} (Còn lại: ${status.spinsLeft})`;
            
            document.querySelectorAll('.spin-small').forEach(btn => {
                if (btn.dataset.prize === this.selectedPrize) {
                    btn.textContent = `${this.selectedPrize} (${status.spinsLeft})`;
                }
            });
        }
    }

    savePrizeStatus() {
        window.electronAPI.invoke('save-setting', 'prizeStatus', this.prizeStatus);
    }

    resetState() {
        this.prizeStatus = {};
        this.selectedPrize = null;
        this.elements.resultList.innerHTML = "";
        this.elements.priceElement.textContent = "Vui lòng chọn giải thưởng để bắt đầu!";
        document.querySelectorAll(".spin-small").forEach(btn => {
            btn.textContent = btn.dataset.prize;
        });
    }

    // --- Settings Logic ---
    createPrizeEntry(name = "", count = 1) {
        const entryDiv = document.createElement("div");
        entryDiv.className = "prize-entry";
        entryDiv.innerHTML = `<input type="text" placeholder="Tên giải thưởng" value="${name}"><input type="number" min="1" value="${count}"><button class="delete-prize-button">Xóa</button>`;
        entryDiv.querySelector(".delete-prize-button").addEventListener("click", () => entryDiv.remove());
        return entryDiv;
    }

    handleSaveBranding() {
        const name = this.elements.companyNameInput.value.trim();
        const logoFile = this.elements.logoFileInput.files[0];
        const isLogoHidden = this.elements.hideLogoCheckbox.checked;

        const brandingPayload = { isLogoHidden }; // Always send visibility status
        if (name) brandingPayload.name = name;
        if (logoFile) brandingPayload.logoPath = window.electronAPI.getFilePath(logoFile);
        
        // Always send update because isLogoHidden might have changed even if name/file didn't
        window.electronAPI.send("update-branding", brandingPayload);

        const infoImageFile = this.elements.infoImageInput.files[0];
        if (infoImageFile) {
            window.electronAPI.send("update-info-image", { path: window.electronAPI.getFilePath(infoImageFile) });
        }

        const backgroundImageFile = this.elements.backgroundImageInput.files[0];
        if (backgroundImageFile) {
            window.electronAPI.send("update-background-image", { path: window.electronAPI.getFilePath(backgroundImageFile) });
        }
        
        this.elements.logoFileInput.value = "";
        this.elements.infoImageInput.value = "";
        this.elements.backgroundImageInput.value = "";
    }

    handleSavePrizes() {
        this.elements.numberButtonsContainer.innerHTML = "";
        this.elements.prizeListEditor.querySelectorAll(".prize-entry").forEach(entry => {
            const nameInput = entry.querySelector('input[type="text"]');
            const countInput = entry.querySelector('input[type="number"]');
            if (nameInput.value.trim() && countInput.value > 0) {
                const newButton = document.createElement("button");
                newButton.className = "spin-small";
                newButton.dataset.prize = nameInput.value.trim();
                newButton.dataset.count = countInput.value;
                newButton.textContent = nameInput.value.trim();
                this.elements.numberButtonsContainer.appendChild(newButton);
            }
        });
        this.resetState();
        this.showNotification("Đã lưu cài đặt giải thưởng!");
    }

    handleSaveSounds() {
        const spinSoundFile = this.elements.spinSoundInput.files[0];
        const congratSoundFile = this.elements.congratSoundInput.files[0];

        window.electronAPI.invoke('save-setting', 'bgMusicVolume', this.currentBgVolume);

        if (spinSoundFile) {
            window.electronAPI.send("update-sound-effect", { type: 'spin', path: window.electronAPI.getFilePath(spinSoundFile) });
        }
        if (congratSoundFile) {
            window.electronAPI.send("update-sound-effect", { type: 'congrat', path: window.electronAPI.getFilePath(congratSoundFile) });
        }
        
        this.elements.spinSoundInput.value = "";
        this.elements.congratSoundInput.value = "";
        this.showNotification("Đã lưu cài đặt âm thanh và âm lượng!");
    }

    handleSaveEffects() {
        const selectedStyle = document.querySelector('.firework-card.selected')?.dataset.id || (this.fireworkEngine ? this.fireworkEngine.currentStyle : 'classic');
        const newEffectsSettings = {
            flowers: {
                enabled: this.elements.toggleFlowersCheckbox.checked,
                speed: parseFloat(this.elements.flowerSpeedSlider.value),
            },
            fixedFlowers: this.elements.toggleFixedFlowersCheckbox.checked,
            fireworks: {
                enabled: this.elements.toggleFireworksCheckbox.checked,
                style: selectedStyle,
            }
        };
        window.electronAPI.send('update-effects-settings', newEffectsSettings);
    }

    handleSaveSpinConfig() {
        const config = {
            digitCount: parseInt(this.elements.digitCountInput.value) || 3,
            stopInterval: parseInt(this.elements.stopIntervalInput.value) || 1200,
            resultDisplayTime: parseInt(this.elements.resultDisplayTimeInput.value) || 5,
            minSpinValue: parseInt(this.elements.minValueInput.value) || 0,
            maxSpinValue: parseInt(this.elements.maxValueInput.value) || 999,
            allowDuplicates: this.elements.allowDuplicateCheckbox.checked
        };

        this.spinEngine.updateConfig(config);
        this.renderNumberDisplay();
        
        window.electronAPI.invoke('save-setting', 'spinConfig', config).then(() => {
            this.showNotification("Đã lưu cấu hình quay số thành công!");
        });
    }

    handleResetSpinConfig() {
        this.elements.digitCountInput.value = 3;
        this.elements.stopIntervalInput.value = 1200;
        this.elements.resultDisplayTimeInput.value = 5;
        this.elements.minValueInput.value = 0;
        this.elements.maxValueInput.value = 999;
        this.elements.allowDuplicateCheckbox.checked = false;
        this.showNotification("Đã điền thông số mặc định. Nhấn Lưu để áp dụng!");
    }

    handleResetPrizes() {
        const defaultPrizes = [
            { name: "Giải đặc biệt", count: 1 },
            { name: "Giải nhất", count: 1 },
            { name: "Giải nhì", count: 3 },
            { name: "Giải ba", count: 5 },
            { name: "Giải KK", count: 10 },
            { name: "Giải phụ", count: 20 }
        ];
        
        this.elements.prizeListEditor.innerHTML = "";
        defaultPrizes.forEach(p => {
            this.elements.prizeListEditor.appendChild(this.createPrizeEntry(p.name, p.count));
        });
        this.showNotification("Đã đặt lại danh sách giải thưởng mặc định. Nhấn Lưu để áp dụng!");
    }

    // --- Helpers ---
    renderNumberDisplay() {
        if (!this.elements.numberDisplayContainer) return;
        this.elements.numberDisplayContainer.innerHTML = '';
        const digitCount = this.spinEngine.digitCount;
        for (let i = 1; i <= digitCount; i++) {
            const numDiv = document.createElement('div');
            numDiv.className = 'number';
            numDiv.id = `number${i}`;
            numDiv.textContent = '0';
            this.elements.numberDisplayContainer.appendChild(numDiv);
        }
    }

    renderFireworkStyleCards(selectedId) {
        const fireworkStyles = [
            { id: 'classic', label: 'Nổ tâm cơ bản', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2 2m-9 9l-2 2m0-13l2 2m9 9l2 2"></path></svg>' },
            { id: 'rising', label: 'Pháo bay có đuôi', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V8m0 0l-3 3m3-3l3 3M5 22s2-5 7-5 7 5 7 5"></path></svg>' },
            { id: 'twinkle', label: 'Lấp lánh lung linh', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.91 5.89h6.19l-5.01 3.64 1.91 5.89-5-3.64-5 3.64 1.91-5.89-5.01-3.64h6.19z"></path></svg>' },
            { id: 'ring', label: 'Nổ vòng tròn', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle></svg>' },
            { id: 'heart', label: 'Nổ hình trái tim', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>' }
        ];

        this.elements.fireworkStyleCardsContainer.innerHTML = '';
        fireworkStyles.forEach(style => {
            const card = document.createElement('div');
            card.className = `firework-card ${style.id === selectedId ? 'selected' : ''}`;
            card.dataset.id = style.id;
            card.innerHTML = `
                <div class="preview-icon">${style.icon}</div>
                <div class="card-label">${style.label}</div>
            `;
            card.addEventListener('click', () => {
                document.querySelectorAll('.firework-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                if (this.fireworkEngine) this.fireworkEngine.setStyle(style.id);
            });
            this.elements.fireworkStyleCardsContainer.appendChild(card);
        });
    }

    fadeAudio(player, targetVolume, duration = 1000) {
        const startVolume = player.volume;
        const steps = 20;
        const volumeStep = (targetVolume - startVolume) / steps;
        const stepDuration = duration / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            player.volume = Math.max(0, Math.min(1, startVolume + (volumeStep * currentStep)));
            if (currentStep >= steps) {
                clearInterval(interval);
            }
        }, stepDuration);
    }
}
