const { contextBridge, ipcRenderer } = require('electron');

function preloadSetup() {
    contextBridge.exposeInMainWorld('MessageInvoker', {
        // Expose a method to the web page to send messages to the main process
        postMessage: (jsonMessage) => {
            const message = JSON.parse(jsonMessage);

            // Send the message to the main process
            ipcRenderer.send('printer-result', message);
        }
    });
}

preloadSetup();