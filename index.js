const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  loginWindow = new BrowserWindow({
    height: 500,
    width: 500,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
    title: "Masjid Management System",
    autoHideMenuBar: true,
  });

  loginWindow.setTitle("Masjid Management System");
  loginWindow.loadFile("src/index.html");
}

function createDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
    autoHideMenuBar: true,
    title: "Dashboard",
  });

  dashboardWindow.setTitle("Masjid Dashboard");
  dashboardWindow.loadFile("src/dashboard.html");
  dashboardWindow.maximize();

  dashboardWindow.on("closed", () => {
    dashboardWindow = null;
  });
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

// IPC communication
const { ipcMain } = require("electron");

ipcMain.on("login-success", () => {
  if (loginWindow) loginWindow.close();
  createDashboardWindow();
});
