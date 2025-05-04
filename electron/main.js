const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    transparent: false,
    backgroundColor: '#1F2937', // 深色模式背景色
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    // 等待开发服务器启动
    setTimeout(() => {
      const url = 'http://localhost:5173'
      console.log('Loading URL:', url)
      mainWindow.loadURL(url).catch(err => {
        console.error('Failed to load URL:', err)
      })
      mainWindow.webContents.openDevTools()
    }, 2000)
  } else {
    const filePath = path.join(__dirname, '../dist/index.html')
    console.log('Loading file:', filePath)
    mainWindow.loadFile(filePath).catch(err => {
      console.error('Failed to load file:', err)
    })
  }

  // 监听页面加载失败
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  // 监听窗口最大化状态变化
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false)
  })
}

// 窗口控制功能
ipcMain.on('window-minimize', () => {
  mainWindow.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow.close()
})

ipcMain.on('window-always-on-top', (event, isAlwaysOnTop) => {
  mainWindow.setAlwaysOnTop(isAlwaysOnTop)
})

ipcMain.on('window-move', (event, { x, y }) => {
  if (!mainWindow.isMaximized()) {
    mainWindow.setPosition(x, y)
  }
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow.isMaximized()
})

app.whenReady().then(() => {
  console.log('App is ready')
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
}) 