const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectImagesPath() {
    ipcRenderer.send('select-images-path');

    return new Promise((resolve) => {
      ipcRenderer.once('select-images-path-result', (event, result) => {
        resolve(result);
      });
    });
  },
  getImagesPath() {
    ipcRenderer.send('get-images-path');

    return new Promise((resolve) => {
      ipcRenderer.once('get-images-path-result', (event, result) => {
        resolve(result);
      });
    });
  },
  getImagesList(path) {
    ipcRenderer.send('get-images-list', path);

    return new Promise((resolve) => {
      ipcRenderer.once('get-images-list-result', (event, result) => {
        resolve(result);
      });
    });
  },
});
