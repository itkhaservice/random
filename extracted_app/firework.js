// Hàm cập nhật kích thước canvas và điều chỉnh các yếu tố
function resizecanvas1() {
  canvas1.width = window.innerWidth;
  canvas1.height = window.innerHeight;
  // Điều chỉnh lại pháo hoa nếu cần (xóa tất cả hoặc reset)
  fireworks.length = 0; // Xóa pháo hoa hiện tại
  particles.length = 0; // Xóa các hạt hiện tại
}

resizecanvas1(); // Thiết lập kích thước canvas1 ban đầu
window.addEventListener("resize", resizecanvas1); // Lắng nghe sự kiện resize

// Tạo pháo hoa mới sau khi resize
function loop() {
  requestAnimationFrame(loop);
  hue += 0.5;

  // Làm mờ nền và làm sáng hiệu ứng
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas1.width, canvas1.height);
  ctx.globalCompositeOperation = "lighter";

  // Cập nhật và vẽ pháo hoa
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  // Cập nhật và vẽ các hạt
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].draw();
    particles[i].update(i);
  }

  // Tạo pháo hoa mới
  if (timerTick >= timerTotal) {
    fireworks.push(
      new Firework(
        0, // Bắt đầu từ lề trái (X = 0)
        random(canvas1.height / 3, (canvas1.height * 2) / 3), // Y ngẫu nhiên
        canvas1.width, // Đích đến bên phải màn hình
        random(canvas1.height / 3, (canvas1.height * 2) / 3) // Y ngẫu nhiên
      )
    );
    timerTick = 0;
  } else {
    timerTick++;
  }
}

// Sự kiện chuột để thêm pháo hoa
canvas1.addEventListener("mousedown", function (e) {
  e.preventDefault();
  mx = e.pageX;
  my = e.pageY;
  fireworks.push(new Firework(0, my, canvas1.width, my)); // Bắt đầu từ lề trái
});

canvas1.addEventListener("mouseup", function (e) {
  e.preventDefault();
  mousedown = false;
});

// Bắt đầu vòng lặp
window.onload = loop;
