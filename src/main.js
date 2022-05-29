const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.substring(7);
    callback(decodeURI(path.normalize(url)));
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Gets the selected path for loading images from.
 *
 * @returns {string} the path or an empty string if no path was selected
 */
function getImagesPath() {
  const store = new Store();
  return store.get("imagesPath") ?? "";
}

/**
 * Sets the selected path for loading images from.
 *
 * @param path {string} the path to set
 */
function setImagesPath(path) {
  const store = new Store();
  store.set("imagesPath", path);
}

ipcMain.on("select-images-path", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  const [selectedPath] = result.filePaths;

  if (selectedPath) {
    setImagesPath(selectedPath);
    event.sender.send("select-images-path-result", selectedPath);
  }
});

ipcMain.on("get-images-path", (event) => {
  event.sender.send("get-images-path-result", getImagesPath());
});

ipcMain.on("get-images-list", async (event) => {
  const imagesPath = getImagesPath();

  if (!imagesPath || imagesPath.length === 0) {
    event.sender.send("get-images-list-result", []);
    return;
  }

  fs.readdir(imagesPath, (err, files) => {
    event.sender.send(
      "get-images-list-result",
      files
        .filter(
          (file) =>
            file.toLowerCase().endsWith(".jpg") ||
            file.toLowerCase().endsWith(".png") ||
            file.toLowerCase().endsWith(".jpeg") ||
            file.toLowerCase().endsWith(".cr2")
        )
        .sort()
    );
  });
});

ipcMain.on("get-labelled-images", async (event) => {
  const store = new Store();
  const imagesPath = getImagesPath();

  const images =
    store.get(
      imagesPath.length > 0 ? imagesPath.toLowerCase() : "default" + ".images"
    ) ?? [];

  event.sender.send("get-labelled-images-result", images);
});

ipcMain.on("set-labels-for-image", (event, { image, labels }) => {
  const store = new Store();
  const imagesPath = getImagesPath();

  const images =
    store.get(
      imagesPath.length > 0 ? imagesPath.toLowerCase() : "default" + ".images"
    ) ?? [];

  const imageIndex = images.findIndex((i) => i.path === image);

  if (imageIndex === -1) {
    images.push({ path: image, labels });
  } else {
    images[imageIndex] = { path: image, labels };
  }

  store.set(
    imagesPath.length > 0 ? imagesPath.toLowerCase() : "default" + ".images",
    images
  );

  event.sender.send("set-labels-for-image-result", { image, labels });
});
