const { contextBridge, ipcRenderer } = require('electron');

function preloadSetup() {
    contextBridge.exposeInMainWorld('MessageInvoker', {
        // Expose a method to the web page to send messages to the main process
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
        postMessage: (jsonMessage) => {
            const message = JSON.parse(jsonMessage);

            // Send the message to the main process
            ipcRenderer.send('printer-result', message);
        }
    });
}

preloadSetup();