const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    height: 600,
    width: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    title: "Masjid Management System",
  });

  win.setTitle("Masjid Management System");
  win.loadFile("src/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
