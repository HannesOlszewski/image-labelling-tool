const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
  Menu,
} = require("electron");
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

const isMac = process.platform === "darwin";

new Store().set("labels", [
  {
    name: "Amaretto",
    index: 1,
  },
  {
    name: "Aria",
    index: 2,
  },
  {
    name: "Chick Pea",
    index: 3,
  },
  {
    name: "Espresso",
    index: 4,
  },
  {
    name: "Lucifer",
    index: 5,
  },
  {
    name: "Oreo",
    index: 6,
  },
  {
    name: "Popcorn",
    index: 7,
  },
  {
    name: "Pumpkin",
    index: 8,
  },
  {
    name: "Whiskey",
    index: 9,
  },
]);

async function exportLabelledImages() {
  const store = new Store();
  const imagesPath = getImagesPath();
  const exportPath = (
    await dialog.showOpenDialog({
      properties: ["openDirectory"],
    })
  ).filePaths[0];

  if (!exportPath) {
    return;
  }

  const images =
    store.get(
      imagesPath.length > 0 ? imagesPath.toLowerCase() : "default" + ".images"
    ) ?? [];

  const labels = store.get("labels") ?? [];
  let copiedImages = 0;

  labels.forEach((label) => {
    const labelImages = images.filter((image) =>
      image.labels.includes(label.index)
    );

    if (labelImages.length > 0) {
      const labelPath = path.join(exportPath, label.name);

      if (!fs.existsSync(labelPath)) {
        fs.mkdirSync(labelPath);
      }

      labelImages.forEach((image) => {
        const imageBasePath = path.join(imagesPath, image.path);
        const imageExportPath = path.join(labelPath, image.path);

        if (fs.existsSync(imageBasePath) && !fs.existsSync(imageExportPath)) {
          fs.copyFileSync(imageBasePath, imageExportPath);
          copiedImages++;
        }
      });
    }
  });

  await dialog.showMessageBox({
    type: "info",
    title: "Export Labelled Images",
    message: `${copiedImages} images exported to ${exportPath}`,
  });
}

const template = [
  { role: "appMenu" },
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      {
        label: "&Export labelled images",
        click: exportLabelledImages,
        accelerator: isMac ? "Command+E" : "Ctrl+E",
      },
      isMac ? { role: "close" } : { role: "quit" },
    ],
  },
  // { role: "editMenu" },
  // { role: "viewMenu" },
  // { role: "windowMenu" },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
