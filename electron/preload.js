const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  windowControl: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    setAlwaysOnTop: (isAlwaysOnTop) => ipcRenderer.send('window-always-on-top', isAlwaysOnTop),
    move: (x, y) => ipcRenderer.send('window-move', { x, y }),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized')
  },
  onMaximized: (callback) => {
    ipcRenderer.on('window-maximized', (_, isMaximized) => callback(isMaximized))
    return () => {
      ipcRenderer.removeAllListeners('window-maximized')
    }
  }
}) 