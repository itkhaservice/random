const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const log = require('electron-log');
const _ = require('lodash');

// =================================================================
// Configuration and Paths
// =================================================================
log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.file = path.join(app.getPath('userData'), 'main.log');

process.on('uncaughtException', (error) => {
  log.error('Unhandled error in main process:', error);
});

const settingsPath = path.join(app.getPath("userData"), "settings.json");
const userMusicDir = path.join(app.getPath("userData"), "custom_music");
const userLogoDir = path.join(app.getPath("userData"), "custom_images");
const userInfoImageDir = path.join(app.getPath("userData"), "custom_info_images");
const userBackgroundDir = path.join(app.getPath("userData"), "custom_background");

const userCustomThemeMusicPath = path.join(userMusicDir, "theme.mp3");
const userCustomLogoPath = path.join(userLogoDir, "logo.png");
const userCustomFaviconPath = path.join(userLogoDir, "favicon.png");

let mainWindow;
const defaultSettings = {
  isMuted: false,
  companyName: "KHASERVICE",
  customMusicPath: null,
  customLogoPath: null,
  customFaviconPath: null,
  customInfoImagePath: null,
  customBackgroundImagePath: null,
  effects: {
      flowers: {
          enabled: true,
          speed: 1,
      },
      fireworks: {
          enabled: true,
          style: 'classic', // Default style
          availableStyles: ['classic', 'falling_rain', 'big_bang', 'twinkle', 'double_burst']
      }
  }
};
let settings = _.cloneDeep(defaultSettings);


// =================================================================
// Utility Functions
// =================================================================

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

function imageToDataUrl(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            return null;
        }
        const mimeType = getMimeType(filePath);
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString('base64');
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        log.error(`Failed to convert image to data URL: ${filePath}`, error);
        return null;
    }
}

// =================================================================
// Settings Management
// =================================================================

function getPath(type) {
    const pathMap = {
        music: { setting: settings.customMusicPath, default: path.join(app.getAppPath(), "musics", "theme.mp3") },
        logo: { setting: settings.customLogoPath, default: path.join(app.getAppPath(), "images", "logo.png") },
        favicon: { setting: settings.customFaviconPath, default: path.join(app.getAppPath(), "images", "favicon.png") },
        infoImage: { setting: settings.customInfoImagePath, default: path.join(app.getAppPath(), "images", "gif-info.gif") },
        backgroundImage: { setting: settings.customBackgroundImagePath, default: path.join(app.getAppPath(), "images", "background.png") },
    };
    const paths = pathMap[type];
    if (paths && paths.setting && fs.existsSync(paths.setting)) {
        return paths.setting;
    }
    return paths ? paths.default : null;
}

function saveSettings() {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    log.error("Failed to save settings:", error);
  }
}

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const loadedSettings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      // Deep merge with defaults to ensure new settings properties are added
      settings = _.merge(_.cloneDeep(defaultSettings), loadedSettings);
      
      // Validate paths
      for (const key in settings) {
          if (key.includes('Path') && settings[key] && typeof settings[key] === 'string' && !fs.existsSync(settings[key])) {
             settings[key] = null;
          }
      }
    }
  } catch (error) {
    log.error("Failed to load settings:", error);
    settings = _.cloneDeep(defaultSettings);
  }
}

// =================================================================
// Application Lifecycle
// =================================================================
app.on("ready", () => {
  loadSettings();

  mainWindow = new BrowserWindow({
    width: 1919,
    height: 960,
    title: `Quay số trúng thưởng - ${settings.companyName}`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
  });

  mainWindow.loadURL(`file://${path.join(app.getAppPath(), 'RANDOM.html')}`);
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send("initial-data", {
        companyName: settings.companyName,
        logoUrl: imageToDataUrl(getPath('logo')),
        faviconUrl: imageToDataUrl(getPath('favicon')),
        infoImageUrl: imageToDataUrl(getPath('infoImage')),
        backgroundUrl: imageToDataUrl(getPath('backgroundImage')),
        musicPath: getPath('music'),
        isMuted: settings.isMuted,
        effects: settings.effects,
    });
  });

  const menu = Menu.buildFromTemplate([
    { label: "Tùy chọn", submenu: [{ label: "Mở Cài đặt", click: () => mainWindow.webContents.send("open-settings", { tab: 'general' }) }, { label: "Thoát", role: "quit" }] },
    { label: "Nhà phát triển", submenu: [{ role: "toggleDevTools" }, { label: "Cao Minh Thắng - 0376701749", enabled: false }] },
  ]);
  Menu.setApplicationMenu(menu);
});

app.on("window-all-closed", () => app.quit());

// =================================================================
// IPC Handlers
// =================================================================

ipcMain.handle('get-setting', (event, key) => settings[key]);

ipcMain.on('toggle-sound-from-renderer', (event) => {
    settings.isMuted = !settings.isMuted;
    saveSettings();
    mainWindow.webContents.send("sound-state-changed", { muted: settings.isMuted, isInitial: false });
});

ipcMain.on('open-change-music-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ["openFile"], filters: [{ name: "Audio", extensions: ["mp3", "wav", "ogg"] }] });
    if (!canceled && filePaths.length > 0) {
        try {
            if (!fs.existsSync(userMusicDir)) fs.mkdirSync(userMusicDir, { recursive: true });
            fs.copyFileSync(filePaths[0], userCustomThemeMusicPath);
            settings.customMusicPath = userCustomThemeMusicPath;
            saveSettings();
            mainWindow.webContents.send("music-updated", { musicPath: settings.customMusicPath });
        } catch (error) {
            log.error("Failed to copy music:", error);
            dialog.showErrorBox("Lỗi", "Không thể thay đổi nhạc nền.");
        }
    }
});

ipcMain.on("update-branding", (event, { name, logoPath }) => {
  if (name) {
    settings.companyName = name;
    mainWindow.setTitle(`Quay số trúng thưởng - ${settings.companyName}`);
  }
  if (logoPath) {
    try {
      if (!fs.existsSync(userLogoDir)) fs.mkdirSync(userLogoDir, { recursive: true });
      fs.copyFileSync(logoPath, userCustomLogoPath);
      fs.copyFileSync(logoPath, userCustomFaviconPath);
      settings.customLogoPath = userCustomLogoPath;
      settings.customFaviconPath = userCustomFaviconPath;
    } catch (error) {
      log.error("Failed to copy logo:", error);
      dialog.showErrorBox("Lỗi", "Không thể cập nhật logo.");
    }
  }
  saveSettings();
  mainWindow.webContents.send("branding-updated", {
    newName: settings.companyName,
    newLogoUrl: imageToDataUrl(getPath('logo')),
    newFaviconUrl: imageToDataUrl(getPath('favicon')),
  });
});

ipcMain.on("update-info-image", (event, { path: imagePath }) => {
    try {
        if (!fs.existsSync(userInfoImageDir)) fs.mkdirSync(userInfoImageDir, { recursive: true });
        const targetPath = path.join(userInfoImageDir, path.basename(imagePath));
        fs.copyFileSync(imagePath, targetPath);
        settings.customInfoImagePath = targetPath;
        saveSettings();
        mainWindow.webContents.send("info-image-updated", { infoImageUrl: imageToDataUrl(targetPath) });
    } catch (error) {
        log.error("Failed to copy info image:", error);
        dialog.showErrorBox("Lỗi", "Không thể thay đổi ảnh giới thiệu.");
    }
});

ipcMain.on("update-background-image", (event, arg) => {
    const imagePath = arg ? arg.path : undefined;
    if (!imagePath) {
        return;
    }
    try {
        if (!fs.existsSync(userBackgroundDir)) fs.mkdirSync(userBackgroundDir, { recursive: true });
        const targetPath = path.join(userBackgroundDir, path.basename(imagePath));
        fs.copyFileSync(imagePath, targetPath);
        settings.customBackgroundImagePath = targetPath;
        saveSettings();
        mainWindow.webContents.send("set-background", { backgroundUrl: imageToDataUrl(targetPath) });
    } catch (error) {
        log.error("Failed to copy background image:", error);
        dialog.showErrorBox("Lỗi", "Không thể thay đổi ảnh nền.");
    }
});

ipcMain.on('update-effects-settings', (event, newEffectsSettings) => {
    settings.effects = _.merge(settings.effects, newEffectsSettings);
    saveSettings();
    // Broadcast the confirmed new settings to all windows (or just the main one)
    mainWindow.webContents.send('effects-settings-updated', settings.effects);
});