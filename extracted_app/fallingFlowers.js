// Hàm cài đặt canvas và hiệu ứng hoa rơi
function setupCanvas(canvasId, imagePath, isFromLeft, flowerCount) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
  
    // Đặt kích thước canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const flowers = [];
    const flowerImage = new Image();
    flowerImage.src = imagePath; // Đường dẫn tới hình ảnh hoa
  
    // Tạo đối tượng hoa
    function createFlower() {
      return {
        x: isFromLeft ? -Math.random() * 200 : canvas.width + Math.random() * 200,
        y: -Math.random() * 200, // Vị trí Y ban đầu
        size: Math.random() * 20 + 15, // Kích thước hoa (15px - 35px)
        speed: Math.random() * 1.5 + 0.5, // Tốc độ rơi chậm (0.5px - 2px)
        sway: Math.random() * 1.5 - 0.75, // Lắc lư qua lại
        swayOffset: Math.random() * 80 + 50, // Biên độ lắc lư
        spreadFactor: Math.random() * 0.4 + 0.3, // Hệ số lan tỏa
      };
    }
  
    // Cập nhật và vẽ hoa
    function updateAndDrawFlower(flower) {
      flower.y += flower.speed;
  
      // Tính toán vị trí X dựa trên hướng di chuyển
      if (isFromLeft) {
        flower.x += (canvas.width / 2) * flower.spreadFactor / canvas.height;
      } else {
        flower.x -= (canvas.width - canvas.width / 2) * flower.spreadFactor / canvas.height;
      }
  
      // Lắc lư qua lại
      flower.x += Math.sin(flower.y / flower.swayOffset) * flower.sway;
  
      // Vẽ hoa
      ctx.drawImage(flowerImage, flower.x, flower.y, flower.size, flower.size);
  
      // Đặt lại hoa nếu ra khỏi màn hình
      if (flower.y > canvas.height || (isFromLeft && flower.x > canvas.width / 2 + 150) || (!isFromLeft && flower.x < canvas.width / 2 - 150)) {
        flower.y = -20 - Math.random() * 200;
        flower.x = isFromLeft ? -150 - Math.random() * 150 : canvas.width + Math.random() * 150;
      }
    }
  
    // Tạo hiệu ứng hoa rơi
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flowers.forEach(updateAndDrawFlower);
      requestAnimationFrame(animate);
    }
  
    // Khi ảnh hoa tải xong, bắt đầu hiệu ứng
    flowerImage.onload = () => {
      for (let i = 0; i < flowerCount; i++) {
        flowers.push(createFlower());
      }
      animate();
    };
  
    // Điều chỉnh kích thước canvas khi thay đổi kích thước cửa sổ
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
  
  // Gọi hàm cài đặt cho từng canvas
  setupCanvas("fallingCanvasMai", "./images/hoamai.png", false, 70); // Hoa mai từ phải qua
  setupCanvas("fallingCanvasDao", "./images/hoadao.png", true, 70);  // Hoa đào từ trái qua
  