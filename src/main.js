const {
  app, BrowserWindow, dialog, ipcMain,
} = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let imagesPath = '';

ipcMain.on('select-images-path', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  [imagesPath] = result.filePaths;

  event.sender.send('select-images-path-result', imagesPath);
});

ipcMain.on('get-images-path', (event) => {
  event.sender.send('get-images-path-result', imagesPath);
});

ipcMain.on('get-images-list', async (event) => {
  fs.readdir(imagesPath, (err, files) => {
    event.sender.send(
      'get-images-list-result',
      files
        .filter(
          (file) => file.toLowerCase().endsWith('.jpg')
            || file.toLowerCase().endsWith('.png')
            || file.toLowerCase().endsWith('.jpeg')
            || file.toLowerCase().endsWith('.cr2'),
        )
        .sort(),
    );
  });
});
