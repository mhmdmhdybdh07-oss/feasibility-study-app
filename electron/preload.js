const { contextBridge, ipcRenderer } = require('electron');

// === API آمن للواجهة ===
contextBridge.exposeInMainWorld('electronAPI', {
  // استقبال أوامر القائمة
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },

  // معلومات التطبيق
  getAppVersion: () => process.env.npm_package_version || '1.0.0',
  isElectron: () => true,
  platform: () => process.platform,

  // مسارات النظام
  getUserDataPath: () => {
    const { app } = require('electron');
    return app.getPath('userData');
  },
});
