const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  // =================================================================
  // Main Application Elements
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


  // =================================================================
  // Main Application State
  // =================================================================
  let selectedPrize = null;
  let spinsLeft = 0;
  let prizeStatus = {};
  let isSpinning = false;
  let spinningInterval;

  // =================================================================
  // Modals
  // =================================================================
  const notificationModal = document.getElementById("notification-modal");
  const modalMessage = document.getElementById("modal-message");
  const infoModal = document.getElementById("infoModal");
  const closeModalButton = document.getElementById("close-modal");
  const congratulationsModal = document.getElementById("congratulationsModal");
  const luckyNumberDisplay = document.getElementById("lucky-number-display");

  // =================================================================
  // Settings Modal Elements
  // =================================================================
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsButton = document.getElementById("close-settings-button");
  const settingsSidebarLinks = document.querySelectorAll(".settings-sidebar li");
  const settingsTabs = document.querySelectorAll(".settings-tab");

  // General Settings
  const companyNameInput = document.getElementById("company-name-input");
  const logoFileInput = document.getElementById("logo-file-input");
  const infoImageInput = document.getElementById("info-image-input");
  const backgroundImageInput = document.getElementById("background-image-input");
  const saveBrandingButton = document.getElementById("save-branding-button");
  const showInfoModalButton = document.getElementById("show-info-modal-button");

  // Prize Settings
  const prizeListEditor = document.getElementById("prize-list-editor");
  const addPrizeButton = document.getElementById("add-prize-button");
  const savePrizesButton = document.getElementById("save-prizes-button");

  // Sound Settings
  const toggleSoundButton = document.getElementById("toggle-sound-button");
  const changeMusicButton = document.getElementById("change-music-button");

  // =================================================================
  // Utility Functions
  // =================================================================

  function showNotification(message) {
    modalMessage.textContent = message;
    notificationModal.classList.remove("hidden");
  }
  
    // Hàm để vô hiệu hóa phím Enter
  function disableEnterKey() {
    document.addEventListener("keydown", preventEnterKey);
  }

  // Hàm để bật lại phím Enter
  function enableEnterKey() {
    document.removeEventListener("keydown", preventEnterKey);
  }

  // Hàm chặn hành động mặc định của phím Enter
  function preventEnterKey(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }


  // =================================================================
  // Core Application Logic
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
        if (event.key === "Enter") {
          event.preventDefault();
        }
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
    const luckyNumber = String(Math.floor(Math.random() * 491)).padStart(3,"0");
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
            setTimeout(() => {
              enableEnterKey();
            }, 5000);
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

  // Initial setup
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


  // =================================================================
  // Settings Modal Logic
  // =================================================================

  ipcRenderer.on('open-settings', (event, { tab }) => {
    prizeListEditor.innerHTML = "";
    document.querySelectorAll(".spin-small").forEach(button => {
        const name = button.dataset.prize;
        const count = button.dataset.count;
        prizeListEditor.appendChild(createPrizeEntry(name, count));
    });

    ipcRenderer.invoke('get-setting', 'companyName').then(name => {
        companyNameInput.value = name || "";
    });
    
    if (tab) {
        switchTab(tab);
    }

    settingsModal.classList.remove("hidden");
  });

  closeSettingsButton.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  function switchTab(activeTab) {
      settingsSidebarLinks.forEach(link => {
          if (link.dataset.tab === activeTab) {
              link.classList.add("active");
          } else {
              link.classList.remove("active");
          }
      });
      settingsTabs.forEach(tab => {
          if (tab.id === `${activeTab}-settings`) {
              tab.classList.add("active");
          } else {
              tab.classList.remove("active");
          }
      });
  }

  settingsSidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.getAttribute("data-tab");
      switchTab(tab);
    });
  });

  // --- Prize Settings ---
  function createPrizeEntry(name = "", count = 1) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "prize-entry";
    entryDiv.innerHTML = `
      <input type="text" placeholder="Tên giải thưởng" value="${name}">
      <input type="number" min="1" value="${count}">
      <button class="delete-prize-button">Xóa</button>
    `;
    entryDiv.querySelector(".delete-prize-button").addEventListener("click", () => {
        entryDiv.remove();
    });
    return entryDiv;
  }

  addPrizeButton.addEventListener("click", () => {
    prizeListEditor.appendChild(createPrizeEntry());
  });

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

  // --- General/Branding Settings ---
  saveBrandingButton.addEventListener("click", () => {
    console.log("Save button clicked.");

    // Handle Company Name and Logo
    const name = companyNameInput.value.trim();
    const logoFile = logoFileInput.files[0];
    const brandingPayload = {};
    if (name) {
        brandingPayload.name = name;
    }
    if (logoFile) {
        console.log('Logo file selected:', logoFile);
        brandingPayload.logoPath = logoFile.path;
    }
    if (Object.keys(brandingPayload).length > 0) {
        console.log('Sending update-branding:', brandingPayload);
        ipcRenderer.send("update-branding", brandingPayload);
    }

    // Handle Info Image
    const infoImageFile = infoImageInput.files[0];
    if (infoImageFile) {
        console.log('Info image file selected:', infoImageFile);
        const payload = { path: infoImageFile.path };
        console.log('Sending update-info-image:', payload);
        ipcRenderer.send("update-info-image", payload);
    } else {
        console.log('No info image file selected.');
    }

    // Handle Background Image
    const backgroundImageFile = backgroundImageInput.files[0];
    if (backgroundImageFile) {
        console.log('Background file selected:', backgroundImageFile);
        const payload = { path: backgroundImageFile.path };
        console.log('Sending update-background-image:', payload);
        ipcRenderer.send("update-background-image", payload);
    } else {
        console.log('No background file selected.');
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

  // --- Sound Settings ---
  toggleSoundButton.addEventListener("click", () => {
      ipcRenderer.send('toggle-sound-from-renderer');
  });
  
  changeMusicButton.addEventListener("click", () => {
      ipcRenderer.send('open-change-music-dialog');
  });


  // =================================================================
  // IPC Renderers (Listeners from Main Process)
  // =================================================================
  let isMuted = true;
  
  ipcRenderer.on("sound-state-changed", (event, { muted, isInitial }) => {
    isMuted = muted;
    toggleSoundButton.textContent = muted ? "Bật âm thanh" : "Tắt âm thanh";
    const audio = audioPlayer2;

    if (muted) {
        audio.pause();
    } else {
        if (audio.src) {
             audio.play().catch(err => console.error("Playback failed", err));
        }
    }
    if(!isInitial) {
        showNotification(`Đã ${muted ? 'tắt' : 'bật'} âm thanh`);
    }
  });

  ipcRenderer.on("music-updated", (event, { musicPath }) => {
      // Music still uses file paths, not data URLs, for streaming.
      const url = new URL(musicPath, 'file://');
      url.searchParams.set('t', Date.now()); // cache busting
      audioPlayer2.src = url.href;
      if (!isMuted) {
          audioPlayer2.play();
      }
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
    if (newName) {
      document.title = `Quay số trúng thưởng - ${newName}`;
    }
    const logoImage = document.querySelector(".logo");
    if (logoImage && newLogoUrl) {
      logoImage.src = newLogoUrl;
    }
    const faviconLink = document.querySelector("link[rel='icon']");
    if (faviconLink && newFaviconUrl) {
      faviconLink.href = newFaviconUrl;
    }
     showNotification("Đã cập nhật thương hiệu!");
  });

  // Set initial data from main process
  ipcRenderer.on("initial-data", (event, data) => {
      // Branding
      if (data.companyName) document.title = `Quay số trúng thưởng - ${data.companyName}`;
      if (data.logoUrl) document.querySelector(".logo").src = data.logoUrl;
      if (data.faviconUrl) document.querySelector("link[rel='icon']").href = data.faviconUrl;
      if (data.backgroundUrl) document.body.style.backgroundImage = `url('${data.backgroundUrl}')`;
      
      // Info Image
      if(data.infoImageUrl) document.querySelector("#infoModal img").src = data.infoImageUrl;

      // Sound (still uses file path)
      isMuted = data.isMuted;
      if (data.musicPath) {
          const url = new URL(data.musicPath, 'file://');
          audioPlayer2.src = url.href;
      }
      if (!isMuted) audioPlayer2.play().catch(e => console.log("Initial play failed"));
      toggleSoundButton.textContent = isMuted ? "Bật âm thanh" : "Tắt âm thanh";
  });
  
  
});

// =============================================================
// Fireworks animation code (remains unchanged)
// =============================================================
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

canvas.width = cw;
canvas.height = ch;

function random(min, max) { return Math.random() * (max - min) + min; }
function calculateDistance(p1x, p1y, p2x, p2y) { return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2)); }
function Firework(sx, sy, tx, ty) { this.x = this.sx = sx; this.y = this.sy = sy; this.tx = tx; this.ty = ty; this.distanceToTarget = calculateDistance(sx, sy, tx, ty); this.distanceTraveled = 0; this.coordinates = []; this.coordinateCount = 3; while(this.coordinateCount--) { this.coordinates.push([this.x, this.y]); } this.angle = Math.atan2(ty - sy, tx - sx); this.speed = 2; this.acceleration = 1.05; this.brightness = random(50, 70); this.targetRadius = 1; }
Firework.prototype.update = function(index) { this.coordinates.pop(); this.coordinates.unshift([this.x, this.y]); if (this.targetRadius < 8) { this.targetRadius += 0.3; } else { this.targetRadius = 1; } this.speed *= this.acceleration; var vx = Math.cos(this.angle) * this.speed, vy = Math.sin(this.angle) * this.speed; this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy); if (this.distanceTraveled >= this.distanceToTarget) { createParticles(this.tx, this.ty); fireworks.splice(index, 1); } else { this.x += vx; this.y += vy; } };
Firework.prototype.draw = function() { ctx.beginPath(); ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]); ctx.lineTo(this.x, this.y); ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)"; ctx.stroke(); ctx.beginPath(); ctx.stroke(); };
function Particle(x, y) { this.x = x; this.y = y; this.coordinates = []; this.coordinateCount = 5; while(this.coordinateCount--) { this.coordinates.push([this.x, this.y]); } this.angle = random(0, Math.PI * 2); this.speed = random(1, 10); this.friction = 0.95; this.gravity = 0.6; this.hue = random(hue - 20, hue + 20); this.brightness = random(50, 80); this.alpha = 1; this.decay = random(0.0075, 0.009); }
Particle.prototype.update = function(index) { this.coordinates.pop(); this.coordinates.unshift([this.x, this.y]); this.speed *= this.friction; this.x += Math.cos(this.angle) * this.speed; this.y += Math.sin(this.angle) * this.speed + this.gravity; this.alpha -= this.decay; if (this.alpha <= this.decay) { particles.splice(index, 1); } };
Particle.prototype.draw = function() { ctx.beginPath(); ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]); ctx.lineTo(this.x, this.y); ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")"; ctx.stroke(); };
function createParticles(x, y) { var particleCount = 20; while(particleCount--) { particles.push(new Particle(x, y)); } }
function loop() { requestAnimFrame(loop); hue += 0.5; ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; ctx.fillRect(0, 0, cw, ch); ctx.globalCompositeOperation = "lighter"; var i = fireworks.length; while(i--) { fireworks[i].draw(); fireworks[i].update(i); } i = particles.length; while(i--) { particles[i].draw(); particles[i].update(i); } if (timerTick >= timerTotal) { timerTick = 0; } else { var temp = timerTick % 400; if (temp <= 15) { fireworks.push(new Firework(100, ch, random(190, 200), random(90, 100))); fireworks.push(new Firework(cw - 100, ch, random(cw - 200, cw - 190), random(90, 100))); } var temp3 = temp / 10; if (temp > 319) { fireworks.push(new Firework(300 + (temp3 - 31) * 100, ch, 300 + (temp3 - 31) * 100, 200)); } timerTick++; } if (limiterTick >= limiterTotal) { if (mousedown) { fireworks.push(new Firework(cw / 2, ch, mx, my)); limiterTick = 0; } } else { limiterTick++; } }
canvas.addEventListener("mousemove", function (e) { mx = e.pageX - canvas.offsetLeft; my = e.pageY - canvas.offsetTop; });
canvas.addEventListener("mousedown", function (e) { e.preventDefault(); mousedown = true; });
canvas.addEventListener("mouseup", function (e) { e.preventDefault(); mousedown = false; });
window.onload = loop;