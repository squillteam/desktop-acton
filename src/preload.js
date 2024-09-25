const { contextBridge, ipcRenderer } = require('electron');

function preloadSetup() {
    contextBridge.exposeInMainWorld('MessageInvoker', {
        postMessage: (message) => {
            console.log("Message received from web page:", message);

            // Send the message to the main process
            ipcRenderer.send('printer-result', message);
        }
    });
}

preloadSetup();