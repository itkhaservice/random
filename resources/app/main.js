const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const log = require('electron-log'); // Thêm electron-log

log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
log.transports.file.file = path.join(app.getPath('userData'), 'main.log');

process.on('uncaughtException', (error) => {
  log.error('Unhandled error in main process:', error);
  // Optional: Show an error dialog to the user
  // dialog.showErrorBox('Error', `An unhandled error occurred: ${error.message}`);
});

// Path for storing settings
const settingsPath = path.join(app.getPath("userData"), "settings.json");

let mainWindow;
const userMusicDir = path.join(app.getPath("userData"), "custom_music");
const userCustomThemeMusicPath = path.join(userMusicDir, "theme.mp3");

// Paths for custom logo and favicon
const userLogoDir = path.join(app.getPath("userData"), "custom_images");
const userCustomLogoPath = path.join(userLogoDir, "logo.png");
const userCustomFaviconPath = path.join(userLogoDir, "favicon.png");

// Paths for custom info image
const userInfoImageDir = path.join(app.getPath("userData"), "custom_info_images");
const userInfoImagePath = path.join(userInfoImageDir, "info.gif"); // Hoặc .png, .jpg tùy chọn

// Function to get the current theme music path
function getThemeMusicPath() {
  if (settings.customMusicPath && fs.existsSync(settings.customMusicPath)) {
    return settings.customMusicPath;
  }
  return path.join(app.getAppPath(), "musics", "theme.mp3");
}

// Function to get the current logo path
function getLogoPath() {
  if (settings.customLogoPath && fs.existsSync(settings.customLogoPath)) {
    return settings.customLogoPath;
  }
  return path.join(app.getAppPath(), "images", "logo.png");
}

// Function to get the current favicon path
function getFaviconPath() {
  if (settings.customFaviconPath && fs.existsSync(settings.customFaviconPath)) {
    return settings.customFaviconPath;
  }
  return path.join(app.getAppPath(), "images", "favicon.png");
}

// Function to get the current info image path
function getInfoImagePath() {
  if (settings.customInfoImagePath && fs.existsSync(settings.customInfoImagePath)) {
    return settings.customInfoImagePath;
  }
  return path.join(app.getAppPath(), "images", "gif-info.gif");
}

let settings = {
  isMuted: false,
  companyName: "KHASERVICE", // Default company name
  customMusicPath: null, // Đường dẫn đến nhạc tùy chỉnh của người dùng
  customLogoPath: null,
  customFaviconPath: null,
  customInfoImagePath: null, // Đường dẫn đến hình ảnh thông tin/quảng cáo tùy chỉnh
};

// Function to save settings
function saveSettings() {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    log.error("Failed to save settings:", error);
  }
}

// Function to load settings
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf-8");
      const loadedSettings = JSON.parse(data);
      settings = { ...settings, ...loadedSettings };
      // Đảm bảo customMusicPath vẫn hợp lệ
      if (settings.customMusicPath && !fs.existsSync(settings.customMusicPath)) {
        settings.customMusicPath = null;
      }
      // Đảm bảo customLogoPath và customFaviconPath vẫn hợp lệ
      if (settings.customLogoPath && !fs.existsSync(settings.customLogoPath)) {
        settings.customLogoPath = null;
      }
      if (settings.customFaviconPath && !fs.existsSync(settings.customFaviconPath)) {
        settings.customFaviconPath = null;
      }
      // Đảm bảo customInfoImagePath vẫn hợp lệ
      if (settings.customInfoImagePath && !fs.existsSync(settings.customInfoImagePath)) {
        settings.customInfoImagePath = null;
      }
    }
  } catch (error) {
    log.error("Failed to load settings:", error);
  }
}

app.on("ready", () => {
  loadSettings(); // Load settings on startup

  mainWindow = new BrowserWindow({
    width: 1919,
    height: 960,
    title: `Quay số trúng thưởng - ${settings.companyName}`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`file://${path.join(app.getAppPath(), 'RANDOM.html')}`);
  mainWindow.webContents.openDevTools(); // Mở DevTools để gỡ lỗi

  // Send initial music path, sound state, and branding to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send("initial-music-path", { musicPath: getThemeMusicPath() });
    mainWindow.webContents.send("toggle-sound", { muted: settings.isMuted });
    mainWindow.webContents.send("initial-branding", {
      newName: settings.companyName,
      newLogoPath: getLogoPath(),
      newFaviconPath: getFaviconPath(),
    });
    mainWindow.webContents.send("initial-info-image", { infoImagePath: getInfoImagePath() });
  });

  const menu = Menu.buildFromTemplate([
    {
      label: "Cài đặt",
      submenu: [
        {
          id: "toggle-sound-item",
          label: settings.isMuted ? "Bật âm thanh" : "Tắt âm thanh",
          click: (menuItem) => {
            settings.isMuted = !settings.isMuted;
            saveSettings();

            mainWindow.webContents.send("toggle-sound", { muted: settings.isMuted });
            menuItem.label = settings.isMuted ? "Bật âm thanh" : "Tắt âm thanh";
          },
        },
        {
          label: "Thay đổi hạn mức",
          click: () => {
            mainWindow.webContents.send("open-prize-settings");
          },
        },
        {
          label: "Đổi Nhạc",
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ["openFile"],
              filters: [{ name: "Audio", extensions: ["mp3", "wav", "ogg"] }],
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const selectedMusicPath = result.filePaths[0];
              
              // Đảm bảo thư mục đích tồn tại trong userData
              if (!fs.existsSync(userMusicDir)) {
                fs.mkdirSync(userMusicDir, { recursive: true });
              }

              try {
                fs.copyFileSync(selectedMusicPath, userCustomThemeMusicPath);
                settings.customMusicPath = userCustomThemeMusicPath; // Lưu đường dẫn mới vào settings
                saveSettings(); // Lưu cài đặt

                mainWindow.webContents.send("music-updated", {
                  musicPath: settings.customMusicPath,
                }); // Gửi đường dẫn mới về renderer

                dialog.showMessageBox(mainWindow, {
                  type: "info",
                  title: "Thông báo",
                  message: "Nhạc nền đã được thay đổi thành công!",
                });
              } catch (error) {
                log.error("Failed to copy new music:", error);
                dialog.showErrorBox("Lỗi", "Không thể thay đổi nhạc nền.");
              }
            }
          },
        },
        {
          label: "Tùy chỉnh thương hiệu",
          click: () => {
            mainWindow.webContents.send("open-branding-settings", {
              currentName: settings.companyName,
            });
          },
        },
        {
          label: "Đổi Background",
          click: () => {
            dialog
              .showOpenDialog(mainWindow, {
                properties: ["openFile"],
                filters: [
                  { name: "Images", extensions: ["jpg", "png", "gif"] },
                ],
              })
              .then((result) => {
                if (!result.canceled && result.filePaths.length > 0) {
                  mainWindow.webContents.send(
                    "set-background",
                    result.filePaths[0]
                  );
                }
              })
              .catch((err) => {
                log.error("Failed to open dialog for background:", err);
              });
          },
        },
        {
          label: "Thay đổi ảnh giới thiệu", // Tên menu item mới
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ["openFile"],
              filters: [{ name: "Images", extensions: ["gif", "jpg", "png", "jpeg"] }],
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const selectedImagePath = result.filePaths[0];
              
              // Đảm bảo thư mục đích tồn tại
              if (!fs.existsSync(userInfoImageDir)) {
                fs.mkdirSync(userInfoImageDir, { recursive: true });
              }

              try {
                // Giữ nguyên tên file gốc hoặc đổi thành một tên chuẩn
                const fileName = path.basename(selectedImagePath);
                const targetImagePath = path.join(userInfoImageDir, fileName);

                fs.copyFileSync(selectedImagePath, targetImagePath);
                settings.customInfoImagePath = targetImagePath; // Lưu đường dẫn mới vào settings
                saveSettings(); // Lưu cài đặt

                mainWindow.webContents.send("info-image-updated", {
                  infoImagePath: settings.customInfoImagePath,
                }); // Gửi đường dẫn mới về renderer

                dialog.showMessageBox(mainWindow, {
                  type: "info",
                  title: "Thông báo",
                  message: "Ảnh giới thiệu đã được thay đổi thành công!",
                }).then(() => {
                  mainWindow.webContents.send("close-branding-settings"); // Gửi sự kiện đóng modal
                });
              } catch (error) {
                log.error("Failed to copy info image:", error);
                dialog.showErrorBox("Lỗi", "Không thể thay đổi ảnh giới thiệu.");
              }
            }
          },
        },
        {
          label: "Thoát",
          role: "quit",
        },
      ],
    },
    {
      label: "Nhà phát triển",
      submenu: [
        {
          label: "Toggle Developer Tools",
          role: "toggleDevTools",
        },
        {
          label: "Cao Minh Thắng - 0376701749",
          enabled: false, // Make it a non-clickable information item
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
});

// Listener for branding updates from the renderer
ipcMain.on("update-branding", (event, { name, logoPath }) => {
  if (name) {
    settings.companyName = name;
    mainWindow.setTitle(`Quay số trúng thưởng - ${settings.companyName}`);
  }

  if (logoPath) {
    // Đảm bảo thư mục đích tồn tại
    if (!fs.existsSync(userLogoDir)) {
      fs.mkdirSync(userLogoDir, { recursive: true });
    }
    try {
      fs.copyFileSync(logoPath, userCustomLogoPath);
      fs.copyFileSync(logoPath, userCustomFaviconPath); // Favicon cũng được tạo từ logo
      settings.customLogoPath = userCustomLogoPath;
      settings.customFaviconPath = userCustomFaviconPath;
    } catch (error) {
      log.error("Failed to copy logo:", error);
      dialog.showErrorBox("Lỗi", "Không thể cập nhật logo.");
    }
  }
  
  saveSettings();
  
  // Notify renderer to update UI elements
  mainWindow.webContents.send("branding-updated", {
    newName: settings.companyName,
    newLogoPath: getLogoPath(), // Gửi đường dẫn logo mới
    newFaviconPath: getFaviconPath(), // Gửi đường dẫn favicon mới
  });
});


app.on("window-all-closed", () => {
  app.quit();
});
