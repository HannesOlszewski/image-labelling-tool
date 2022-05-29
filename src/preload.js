const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectImagesPath() {
    ipcRenderer.send("select-images-path");

    return new Promise((resolve) => {
      ipcRenderer.once("select-images-path-result", (event, result) => {
        resolve(result);
      });
    });
  },
  getImagesPath() {
    ipcRenderer.send("get-images-path");

    return new Promise((resolve) => {
      ipcRenderer.once("get-images-path-result", (event, result) => {
        resolve(result);
      });
    });
  },
  getImagesList() {
    ipcRenderer.send("get-images-list");

    return new Promise((resolve) => {
      ipcRenderer.once("get-images-list-result", (event, result) => {
        resolve(result);
      });
    });
  },
  getLabelledImages() {
    ipcRenderer.send("get-labelled-images");

    return new Promise((resolve) => {
      ipcRenderer.once("get-labelled-images-result", (event, result) => {
        console.log(result);
        resolve(result);
      });
    });
  },
  setLabelsForImage(image, labels) {
    ipcRenderer.send("set-labels-for-image", { image, labels });

    return new Promise((resolve) => {
      ipcRenderer.once("set-labels-for-image-result", (event, result) => {
        // console.log(result);
        resolve(result);
      });
    });
  },
});
