const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');
const config = require('./config.json');
const fs = require('fs');
require('./backEnd/lan');

function createWindow () {
    const win = new BrowserWindow({
        resizable: false,
        height: 533,
        width: 1000,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.removeMenu();
    win.loadFile('index.html');
    // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

ipcMain.on('getUsername', (eventConfig, args) => eventConfig.reply("getUsername", config.username));

ipcMain.on('getIp', (eventConfig, args) => eventConfig.reply("getIp", config.ip));

ipcMain.on('setUsername', (eventConfig, args) => {
    config.username = args;
    gravar();
});

ipcMain.on('setIp', (eventConfig, args) => {
    config.ip = args;
    gravar();
});

function gravar() {
    fs.writeFileSync('./resources/app/config.json', JSON.stringify(config, null, 4));
}