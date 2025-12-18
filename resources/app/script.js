const { ipcRenderer } = require("electron");

// Global state for animations, accessible by global animation loops
let fireworksEnabled = true;
let currentFireworkStyle = 'classic';

document.addEventListener("DOMContentLoaded", () => {
  // =================================================================
  // Global State (Scoped to DOMContentLoaded)
  // =================================================================
  let selectedPrize = null;
  let spinsLeft = 0;
  let prizeStatus = {};
  let isSpinning = false;
  let spinningInterval;
  let isMuted = true;

  // =================================================================
  // DOM Elements
  // =================================================================
  const number1 = document.getElementById("number1");
  const number2 = document.getElementById("number2");
  const number3 = document.getElementById("number3");
  const resultList = document.getElementById("result-list");
  const manualSpinButton = document.querySelector(".manual-spin-button button");
  const priceElement = document.querySelector(".price");
  const numberButtonsContainer = document.querySelector(".number-buttons");
  const audioPlayer = document.getElementById("audio-player");
  const audioPlayer1 = document.getElementById("audio-player1");
  const audioPlayer2 = document.getElementById("audio-player2");
  const notificationModal = document.getElementById("notification-modal");
  const modalMessage = document.getElementById("modal-message");
  const infoModal = document.getElementById("infoModal");
  const closeModalButton = document.getElementById("close-modal");
  const congratulationsModal = document.getElementById("congratulationsModal");
  const luckyNumberDisplay = document.getElementById("lucky-number-display");
  
  // Settings Modal Elements
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsButton = document.getElementById("close-settings-button");
  const settingsSidebarLinks = document.querySelectorAll(".settings-sidebar li");
  const settingsTabs = document.querySelectorAll(".settings-tab");
  const companyNameInput = document.getElementById("company-name-input");
  const logoFileInput = document.getElementById("logo-file-input");
  const infoImageInput = document.getElementById("info-image-input");
  const backgroundImageInput = document.getElementById("background-image-input");
  const saveBrandingButton = document.getElementById("save-branding-button");
  const showInfoModalButton = document.getElementById("show-info-modal-button");
  const prizeListEditor = document.getElementById("prize-list-editor");
  const addPrizeButton = document.getElementById("add-prize-button");
  const savePrizesButton = document.getElementById("save-prizes-button");
  const toggleSoundButton = document.getElementById("toggle-sound-button");
  const changeMusicButton = document.getElementById("change-music-button");

  // Effects Settings Elements
  const toggleFlowersCheckbox = document.getElementById('toggle-flowers-checkbox');
  const flowerSpeedSlider = document.getElementById('flower-speed-slider');
  const flowerSpeedValue = document.getElementById('flower-speed-value');
  const toggleFireworksCheckbox = document.getElementById('toggle-fireworks-checkbox');
  const fireworkStyleCardsContainer = document.getElementById('firework-style-cards');
  const saveEffectsButton = document.getElementById('save-effects-button');

  const fireworkStyles = [
    { id: 'classic', label: 'Nổ tâm cơ bản', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5l-2 2m-9 9l-2 2m0-13l2 2m9 9l2 2"></path></svg>' },
    { id: 'rising', label: 'Pháo bay có đuôi', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V8m0 0l-3 3m3-3l3 3M5 22s2-5 7-5 7 5 7 5"></path></svg>' },
    { id: 'twinkle', label: 'Lấp lánh lung linh', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.91 5.89h6.19l-5.01 3.64 1.91 5.89-5-3.64-5 3.64 1.91-5.89-5.01-3.64h6.19z"></path></svg>' },
    { id: 'ring', label: 'Nổ vòng tròn', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle></svg>' },
    { id: 'heart', label: 'Nổ hình trái tim', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>' }
  ];

  function renderFireworkStyleCards(selectedId) {
    fireworkStyleCardsContainer.innerHTML = '';
    fireworkStyles.forEach(style => {
      const card = document.createElement('div');
      card.className = `firework-card ${style.id === selectedId ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="preview-icon">${style.icon}</div>
        <div class="card-label">${style.label}</div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.firework-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentFireworkStyle = style.id;
      });
      fireworkStyleCardsContainer.appendChild(card);
    });
  }

  // =================================================================
  // Utility Functions
  // =================================================================

  function showNotification(message) {
    modalMessage.textContent = message;
    notificationModal.classList.remove("hidden");
  }

  function disableEnterKey() {
    document.addEventListener("keydown", preventEnterKey);
  }

  function enableEnterKey() {
    document.removeEventListener("keydown", preventEnterKey);
  }

  function preventEnterKey(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  // =================================================================
  // Core Application Logic (Spinning, Prizes, etc.)
  // =================================================================

  function updateSelectedPrize(prize, count) {
    if (!prizeStatus[prize]) {
      prizeStatus[prize] = { spinsLeft: count, isCompleted: false };
    }
    selectedPrize = prize;
    spinsLeft = prizeStatus[prize].spinsLeft;
    priceElement.textContent = `Đã chọn: ${prize}. Số lần quay: ${spinsLeft}`;
  }

  function resetState() {
    prizeStatus = {};
    selectedPrize = null;
    spinsLeft = 0;
    resultList.innerHTML = "";
    priceElement.textContent = "Vui lòng chọn giải thưởng để bắt đầu!";
  }

  function bindPrizeButtonEvents() {
    document.querySelectorAll(".spin-small").forEach((button) => {
      button.addEventListener("click", () => {
        const prize = button.getAttribute("data-prize");
        const count = parseInt(button.getAttribute("data-count"), 10);
        audioPlayer1.play();
        if (prizeStatus[prize]?.isCompleted) {
          showNotification(`${prize} đã hoàn tất quay. Vui lòng chọn giải khác!`);
          return;
        }
        updateSelectedPrize(prize, count);
      });
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter") event.preventDefault();
      });
    });
  }

  function checkSpinAvailability() {
    if (!selectedPrize) {
      showNotification("Vui lòng chọn một giải trước khi bấm quay!");
      return false;
    }
    if (prizeStatus[selectedPrize]?.isCompleted) {
      showNotification(`${selectedPrize} đã hoàn tất quay. Vui lòng chọn giải khác!`);
      return false;
    }
    if (spinsLeft <= 0) {
      showNotification(`Số lần quay cho ${selectedPrize} đã hết. Vui lòng chọn giải khác!`);
      return false;
    }
    return true;
  }
  
  function changeBackgroundColor(element) {
    element.style.backgroundColor = "#FFD700";
  }

  function changeBackgroundColorWhite(element) {
    element.style.backgroundColor = "#fff";
  }

  function showCongratulationsMessage(luckyNumber) {
    luckyNumberDisplay.textContent = luckyNumber;
    congratulationsModal.style.display = "block";
    setTimeout(() => {
      congratulationsModal.style.display = "none";
    }, 5000);
  }
  
  function playAudio() {
    audioPlayer.play();
    setTimeout(() => {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }, 3000);
  }

  function animateNumbers(stopIndex) {
    return setInterval(() => {
      if (stopIndex < 1) number1.textContent = Math.floor(Math.random() * 10);
      if (stopIndex < 2) number2.textContent = Math.floor(Math.random() * 10);
      if (stopIndex < 3) number3.textContent = Math.floor(Math.random() * 10);
    }, 50);
  }

  function displayLuckyNumber() {
    const luckyNumber = String(Math.floor(Math.random() * 491)).padStart(3, "0");
    changeBackgroundColorWhite(number1);
    changeBackgroundColorWhite(number2);
    changeBackgroundColorWhite(number3);
    const [digit1, digit2, digit3] = luckyNumber;

    let interval = animateNumbers(0);

    setTimeout(() => {
      manualSpinButton.disabled = true;
      manualSpinButton.style.backgroundColor = "#ccc";
      manualSpinButton.style.cursor = "not-allowed";

      clearInterval(interval);
      number1.textContent = digit1;
      audioPlayer1.play();
      changeBackgroundColor(number1);
      interval = animateNumbers(1);

      setTimeout(() => {
        clearInterval(interval);
        number2.textContent = digit2;
        audioPlayer1.play();
        changeBackgroundColor(number2);
        interval = animateNumbers(2);

        setTimeout(() => {
          clearInterval(interval);
          number3.textContent = digit3;
          changeBackgroundColor(number3);
          audioPlayer1.play();

          let resultItem = Array.from(resultList.children).find(li => li.dataset.prize === selectedPrize);
          if (!resultItem) {
            resultItem = document.createElement("li");
            resultItem.dataset.prize = selectedPrize;
            resultItem.innerHTML = `<strong>${selectedPrize}: </strong><span class="lucky-numbers" style="color: #FFD700;"></span>`;
            resultList.appendChild(resultItem);
          }
          const luckyNumbersSpan = resultItem.querySelector(".lucky-numbers");
          luckyNumbersSpan.textContent += luckyNumbersSpan.textContent ? `, ${luckyNumber}` : luckyNumber;
          
          disableEnterKey();
          setTimeout(() => {
            showCongratulationsMessage(luckyNumber);
            playAudio();
            setTimeout(enableEnterKey, 5000);
          }, 1000);

          manualSpinButton.disabled = false;
          manualSpinButton.style.backgroundColor = "yellow";
          manualSpinButton.style.cursor = "pointer";

          spinsLeft--;
          prizeStatus[selectedPrize].spinsLeft = spinsLeft;

          if (spinsLeft === 0) {
            prizeStatus[selectedPrize].isCompleted = true;
            priceElement.textContent = `${selectedPrize} đã hoàn tất quay số!`;
          } else {
            priceElement.textContent = `Đã chọn: ${selectedPrize}. Còn lại: ${spinsLeft}`;
          }
        }, 1000);
      }, 1000);
    }, 1000);
  }

  function handleSpinToggle() {
    if (!checkSpinAvailability()) return;
    if (!isSpinning) {
      isSpinning = true;
      manualSpinButton.textContent = "Dừng";
      spinningInterval = setInterval(() => {
        number1.textContent = Math.floor(Math.random() * 10);
        number2.textContent = Math.floor(Math.random() * 10);
        number3.textContent = Math.floor(Math.random() * 10);
      }, 50);
    } else {
      isSpinning = false;
      manualSpinButton.textContent = "Quay";
      clearInterval(spinningInterval);
      displayLuckyNumber();
    }
  }

  // =================================================================
  // Settings Modal Logic
  // =================================================================

  function openSettingsModal(tab = 'general') {
    // Populate prizes
    prizeListEditor.innerHTML = "";
    document.querySelectorAll(".spin-small").forEach(button => {
      const name = button.dataset.prize;
      const count = button.dataset.count;
      prizeListEditor.appendChild(createPrizeEntry(name, count));
    });

    // Populate company name
    ipcRenderer.invoke('get-setting', 'companyName').then(name => {
      companyNameInput.value = name || "";
    });

    // Populate effects settings
    ipcRenderer.invoke('get-setting', 'effects').then(effects => {
        if(effects) {
            toggleFlowersCheckbox.checked = effects.flowers.enabled;
            flowerSpeedSlider.value = effects.flowers.speed;
            flowerSpeedValue.textContent = effects.flowers.speed;
            toggleFireworksCheckbox.checked = effects.fireworks.enabled;
            
            const selectedStyle = effects.fireworks.style || 'classic';
            renderFireworkStyleCards(selectedStyle);
            currentFireworkStyle = selectedStyle;
        } else {
            renderFireworkStyleCards('classic');
            currentFireworkStyle = 'classic';
        }
    });
    
    switchTab(tab);
    settingsModal.classList.remove("hidden");
  }

  function switchTab(activeTab) {
    settingsSidebarLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.tab === activeTab);
    });
    settingsTabs.forEach(tab => {
      tab.classList.toggle('active', tab.id === `${activeTab}-settings`);
    });
  }

  settingsSidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(link.getAttribute("data-tab"));
    });
  });

  closeSettingsButton.addEventListener("click", () => settingsModal.classList.add("hidden"));

  // --- Prize Settings Logic ---
  function createPrizeEntry(name = "", count = 1) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "prize-entry";
    entryDiv.innerHTML = `<input type="text" placeholder="Tên giải thưởng" value="${name}"><input type="number" min="1" value="${count}"><button class="delete-prize-button">Xóa</button>`;
    entryDiv.querySelector(".delete-prize-button").addEventListener("click", () => entryDiv.remove());
    return entryDiv;
  }

  addPrizeButton.addEventListener("click", () => prizeListEditor.appendChild(createPrizeEntry()));

  savePrizesButton.addEventListener("click", () => {
    numberButtonsContainer.innerHTML = "";
    prizeListEditor.querySelectorAll(".prize-entry").forEach(entry => {
      const nameInput = entry.querySelector('input[type="text"]');
      const countInput = entry.querySelector('input[type="number"]');
      if (nameInput.value.trim() && countInput.value > 0) {
        const newButton = document.createElement("button");
        newButton.className = "spin-small";
        newButton.dataset.prize = nameInput.value.trim();
        newButton.dataset.count = countInput.value;
        newButton.textContent = nameInput.value.trim();
        numberButtonsContainer.appendChild(newButton);
      }
    });
    resetState();
    bindPrizeButtonEvents();
    showNotification("Đã lưu cài đặt giải thưởng!");
    settingsModal.classList.add("hidden");
  });

  // --- General Settings Logic ---
  saveBrandingButton.addEventListener("click", () => {
    const name = companyNameInput.value.trim();
    const logoFile = logoFileInput.files[0];
    const brandingPayload = {};
    if (name) brandingPayload.name = name;
    if (logoFile) brandingPayload.logoPath = logoFile.path;
    if (Object.keys(brandingPayload).length > 0) {
      ipcRenderer.send("update-branding", brandingPayload);
    }

    const infoImageFile = infoImageInput.files[0];
    if (infoImageFile) {
      ipcRenderer.send("update-info-image", { path: infoImageFile.path });
    }

    const backgroundImageFile = backgroundImageInput.files[0];
    if (backgroundImageFile) {
      ipcRenderer.send("update-background-image", { path: backgroundImageFile.path });
    }
    
    logoFileInput.value = "";
    infoImageInput.value = "";
    backgroundImageInput.value = "";
    settingsModal.classList.add("hidden");
  });

  showInfoModalButton.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
    infoModal.classList.remove("hidden");
  });

  // --- Sound Settings Logic ---
  toggleSoundButton.addEventListener("click", () => ipcRenderer.send('toggle-sound-from-renderer'));
  changeMusicButton.addEventListener("click", () => ipcRenderer.send('open-change-music-dialog'));
  
  // --- Effects Settings Logic ---
  flowerSpeedSlider.addEventListener('input', (e) => {
    flowerSpeedValue.textContent = e.target.value;
  });

  saveEffectsButton.addEventListener('click', () => {
    const selectedStyle = document.querySelector('.firework-card.selected')?.dataset.id || currentFireworkStyle || 'classic';
    const newEffectsSettings = {
        flowers: {
            enabled: toggleFlowersCheckbox.checked,
            speed: parseFloat(flowerSpeedSlider.value),
        },
        fireworks: {
            enabled: toggleFireworksCheckbox.checked,
            style: currentFireworkStyle, // Sử dụng biến global đã cập nhật khi click card
        }
    };
    ipcRenderer.send('update-effects-settings', newEffectsSettings);
    settingsModal.classList.add("hidden");
  });

  // =================================================================
  // IPC Event Listeners
  // =================================================================
  ipcRenderer.on('open-settings', (event, { tab }) => openSettingsModal(tab));

  ipcRenderer.on("sound-state-changed", (event, { muted, isInitial }) => {
    isMuted = muted;
    toggleSoundButton.textContent = muted ? "Bật âm thanh" : "Tắt âm thanh";
    audioPlayer2.muted = muted;
    if (!isInitial) showNotification(`Đã ${muted ? 'tắt' : 'bật'} âm thanh`);
  });

  ipcRenderer.on("music-updated", (event, { musicPath }) => {
    const url = new URL(musicPath, 'file://');
    url.searchParams.set('t', Date.now());
    audioPlayer2.src = url.href;
    if (!isMuted) audioPlayer2.play();
    showNotification("Đã thay đổi nhạc nền!");
  });
  
  ipcRenderer.on("set-background", (event, { backgroundUrl }) => {
    if (backgroundUrl) {
      document.body.style.backgroundImage = `url('${backgroundUrl}')`;
      showNotification("Đã thay đổi ảnh nền!");
    }
  });
  
  ipcRenderer.on("info-image-updated", (event, { infoImageUrl }) => {
    const infoImageElement = document.querySelector("#infoModal img");
    if (infoImageElement && infoImageUrl) {
      infoImageElement.src = infoImageUrl;
      showNotification("Đã thay đổi ảnh giới thiệu!");
    }
  });

  ipcRenderer.on("branding-updated", (event, { newName, newLogoUrl, newFaviconUrl }) => {
    if (newName) document.title = `Quay số trúng thưởng - ${newName}`;
    if (newLogoUrl) document.querySelector(".logo").src = newLogoUrl;
    if (newFaviconUrl) document.querySelector("link[rel='icon']").href = newFaviconUrl;
    showNotification("Đã cập nhật thương hiệu!");
  });

  ipcRenderer.on('effects-settings-updated', (event, effects) => {
    fireworksEnabled = effects.fireworks.enabled;
    currentFireworkStyle = effects.fireworks.style || 'classic';
    
    if (effects.flowers.enabled) {
        flowerAnimations.mai?.setSpeed(effects.flowers.speed);
        flowerAnimations.dao?.setSpeed(effects.flowers.speed);
        flowerAnimations.mai?.start();
        flowerAnimations.dao?.start();
    } else {
        flowerAnimations.mai?.stop();
        flowerAnimations.dao?.stop();
    }
    showNotification("Đã cập nhật cài đặt hiệu ứng!");
  });

  ipcRenderer.on("initial-data", (event, data) => {
    // Branding & Images
    if (data.companyName) document.title = `Quay số trúng thưởng - ${data.companyName}`;
    if (data.logoUrl) document.querySelector(".logo").src = data.logoUrl;
    if (data.faviconUrl) document.querySelector("link[rel='icon']").href = data.faviconUrl;
    if (data.backgroundUrl) document.body.style.backgroundImage = `url('${data.backgroundUrl}')`;
    if (data.infoImageUrl) document.querySelector("#infoModal img").src = data.infoImageUrl;

    // Sound
    isMuted = data.isMuted;
    audioPlayer2.muted = isMuted;
    if (data.musicPath) {
      const url = new URL(data.musicPath, 'file://');
      audioPlayer2.src = url.href;
    }
    if (!isMuted) audioPlayer2.play().catch(e => console.log("Initial play failed"));
    toggleSoundButton.textContent = isMuted ? "Bật âm thanh" : "Tắt âm thanh";

    // Effects
    if (data.effects) {
        fireworksEnabled = data.effects.fireworks.enabled;
        currentFireworkStyle = data.effects.fireworks.style || 'classic';
        if (data.effects.flowers.enabled) {
            flowerAnimations.mai?.setSpeed(data.effects.flowers.speed);
            flowerAnimations.dao?.setSpeed(data.effects.flowers.speed);
            flowerAnimations.mai?.start();
            flowerAnimations.dao?.start();
        }
    }
  });

  // =================================================================
  // Initial Setup Calls
  // =================================================================
  bindPrizeButtonEvents();
  closeModalButton.addEventListener("click", () => notificationModal.classList.add("hidden"));
  manualSpinButton.addEventListener("click", handleSpinToggle);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !settingsModal.classList.contains('hidden')) return;
    if (event.key === "Enter") {
      audioPlayer1.play();
      handleSpinToggle();
    }
  });
});

// =============================================================
// Fireworks Animation
// =============================================================
// The global fireworksEnabled and currentFireworkStyle variables will be updated by IPC listeners.

window.requestAnimFrame = (() => window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000/60); })();
var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  cw = window.innerWidth,
  ch = window.innerHeight,
  fireworks = [],
  particles = [],
  hue = 120,
  limiterTotal = 20,
  limiterTick = 0,
  timerTotal = 500,
  timerTick = 0,
  mousedown = false,
  mx,
  my;

if (canvas) {
  canvas.width = cw;
  canvas.height = ch;
}

function random(min, max) { return Math.random() * (max - min) + min; }
function calculateDistance(p1x, p1y, p2x, p2y) { return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2)); }
function Firework(sx, sy, tx, ty, customHue) {
    this.x = this.sx = sx;
    this.y = this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = [];
    this.coordinateCount = 3;
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
    this.hue = customHue || hue; // Lưu màu riêng cho quả pháo này
}

Firework.prototype.update = function(index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    if (this.targetRadius < 8) {
        this.targetRadius += 0.3;
    } else {
        this.targetRadius = 1;
    }
    this.speed *= this.acceleration;
    var vx = Math.cos(this.angle) * this.speed,
        vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
    if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty, false, this.hue); // Truyền màu vào hạt
        fireworks.splice(index, 1);
    } else {
        this.x += vx;
        this.y += vy;
        if (currentFireworkStyle === 'rising' && Math.random() < 0.4) {
            if (particles.length < 1000) // Giới hạn hạt để giảm lag
                particles.push(new Particle(this.x, this.y, 0.1, false, false, undefined, undefined, this.hue));
        }
    }
};

Firework.prototype.draw = function() {
    ctx.beginPath();
    ctx.setLineDash([6, 3]);
    ctx.lineCap = 'round';
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    for (let i = this.coordinates.length - 2; i >= 0; i--) {
        ctx.lineTo(this.coordinates[i][0], this.coordinates[i][1]);
    }
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsl(" + this.hue + ", 100%, " + this.brightness + "%)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
};

function Particle(x, y, customGravity, twinkleEffect, isSubParticle, angle, speed, pIdHue) {
    this.x = x;
    this.y = y;
    this.coordinates = [];
    // Độ dài đuôi biến thiên ngẫu nhiên để tạo sự tự nhiên
    this.coordinateCount = Math.floor(random(25, 50)); 
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    
    // Góc bắn có thêm một chút nhiễu (jitter)
    this.angle = angle !== undefined ? angle + random(-0.1, 0.1) : random(0, Math.PI * 2);
    // Tốc độ ban đầu đa dạng hơn
    this.speed = speed !== undefined ? speed : random(1, 12); 
    
    // Ma sát (mất năng lượng) ngẫu nhiên để các hạt không dừng lại cùng lúc
    this.friction = random(0.94, 0.98); 
    // Trọng lực nhẹ nhàng
    this.gravity = customGravity !== undefined ? customGravity : random(0.3, 0.5); 
    
    this.hue = pIdHue !== undefined ? random(pIdHue - 15, pIdHue + 15) : random(hue - 15, hue + 15);
    this.brightness = random(50, 85);
    this.alpha = 1;
    
    // Tốc độ mờ dần (tuổi thọ) cực kỳ quan trọng để tạo sự so le (staggered timing)
    this.decay = random(0.008, 0.025); 

    this.isTwinkling = twinkleEffect;
    this.hasSubExploded = isSubParticle;
}

Particle.prototype.update = function(index) {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    
    if (currentFireworkStyle === 'spiral' && !this.hasSubExploded) {
        this.angle += 0.1; 
    }

    // Áp dụng vật lý: mất năng lượng và chịu tác động trọng lực
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    
    // Fading light over time
    if (this.isTwinkling) {
        this.alpha = Math.random() > 0.15 ? this.alpha - this.decay : 1;
    } else {
        this.alpha -= this.decay;
    }

    if (currentFireworkStyle === 'falling_rain' && Math.random() < 0.1 && this.alpha > 0.3) {
        particles.push(new Particle(this.x, this.y, 0.05, false, true, random(0, Math.PI * 2), 0.3));
    }

    if (currentFireworkStyle === 'double_burst' && !this.hasSubExploded && this.alpha < 0.7 && Math.random() < 0.03) {
        createParticles(this.x, this.y, true); 
        this.hasSubExploded = true;
    }

    if (this.alpha <= this.decay) {
        particles.splice(index, 1);
    }
};

Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Vẽ đuôi mềm mại bằng cách giảm dần alpha và độ dày dọc theo các tọa độ cũ
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    
    for (let i = this.coordinates.length - 2; i >= 0; i--) {
        // Tạo hiệu ứng nét đứt tự nhiên bằng cách thỉnh thoảng bỏ qua điểm vẽ nếu muốn (ở đây dùng setLineDash để ổn định hơn)
        ctx.lineTo(this.coordinates[i][0], this.coordinates[i][1]);
    }
    
    ctx.lineTo(this.x, this.y);
    
    // Hiệu ứng "Sparky": Nét đứt ngẫu nhiên một chút
    ctx.setLineDash([random(10, 20), random(5, 15)]);
    
    // Độ dày và độ sáng giảm dần khi hạt pháo già đi
    ctx.lineWidth = this.alpha * 2; 
    ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + (this.brightness * this.alpha + 20) + "%, " + this.alpha + ")";
    
    ctx.stroke();
    ctx.setLineDash([]);
};

function createParticles(x, y, isSubParticle = false, pIdHue) {
    if (particles.length > 2000) return; // Chặn tạo thêm nếu quá nhiều hạt trên màn hình (Chống lag)

    let particleCount = 30;
    let style = isSubParticle ? 'classic' : currentFireworkStyle;
    let targetHue = pIdHue !== undefined ? pIdHue : hue;

    if (style === 'ring') {
        // Tạo 3 lớp vòng tròn để trông to và dày hơn
        for (let layer = 1; layer <= 3; layer++) {
            let layerCount = 25 + layer * 15;
            for (let i = 0; i < layerCount; i++) {
                let angle = (i / layerCount) * Math.PI * 2;
                let speed = layer * 4; // Tăng tốc độ lan tỏa
                particles.push(new Particle(x, y, 0.05, false, false, angle, speed, targetHue));
            }
        }
    } else if (style === 'heart') {
        // Tạo 2 lớp hình tim
        for (let layer = 1; layer <= 2; layer++) {
            let layerCount = 50 + layer * 25;
            for (let i = 0; i < layerCount; i++) {
                let t = (i / layerCount) * Math.PI * 2;
                let tx = 16 * Math.pow(Math.sin(t), 3);
                let ty = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                let angle = Math.atan2(ty, tx);
                let speed = (Math.sqrt(tx * tx + ty * ty) / 3) * (layer * 1.5); // Tăng tốc độ lan tỏa
                particles.push(new Particle(x, y, 0.05, false, false, angle, speed, targetHue));
            }
        }
    } else if (style === 'spiral') {
        particleCount = 25; // Giảm thêm theo yêu cầu
        for (let i = 0; i < particleCount; i++) {
            let angle = (i / particleCount) * Math.PI * 10;
            let speed = i / 15 + 1;
            particles.push(new Particle(x, y, 0.02, false, false, angle, speed, targetHue));
        }
    } else if (style === 'twinkle') {
        // Tạo 2 lớp lấp lánh - Giảm số lượng theo yêu cầu
        for (let layer = 1; layer <= 2; layer++) {
            let layerCount = 20 + layer * 10;
            while (layerCount--) {
                particles.push(new Particle(x, y, 0.4, true, false, undefined, random(2, 10) * layer, targetHue));
            }
        }
    } else {
        let customGravity = 0.6;
        let twinkleEffect = false;
        
        switch (style) {
            case 'rising':
                particleCount = 40;
                break;
            case 'falling_rain':
                customGravity = 1.2;
                particleCount = 30; // Giảm để bớt lag
                break;
            case 'double_burst':
                particleCount = 25; // Giảm từ 35 xuống 25
                break;
            case 'classic':
            default:
                particleCount = 60; // Tăng số lượng hạt cho nổ cơ bản
                break;
        }

        while (particleCount--) {
            particles.push(new Particle(x, y, customGravity, twinkleEffect, isSubParticle, undefined, random(2, 12), targetHue));
        }
    }
}

function loop() {
  requestAnimFrame(loop);
  
  if (!fireworksEnabled) {
    if(ctx) ctx.clearRect(0, 0, cw, ch);
    fireworks = [];
    particles = [];
    return;
  }

  if (!ctx) return;
  hue += 0.5;

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = "lighter";

  var i = fireworks.length;
  while(i--) { fireworks[i].draw(); fireworks[i].update(i); }
  
  i = particles.length;
  while(i--) { particles[i].draw(); particles[i].update(i); }

  if (timerTick >= timerTotal) {
    timerTick = 0;
  } else {
    var temp = timerTick % 400;
    
    // Bắn ngẫu nhiên nhiều quả pháo lớn nhỏ ở khu vực giữa màn hình
    if (temp % 60 === 0) { // Cứ mỗi 60 tick bắn một quả ngẫu nhiên
        let randomX = random(cw * 0.1, cw * 0.9);
        let targetX = random(cw * 0.2, cw * 0.8);
        let targetY = random(ch * 0.1, ch * 0.4);
        let randomHue = random(0, 360);
        fireworks.push(new Firework(randomX, ch, targetX, targetY, randomHue));
    }

    // Giữ lại 2 tia 2 bên nhưng cho bay vào giữa nhiều hơn
    if (temp <= 15 && temp % 5 === 0) {
      fireworks.push(new Firework(100, ch, random(cw * 0.3, cw * 0.5), random(ch * 0.1, ch * 0.3), random(0, 360)));
      fireworks.push(new Firework(cw - 100, ch, random(cw * 0.5, cw * 0.7), random(ch * 0.1, ch * 0.3), random(0, 360)));
    }
    
    timerTick++;
  }

  if (limiterTick >= limiterTotal) {
    if (mousedown) {
      fireworks.push(new Firework(cw / 2, ch, mx, my, random(0, 360)));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}

// Khởi tạo pháo hoa
window.addEventListener('load', () => {
    if(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        loop();
    }
});

if(canvas) {
    canvas.addEventListener("mousemove", function (e) { mx = e.pageX - canvas.offsetLeft; my = e.pageY - canvas.offsetTop; });
    canvas.addEventListener("mousedown", function (e) { e.preventDefault(); mousedown = true; });
    canvas.addEventListener("mouseup", function (e) { e.preventDefault(); mousedown = false; });
}