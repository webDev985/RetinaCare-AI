const { app, BrowserWindow } = require("electron");
const path = require("path");

let win = null;
const isDev = !app.isPackaged;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Running with npm start
    win.loadURL("http://localhost:5173/");
    win.webContents.openDevTools();
  } else {
    // Running after EXE install (Offline Mode)
    const prodIndex = path.join(__dirname, "dist/index.html");
win.loadFile(prodIndex).catch(err => {
  console.error("Failed to load index.html", err);
});

  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
