document.addEventListener("DOMContentLoaded", () => {
  const number1 = document.getElementById("number1");
  const number2 = document.getElementById("number2");
  const number3 = document.getElementById("number3");
  const resultList = document.getElementById("result-list");
  const spinButtons = document.querySelectorAll(".spin-small");
  const manualSpinButton = document.querySelector(".manual-spin-button button");
  const priceElement = document.querySelector(".price");
  let selectedPrize = null;
  let spinsLeft = 0;
  

  // Lưu trạng thái từng giải thưởng
  const prizeStatus = {};

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

  // Hiển thị số may mắn và cập nhật trạng thái
  // function displayLuckyNumber() {
  //   const luckyNumber = String(Math.floor(Math.random() * 491)).padStart(
  //     3,
  //     "0"
  //   );
  //   changeBackgroundColorWhite(number1);

  //   changeBackgroundColorWhite(number2);

  //   changeBackgroundColorWhite(number3);
  //   const [digit1, digit2, digit3] = luckyNumber;

  //   let interval = animateNumbers(0);

  //   setTimeout(() => {
  //     manualSpinButton.disabled = true;
  //     manualSpinButton.style.backgroundColor = "#ccc";
  //     manualSpinButton.style.cursor = "not-allowed";

  //     clearInterval(interval);
  //     number1.textContent = digit1;
  //     const audioPlayer1 = document.getElementById("audio-player1");
  //     audioPlayer1.play();
  //     changeBackgroundColor(number1);
  //     interval = animateNumbers(1);

  //     setTimeout(() => {
  //       clearInterval(interval);
  //       number2.textContent = digit2;
  //       const audioPlayer1 = document.getElementById("audio-player1");
  //       audioPlayer1.play();
  //       changeBackgroundColor(number2);
  //       interval = animateNumbers(2);

  //       setTimeout(() => {
  //         clearInterval(interval);
  //         number3.textContent = digit3;
  //         const audioPlayer1 = document.getElementById("audio-player1");
  //         changeBackgroundColor(number3);
  //         audioPlayer1.play();

  //         const prizeMapping = {
  //           "Giải đặc biệt": "one",
  //           "Giải nhất": "two",
  //           "Giải nhì": "three",
  //           "Giải ba": "four",
  //           "Giải khuyến khích": "five",
  //           "Giải phụ": "six",
  //         };
  //         const prizeCode = prizeMapping[selectedPrize];
  //         let resultItem = document.querySelector(`#result-${prizeCode}`);
  //         if (!resultItem) {
  //           resultItem = document.createElement("li");
  //           resultItem.id = `result-${prizeCode}`;
  //           resultItem.innerHTML = `<strong>${selectedPrize}: </strong><span class="lucky-numbers" style="color: #FFD700;"></span>`;
  //           resultList.appendChild(resultItem);
  //         }
  //         const luckyNumbersSpan = resultItem.querySelector(".lucky-numbers");
  //         luckyNumbersSpan.textContent += luckyNumbersSpan.textContent
  //           ? `, ${luckyNumber}`
  //           : luckyNumber;

  //         setTimeout(() => {
  //           showCongratulationsMessage(luckyNumber);
  //           playAudio();
  //         }, 1000);

  //         manualSpinButton.disabled = false;
  //         manualSpinButton.style.backgroundColor = "yellow";
  //         manualSpinButton.style.cursor = "pointer";

  //         spinsLeft--;
  //         prizeStatus[selectedPrize].spinsLeft = spinsLeft;

  //         if (spinsLeft === 0) {
  //           prizeStatus[selectedPrize].isCompleted = true;
  //           priceElement.textContent = `${selectedPrize} đã hoàn tất quay số!`;
  //         } else {
  //           priceElement.textContent = `Đã chọn: ${selectedPrize}. Còn lại: ${spinsLeft}`;
  //         }
  //       }, 1000);
  //     }, 1000);
  //   }, 1000);
  // }

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

          const prizeMapping = {
            "Giải đặc biệt": "one",
            "Giải nhất": "two",
            "Giải nhì": "three",
            "Giải ba": "four",
            "Giải khuyến khích": "five",
            "Giải phụ": "six",
          };
          const prizeCode = prizeMapping[selectedPrize];
          let resultItem = document.querySelector(`#result-${prizeCode}`);
          if (!resultItem) {
            resultItem = document.createElement("li");
            resultItem.id = `result-${prizeCode}`;
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

  // Lắng nghe sự kiện chọn giải thưởng
  spinButtons.forEach((button) => {
    const prize = button.getAttribute("data-prize");
    const count = parseInt(button.getAttribute("data-count"), 10);
    button.addEventListener("click", () => {
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

  // Các hàm không liên quan khác (ví dụ như tương tác giao diện hoặc sự kiện bổ sung)
  function resetPrizeSelection() {
    selectedPrize = null;
    spinsLeft = 0;
    priceElement.textContent = "Vui lòng chọn giải thưởng để bắt đầu!";
  }

  function clearResultList() {
    resultList.innerHTML = "";
  }
});

function changeBackgroundColor(element) {
  element.style.backgroundColor = "#FFD700";
}

function changeBackgroundColorWhite(element) {
  element.style.backgroundColor = "#fff";
}

// =============================================================
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
