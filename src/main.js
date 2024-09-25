const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

const createScreen = () => {
    const screen = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,  // Disable Node.js in renderer for security
            contextIsolation: true,  // Isolate context to prevent direct access to Electron APIs
            preload: path.join(__dirname, 'preload.js'),  // Preload script to safely expose APIs
        },
    });
    
    screen.loadURL('http://localhost:3000');
    
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        screen.webContents.openDevTools();
    });
}

app.whenReady().then(() => {
    createScreen();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

ipcMain.on('printer-result', (_, message) => {
    console.log('main process:', message);
});