const { app, BrowserWindow, Menu } = require("electron");
const path = require("path"); // Import module 'path' của Node.js
let isMuted = false;
let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1919,
    height: 960,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Đường dẫn tới file random.html nằm cùng thư mục với main.js
  const filePath = path.join(__dirname, "random.html");
  mainWindow.loadFile(filePath); // Load file HTML

  // Thêm menu tùy chỉnh
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Tắt âm thanh",
          click: (menuItem) => {
            isMuted = !isMuted; // Đảo trạng thái âm thanh
            if (isMuted) {
              // Gửi sự kiện tắt âm thanh đến renderer process
              mainWindow.webContents.send("toggle-sound", { muted: true });
              menuItem.label = "Bật âm thanh"; // Cập nhật nhãn menu
            } else {
              // Gửi sự kiện bật âm thanh đến renderer process
              mainWindow.webContents.send("toggle-sound", { muted: false });
              menuItem.label = "Tắt âm thanh"; // Cập nhật nhãn menu
            }
          },
        },
        {
          label: "Thay đổi hạn mức",
          click: () => {
            mainWindow.webContents.send("change-max-number"); // Gửi sự kiện đến renderer process
          },
        },
        {
          label: "Đổi Nhạc",
          click: () => {
            mainWindow.webContents.send("change-music"); // Gửi sự kiện đến renderer process
          },
        },
        {
          label: "Đổi Background",
          click: () => {
            mainWindow.webContents.send("change-background"); // Gửi sự kiện đến renderer process
          },
        },
        {
          label: "Thoát",
          role: "quit", // Thoát ứng dụng
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu); // Áp dụng menu vào ứng dụng
});

app.on("window-all-closed", () => {
  app.quit();
});
