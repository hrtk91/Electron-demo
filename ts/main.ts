import electron from 'electron'

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow = null;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height:600,
        // useContentSize: true,
        // frame: false,
        // transparent: true,
        // focusable: false,
        // alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile('index.html');
    // mainWindow.setFullScreen(true);
    // mainWindow.setIgnoreMouseEvents(true);

    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
