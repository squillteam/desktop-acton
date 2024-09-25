const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const escpos = require('escpos');

const createScreen = () => {
    const width = 1024;
    const height = 768;

    const screen = new BrowserWindow({
        minWidth: width,
        minHeight: height,
        width,
        height,
        // titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: false,  // Disable Node.js in renderer for security
            contextIsolation: true,  // Isolate context to prevent direct access to Electron APIs
            preload: path.join(__dirname, 'preload.js'),  // Preload script to safely expose APIs
        },
    });
    
    screen.menuBarVisible = false;
    screen.loadURL('https://web-acton.vercel.app');
    
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

// Example from message:
// {
//     "name": "test test",
//     "methodology": "VIVA LEVE",
//     "level": 2,
//     "stage": 6,
//     "needs": [
//     {
//         "name": "Qualidade de Vida",
//         "priority": 60,
//         "showName": "Melhorar a qualidade de vida"
//     }
//     ],
//     "date": "2024-09-25T03:05:14.238Z",
//     "specialNeeds": [
//     {
//         "name": "Qualidade de Vida",
//         "priority": 60,
//         "showName": "Melhorar a qualidade de vida"
//     }
//     ]
// }
ipcMain.on('printer-result', (_, message) => {
    console.log('main process:', message);

    const device = new escpos.Network('10.0.6.2', 9100);
    const options = { encoding: 'GB18030' /* default */ };
    const printer = new escpos.Printer(device, options);

    device.open((error) => {
        if (error) {
            console.error(error);
            return;
        }

        printer
            .font('a')
            .align('ct')
            .style('bu')
            .size(1, 1)
            .text(`Nome: ${message.name}`)
            .text(`Metodologia: ${message.methodology}`)
            .text(`Nível: ${message.level}`)
            .text(`Fase: ${message.stage}`);
        
        printer.feed(1);

        if (message.specialNeeds && message.specialNeeds.length > 0) {
            printer.text('Necessidades especiais:');

            message.specialNeeds.forEach((need) => {
                printer.text(`> ${need.showName}`);
            });
        }

        printer.feed(1);
        printer.cut();
        printer.close();
    });
});