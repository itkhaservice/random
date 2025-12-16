const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const number1 = document.getElementById("number1");
  const number2 = document.getElementById("number2");
  const number3 = document.getElementById("number3");
  const resultList = document.getElementById("result-list");
  const manualSpinButton = document.querySelector(".manual-spin-button button");
  const priceElement = document.querySelector(".price");
  const numberButtonsContainer = document.querySelector(".number-buttons");

  let selectedPrize = null;
  let spinsLeft = 0;
  let prizeStatus = {};

  // Modal hiển thị thông báo
  const modal = document.getElementById("notification-modal");
  const modalMessage = document.getElementById("modal-message");
  const closeModalButton = document.getElementById("close-modal");

  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  function showModal(message) {
    modalMessage.textContent = message;
    modal.classList.remove("hidden");
  }

    // Cập nhật trạng thái giải thưởng được chọn
  function updateSelectedPrize(prize, count) {
    if (!prizeStatus[prize]) {
      prizeStatus[prize] = { spinsLeft: count, isCompleted: false };
    }
    selectedPrize = prize;
    spinsLeft = prizeStatus[prize].spinsLeft;
    priceElement.textContent = `Đã chọn: ${prize}. Số lần quay: ${spinsLeft}`;
  }

  // Hàm reset trạng thái khi có thay đổi
  function resetState() {
    prizeStatus = {};
    selectedPrize = null;
    spinsLeft = 0;
    resultList.innerHTML = "";
    priceElement.textContent = "Vui lòng chọn giải thưởng để bắt đầu!";
  }

  // Gán sự kiện cho các nút giải thưởng
  function bindPrizeButtonEvents() {
    const spinButtons = document.querySelectorAll(".spin-small");
    spinButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const prize = button.getAttribute("data-prize");
        const count = parseInt(button.getAttribute("data-count"), 10);
        const audioPlayer1 = document.getElementById("audio-player1");
        audioPlayer1.play();
        if (prizeStatus[prize]?.isCompleted) {
          showModal(`${prize} đã hoàn tất quay. Vui lòng chọn giải khác!`);
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

  // Khởi tạo ban đầu
  bindPrizeButtonEvents();


  // Kiểm tra xem giải có còn lượt quay không
  function checkSpinAvailability() {
    if (!selectedPrize) {
      showModal("Vui lòng chọn một giải trước khi bấm quay!");
      return false;
    }
    if (prizeStatus[selectedPrize]?.isCompleted) {
      showModal(`${selectedPrize} đã hoàn tất quay. Vui lòng chọn giải khác!`);
      return false;
    }
    if (spinsLeft <= 0) {
      showModal(
        `Số lần quay cho ${selectedPrize} đã hết. Vui lòng chọn giải khác!`
      );
      return false;
    }
    return true;
  }

  // Tạo hiệu ứng quay số
  function animateNumbers(stopIndex) {
    return setInterval(() => {
      if (stopIndex < 1) number1.textContent = Math.floor(Math.random() * 10);
      if (stopIndex < 2) number2.textContent = Math.floor(Math.random() * 10);
      if (stopIndex < 3) number3.textContent = Math.floor(Math.random() * 10);
    }, 50);
  }

  // Hiển thị thông báo chúc mừng
  function showCongratulationsMessage(luckyNumber) {
    const modal = document.getElementById("congratulationsModal");
    const luckyNumberDisplay = document.getElementById("lucky-number-display");

    luckyNumberDisplay.textContent = luckyNumber;
    modal.style.display = "block";

    setTimeout(() => {
      modal.style.display = "none";
    }, 5000);
  }

  function playAudio() {
    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.play();
    setTimeout(() => {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }, 3000);
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

  // Hiển thị số may mắn và cập nhật trạng thái
  function displayLuckyNumber() {
    const luckyNumber = String(Math.floor(Math.random() * 491)).padStart(
      3,
      "0"
    );
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
      const audioPlayer1 = document.getElementById("audio-player1");
      audioPlayer1.play();
      changeBackgroundColor(number1);
      interval = animateNumbers(1);

      setTimeout(() => {
        clearInterval(interval);
        number2.textContent = digit2;
        const audioPlayer1 = document.getElementById("audio-player1");
        audioPlayer1.play();
        changeBackgroundColor(number2);
        interval = animateNumbers(2);

        setTimeout(() => {
          clearInterval(interval);
          number3.textContent = digit3;
          const audioPlayer1 = document.getElementById("audio-player1");
          changeBackgroundColor(number3);
          audioPlayer1.play();

          // Thêm số trúng thưởng vào danh sách kết quả
          let resultItem = Array.from(resultList.children).find(li => li.dataset.prize === selectedPrize);

          if (!resultItem) {
              resultItem = document.createElement("li");
              resultItem.dataset.prize = selectedPrize;
              resultItem.innerHTML = `<strong>${selectedPrize}: </strong><span class="lucky-numbers" style="color: #FFD700;"></span>`;
              resultList.appendChild(resultItem);
          }

          const luckyNumbersSpan = resultItem.querySelector(".lucky-numbers");
          luckyNumbersSpan.textContent += luckyNumbersSpan.textContent
            ? `, ${luckyNumber}`
            : luckyNumber;

          // Vô hiệu hóa phím Enter trước khi chạy showCongratulationsMessage
          disableEnterKey();

          setTimeout(() => {
            showCongratulationsMessage(luckyNumber);
            playAudio();

            // Bật lại phím Enter sau khi chạy xong showCongratulationsMessage
            setTimeout(() => {
              enableEnterKey();
            }, 5000); // Thời gian đủ để đảm bảo showCongratulationsMessage hoàn tất
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

  // Lắng nghe phím Enter trên toàn màn hình

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const audioPlayer1 = document.getElementById("audio-player1");

      audioPlayer1.play();

      handleSpinToggle();
    }
  });

  // Xử lý quay/dừng
  let isSpinning = false;
  let spinningInterval;
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

  manualSpinButton.addEventListener("click", handleSpinToggle);

  // --- IPC LISTENERS ---

  // Listener for toggling sound
  ipcRenderer.on("toggle-sound", (event, { muted }) => {
    console.log(`[IPC] Received 'toggle-sound' with muted: ${muted}`);
    const audioPlayer2 = document.getElementById("audio-player2");
    if (!audioPlayer2) {
      console.error("[Audio] Player 'audio-player2' not found!");
      return;
    }

    if (muted) {
      audioPlayer2.pause();
      console.log("[Audio] Paused.");
    } else {
      const playPromise = audioPlayer2.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {
          console.log("[Audio] Playback started successfully.");
        }).catch(error => {
          console.error("[Audio] Playback failed:", error);
        });
      }
    }
  });

  // Listener for changing background
  ipcRenderer.on("set-background", (event, filePath) => {
    if (filePath) {
      const formattedPath = filePath.replace(/\\/g, "/");
      document.body.style.backgroundImage = `url('${formattedPath}')`;
    }
  });

  // Listener for logo updates
  ipcRenderer.on("logo-updated", () => {
    const logoImage = document.querySelector(".logo");
    if (logoImage) {
      // Append a timestamp to the src to break the cache
      logoImage.src = "./images/logo.png?" + new Date().getTime();
    }
  });

  // --- LOGIC FOR PRIZE SETTINGS MODAL ---
  const prizeSettingsModal = document.getElementById("prize-settings-modal");
  const prizeListEditor = document.getElementById("prize-list-editor");
  const addPrizeButton = document.getElementById("add-prize-button");
  const savePrizesButton = document.getElementById("save-prizes-button");
  const cancelPrizesButton = document.getElementById("cancel-prizes-button");

  ipcRenderer.on('open-prize-settings', () => {
    openPrizeSettingsModal();
  });
  
  function createPrizeEntry(name = "", count = 1) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "prize-entry";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Tên giải thưởng";
    nameInput.value = name;

    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.min = "1";
    countInput.value = count;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Xóa";
    deleteButton.className = "delete-prize-button";
    deleteButton.addEventListener("click", () => {
        entryDiv.remove();
    });

    entryDiv.appendChild(nameInput);
    entryDiv.appendChild(countInput);
    entryDiv.appendChild(deleteButton);

    return entryDiv;
  }
  
  function openPrizeSettingsModal() {
    prizeListEditor.innerHTML = ""; // Xóa các entry cũ
    const currentPrizeButtons = document.querySelectorAll(".spin-small");
    currentPrizeButtons.forEach(button => {
        const name = button.dataset.prize;
        const count = button.dataset.count;
        const prizeEntry = createPrizeEntry(name, count);
        prizeListEditor.appendChild(prizeEntry);
    });
    prizeSettingsModal.classList.remove("hidden");
  }

  addPrizeButton.addEventListener("click", () => {
    prizeListEditor.appendChild(createPrizeEntry());
  });

  cancelPrizesButton.addEventListener("click", () => {
    prizeSettingsModal.classList.add("hidden");
  });

  savePrizesButton.addEventListener("click", () => {
    numberButtonsContainer.innerHTML = ""; // Xóa các nút cũ
    const prizeEntries = prizeListEditor.querySelectorAll(".prize-entry");
    
    prizeEntries.forEach(entry => {
        const nameInput = entry.querySelector('input[type="text"]');
        const countInput = entry.querySelector('input[type="number"]');
        const prizeName = nameInput.value.trim();
        const prizeCount = countInput.value;

        if (prizeName && prizeCount > 0) {
            const newButton = document.createElement("button");
            newButton.className = "spin-small";
            newButton.dataset.prize = prizeName;
            newButton.dataset.count = prizeCount;
            newButton.textContent = prizeName;
            numberButtonsContainer.appendChild(newButton);
        }
    });

    resetState();
    bindPrizeButtonEvents(); // Gán lại sự kiện cho các nút mới
    prizeSettingsModal.classList.add("hidden");
  });

  // --- LOGIC FOR BRANDING SETTINGS MODAL ---
  const brandingModal = document.getElementById("branding-settings-modal");
  const companyNameInput = document.getElementById("company-name-input");
  const logoFileInput = document.getElementById("logo-file-input");
  const saveBrandingButton = document.getElementById("save-branding-button");
  const cancelBrandingButton = document.getElementById("cancel-branding-button");

  ipcRenderer.on("open-branding-settings", (event, { currentName }) => {
    companyNameInput.value = currentName || "";
    logoFileInput.value = ""; // Clear file input
    brandingModal.classList.remove("hidden");
  });

  cancelBrandingButton.addEventListener("click", () => {
    brandingModal.classList.add("hidden");
  });

  saveBrandingButton.addEventListener("click", () => {
    const name = companyNameInput.value.trim();
    const logoFile = logoFileInput.files[0];

    const payload = {};
    if (name) {
      payload.name = name;
    }
    if (logoFile) {
      payload.logoPath = logoFile.path;
    }

    if (payload.name || payload.logoPath) {
      ipcRenderer.send("update-branding", payload);
    }
    
    brandingModal.classList.add("hidden");
  });

});

function changeBackgroundColor(element) {
  element.style.backgroundColor = "#FFD700";
}

function changeBackgroundColorWhite(element) {
  element.style.backgroundColor = "#fff";
}

// =============================================================
// Fireworks animation code remains unchanged
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

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

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateDistance(p1x, p1y, p2x, p2y) {
  var xDistance = p1x - p2x,
    yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function Firework(sx, sy, tx, ty) {
  this.x = sx;
  this.y = sy;

  this.sx = sx;
  this.sy = sy;

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
}

Firework.prototype.update = function (index) {
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

  this.distanceTraveled = calculateDistance(
    this.sx, 
    this.sy,
    this.x + vx,
    this.y + vy
  );

  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);

    fireworks.splice(index, 1);
  } else {
    this.x += vx;
    this.y += vy;
  }
};

Firework.prototype.draw = function () {
  ctx.beginPath();

  ctx.moveTo(
    this.coordinates[this.coordinates.length - 1][0],
    this.coordinates[this.coordinates.length - 1][1]
  );
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
  ctx.stroke();
  ctx.beginPath();
  ctx.stroke();
};

function Particle(x, y) {
  this.x = x;
  this.y = y;

  this.coordinates = [];
  this.coordinateCount = 5;

  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }

  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);

  this.friction = 0.95;

  this.gravity = 0.6;

  this.hue = random(hue - 20, hue + 20);
  this.brightness = random(50, 80);
  this.alpha = 1;

  this.decay = random(0.0075, 0.009);
}

Particle.prototype.update = function (index) {
  this.coordinates.pop();

  this.coordinates.unshift([this.x, this.y]);

  this.speed *= this.friction;

  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;

  this.alpha -= this.decay;

  if (this.alpha <= this.decay) {
    particles.splice(index, 1);
  }
};

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(
    this.coordinates[this.coordinates.length - 1][0],
    this.coordinates[this.coordinates.length - 1][1]
  );
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle =
    "hsla(" +
    this.hue +
    ", 100%, " +
    this.brightness +
    "%, " +
    this.alpha +
    ")";

  ctx.stroke();
};

function createParticles(x, y) {
  var particleCount = 20;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

function loop() {
  requestAnimFrame(loop);

  hue += 0.5;

  ctx.globalCompositeOperation = "destination-out";

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, cw, ch);

  ctx.globalCompositeOperation = "lighter";

  var i = fireworks.length;
  while (i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  var i = particles.length;
  while (i--) {
    particles[i].draw();
    particles[i].update(i);
  }

  if (timerTick >= timerTotal) {
    timerTick = 0;
  } else {
    var temp = timerTick % 400;
    if (temp <= 15) {
      fireworks.push(new Firework(100, ch, random(190, 200), random(90, 100)));
      fireworks.push(
        new Firework(cw - 100, ch, random(cw - 200, cw - 190), random(90, 100))
      );
    }

    var temp3 = temp / 10;

    if (temp > 319) {
      fireworks.push(
        new Firework(
          300 + (temp3 - 31) * 100,
          ch,
          300 + (temp3 - 31) * 100,
          200
        )
      );
    }

    timerTick++;
  }

  if (limiterTick >= limiterTotal) {
    if (mousedown) {
      fireworks.push(new Firework(cw / 2, ch, mx, my));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}

canvas.addEventListener("mousemove", function (e) {
  mx = e.pageX - canvas.offsetLeft;
  my = e.pageY - canvas.offsetTop;
});

canvas.addEventListener("mousedown", function (e) {
  e.preventDefault();
  mousedown = true;
});

canvas.addEventListener("mouseup", function (e) {
  e.preventDefault();
  mousedown = false;
});

window.onload = loop;