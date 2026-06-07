const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to frontend
contextBridge.exposeInMainWorld('electronAPI', {
  // Get backend URL
  getBackendUrl: () => 'http://localhost:3001/api/v1',

  // Platform info
  platform: process.platform,

  // App info
  isPackaged: process.env.NODE_ENV === 'production',

  // Logs
  log: (message) => console.log('[Electron]', message),
});

// Listen for backend status
ipcRenderer.on('backend-status', (event, status) => {
  console.log('Backend status:', status);
});
