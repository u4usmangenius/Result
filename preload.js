const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Define functions for Electron-React communication
  // For example, use IndexedDB for data storage and retrieval
});
