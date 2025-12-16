const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Path for storing settings
const settingsPath = path.join(app.getPath("userData"), "settings.json");

let mainWindow;
let settings = {
  isMuted: false,
  companyName: "KHASERVICE", // Default company name
};

// Function to save settings
function saveSettings() {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

// Function to load settings
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf-8");
      settings = { ...settings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
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

  const filePath = path.join(__dirname, "random.html");
  mainWindow.loadFile(filePath);

  // Send initial sound state to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send("toggle-sound", { muted: settings.isMuted });
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
          click: () => {
            const musicPath = path.join(__dirname, "musics", "theme.mp3");
            shell.showItemInFolder(musicPath);
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
                console.log(err);
              });
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
    const targetLogoPath = path.join(__dirname, "images", "logo.png");
    const targetFaviconPath = path.join(__dirname, "images", "favicon.png");
    try {
      // Copy to both logo and favicon
      fs.copyFileSync(logoPath, targetLogoPath);
      fs.copyFileSync(logoPath, targetFaviconPath);
    } catch (error) {
      console.error("Failed to copy logo:", error);
    }
  }
  
  saveSettings();
  
  // Notify renderer to update UI elements
  mainWindow.webContents.send("branding-updated", { newName: settings.companyName });
});


app.on("window-all-closed", () => {
  app.quit();
});
