const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getFilePath: (file) => {
        try {
            return webUtils.getPathForFile(file);
        } catch (e) {
            console.error("Cannot get path for file", e);
            return null;
        }
    },
    send: (channel, data) => {
        // Danh sách các channel hợp lệ để gửi từ renderer
        let validChannels = [
            'toggle-sound-from-renderer',
            'open-change-music-dialog',
            'update-branding',
            'update-info-image',
            'update-background-image',
            'update-effects-settings',
            'update-sound-effect',
            'toggle-fullscreen'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    invoke: (channel, ...args) => {
        // Danh sách các channel hợp lệ để invoke từ renderer
        let validChannels = ['get-setting', 'save-setting'];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
    },
    on: (channel, func) => {
        // Danh sách các channel hợp lệ để lắng nghe từ renderer
        let validChannels = [
            'initial-data',
            'sound-state-changed',
            'music-updated',
            'sound-effect-updated',
            'set-background',
            'info-image-updated',
            'branding-updated',
            'effects-settings-updated',
            'open-settings'
        ];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
