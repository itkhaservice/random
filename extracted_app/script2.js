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

  const prizeStatus = {};

  const modal = document.getElementById("notification-modal");
  const modalMessage = document.getElementById("modal-message");
  const closeModalButton = document.getElementById("close-modal");

  // Đóng modal khi nhấn nút đóng
  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Hiển thị modal với thông báo
  function showModal(message) {
    modalMessage.textContent = message;
    modal.classList.remove("hidden");
  }

  // Cập nhật giải thưởng được chọn và số lượt quay
  function updateSelectedPrize(prize, count) {
    selectedPrize = prize;
    spinsLeft = count;
    priceElement.textContent = `Đã chọn: ${prize}. Số lần quay: ${spinsLeft}`;
  }

  // Kiểm tra điều kiện trước khi quay
  function checkSpinAvailability() {
    if (!selectedPrize) {
      showModal("Vui lòng chọn một giải trước khi bấm quay!");
      return false;
    }
    if (prizeStatus[selectedPrize]) {
      showModal(`${selectedPrize} đã được quay. Vui lòng chọn giải khác!`);
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

  // Hiển thị số may mắn và cập nhật kết quả
  function displayLuckyNumber() {
    const luckyNumber = String(Math.floor(Math.random() * 451)).padStart(3, "0");
    const [digit1, digit2, digit3] = luckyNumber;

    number1.textContent = digit1;
    number2.textContent = digit2;
    number3.textContent = digit3;

    const prizeMapping = {
      "Giải đặc biệt": "one",
      "Giải nhất": "two",
      "Giải nhì": "three",
      "Giải ba": "four",
      "Giải khuyến khích": "five",
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

    // Hiển thị thông báo chúc mừng
    const congratulationBox = document.createElement("div");
    congratulationBox.innerHTML = `🎉 Chúc mừng - Số may mắn! 🎉<span style="
      color: #0f7f44; 
      font-size: 5rem; 
      font-weight: bolder; 
      -webkit-text-stroke: 1px #fff; 
      text-shadow: 0 0 5px #fff;
    ">${luckyNumber}</span>`;
    congratulationBox.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #FFD700;
      color: #000;
      font-size: 2.5rem;
      font-weight: bold;
      padding: 80px 60px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      text-align: center;
    `;
    document.body.appendChild(congratulationBox);
    setTimeout(() => {
      document.body.removeChild(congratulationBox);
    }, 2000);

    // Cập nhật trạng thái quay
    spinsLeft--;
    priceElement.textContent = `Đã chọn: ${selectedPrize}. Còn lại: ${spinsLeft}`;
    if (spinsLeft === 0) {
      prizeStatus[selectedPrize] = true;
      priceElement.textContent = `${selectedPrize} đã hoàn tất quay số!`;
    }
  }

  // Xử lý sự kiện quay/dừng
  let isSpinning = false;
  let spinningInterval;
  function handleSpinToggle() {
    if (!selectedPrize) {
      showModal("Vui lòng chọn một giải trước khi quay!");
      return;
    }
    if (!isSpinning) {
      // Bắt đầu quay
      if (!checkSpinAvailability()) return;
      isSpinning = true;
      manualSpinButton.textContent = "Dừng";
      spinningInterval = setInterval(() => {
        number1.textContent = Math.floor(Math.random() * 10);
        number2.textContent = Math.floor(Math.random() * 10);
        number3.textContent = Math.floor(Math.random() * 10);
      }, 50);
    } else {
      // Dừng quay
      isSpinning = false;
      manualSpinButton.textContent = "Quay";
      clearInterval(spinningInterval);
      displayLuckyNumber();
    }
  }

  // Gán sự kiện cho nút quay/dừng
  manualSpinButton.addEventListener("click", handleSpinToggle);

  // Lắng nghe phím Enter trên toàn màn hình
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSpinToggle();
    }
  });

  // Gán sự kiện chọn giải thưởng
  spinButtons.forEach((button) => {
    const prize = button.getAttribute("data-prize");
    const count = parseInt(button.getAttribute("data-count"), 10);
    button.addEventListener("click", () => {
      if (prizeStatus[prize]) {
        showModal(`${prize} đã được quay. Vui lòng chọn giải khác!`);
        return;
      }
      updateSelectedPrize(prize, count);
    });
  });
});
