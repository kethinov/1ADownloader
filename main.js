const electron = require('electron')
const path = require('path')
const {app} = electron
const {BrowserWindow} = electron
const {ipcMain} = electron

app.on('ready', function () {
  let win = new BrowserWindow({
    width: 600,
    height: 900,
    icon: process.platform === 'linux' && path.join(__dirname, '/images/icon.png')
  })
  win.loadURL('file://' + path.join(__dirname, '/index.html'))
  // win.openDevTools(); // uncomment to enter dev mode

  win.on('closed', function () {
    win = null
  })

  ipcMain.on('openListenWindow', function (event, data) {
    let listenWindow = new BrowserWindow({
      width: 320,
      height: 100,
      title: '1A - ' + data.epTitle
    })
    listenWindow.loadURL(data.href)
    listenWindow.on('closed', function () {
      listenWindow = null
    })
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
