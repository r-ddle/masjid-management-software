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

function createSelectOptionWindow(){

    selectOptionWindow = new BrowserWindow({
    width: 400,
    height:400,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
    autoHideMenuBar: true,
    title: "Select Option",
  });
  selectOptionWindow.setTitle("Select Option");
  selectOptionWindow.loadFile("./src/selectOption.html"); 
  selectOptionWindow.on("closed", ()=>{
    selectOptionWindow = null;
  })

}

function createJanazaDashboardWindow() {
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
  dashboardWindow.loadFile("src/dashboards/janazaDashboard.html");
  dashboardWindow.maximize();

  dashboardWindow.on("closed", () => {
    dashboardWindow = null;
  });
}


function createHiflDashboardWindow(){
  dashboardWindow = new BrowserWindow({
    width:800,
    height:800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },
    autoHideMenuBar: true,
    title: "Hifl Madarasa Student Payment and Details",
  });

  dashboardWindow.setTitle("Hifl Madarasa Student Payment and Details");
  dashboardWindow.loadFile("src/dashboards/hiflDashboard.html");
  dashboardWindow.maximize();

  dashboardWindow.on("closed", () =>{
    dashboardWindow = null;
  });

}



function createMahalaDashboardWindow(){

  dashboardWindow = new BrowserWindow({
    width: 800,
    height:800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "./src/preload.js"),
    },

    autoHideMenuBar: true,
    title: "Mahalla Member",

  });

  dashboardWindow.setTitle("Mahalla Member");
  dashboardWindow.loadFile("src/dashboards/mahallahMembers.html");
 dashboardWindow.maximize();


}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

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
const { setEngine } = require("crypto");
const { create } = require("domain");

ipcMain.on("login-success", () => {
  if (loginWindow) loginWindow.close();
  createSelectOptionWindow();
});

ipcMain.on("open-janaza", () => {
  if (selectOptionWindow)
  createJanazaDashboardWindow();
});

ipcMain.on("open-hifl", () => {
  if (selectOptionWindow)
  createHiflDashboardWindow();
});

ipcMain.on("open-Mahallah", () => {
  if (selectOptionWindow)
    createMahalaDashboardWindow();
});





// ! Your Tasks
// ? 1. Create a window similar to the login window but for the user to choose from janaza members, hifl members or mahala members. just 3 simple buttons
// ? 2. Create a window for each of the above options. 
// ? Since each dashboard will have different data you will need multiple html files and make sure to link the output.css
// ? 3. Make an IF statement for the windows so for example : if janaza is clicked then open janaza window and so on
