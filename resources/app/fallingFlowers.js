// Object to hold all flower animation controllers
const flowerAnimations = {};

// Hàm cài đặt canvas và hiệu ứng hoa rơi
function setupFlowerAnimation(canvasId, imagePath, isFromLeft, flowerCount) {
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

    function createFlower() {
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
  
    function updateAndDrawFlower(flower) {
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
  
    function animate() {
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
            speedMultiplier = Math.max(0, multiplier); // Ensure speed isn't negative
        }
    };

    flowerImage.onload = () => {
      flowers.length = 0; // Clear existing flowers before re-populating
      for (let i = 0; i < flowerCount; i++) {
        flowers.push(createFlower());
      }
      // Do not start automatically
    };
  
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return controller;
}

// Initialize controllers when the script loads
document.addEventListener('DOMContentLoaded', () => {
    flowerAnimations.mai = setupFlowerAnimation("fallingCanvasMai", "./images/hoamai.png", false, 70);
    flowerAnimations.dao = setupFlowerAnimation("fallingCanvasDao", "./images/hoadao.png", true, 70);
});