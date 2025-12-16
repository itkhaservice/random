const { ipcRenderer } = require('electron');

// Xử lý sự kiện đổi nhạc
ipcRenderer.on('change-music', () => {
  const audio = document.getElementById('audio-player'); // Giả sử bạn có một <audio> tag
  const newMusicPath = './path/to/new-music.mp3'; // Đường dẫn nhạc mới
  audio.src = newMusicPath;
  audio.play();
  alert('Đã đổi nhạc thành công!');
});

const { ipcRenderer } = require('electron');

// Lắng nghe sự kiện tắt/bật âm thanh từ main process
ipcRenderer.on('toggle-sound', (event, { muted }) => {
  if (muted) {
    console.log('Âm thanh đã bị tắt');
    // Thực hiện tắt âm thanh (ví dụ: dừng âm thanh đang phát)
  } else {
    console.log('Âm thanh đã được bật');
    // Thực hiện bật âm thanh (ví dụ: phát lại âm thanh)
  }
});

// Xử lý sự kiện đổi background
ipcRenderer.on('change-background', () => {
  const newBackgroundPath = './path/to/new-background.png'; // Đường dẫn ảnh nền mới
  document.body.style.backgroundImage = `url('${newBackgroundPath}')`;
  alert('Đã đổi background thành công!');
});
