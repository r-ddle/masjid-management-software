const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const {
  updateMemberStatusInDb,
  createAdmin,
  addMember,
  updateMember,
  deleteMember,
} = require("./src/db"); // Add addMember and updateMember import

// Move IPC handlers before app initialization
ipcMain.handle("create-admin", async (event, username, password) => {
  try {
    const result = await createAdmin(username, password);
    return result;
  } catch (error) {
    console.error("Error in create-admin handler:", error);
    return { success: false, message: "Internal server error" };
  }
});

// Fix the add-member IPC handler
ipcMain.handle("add-member", async (event, memberData) => {
  try {
    if (!memberData || !memberData.location) {
      throw new Error("Invalid member data");
    }
    const result = await addMember(memberData);
    console.log("Add member result:", result); // Add logging
    return result;
  } catch (error) {
    console.error("Error in add-member handler:", error);
    return {
      success: false,
      message: error.message || "Internal server error",
    };
  }
});

// Add this with other IPC handlers
ipcMain.handle("update-member", async (event, memberData) => {
  try {
    const result = await updateMember(memberData);
    return result;
  } catch (error) {
    console.error("Error in update-member handler:", error);
    return {
      success: false,
      message: error.message || "Internal server error",
    };
  }
});

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

function createSelectOptionWindow() {
  selectOptionWindow = new BrowserWindow({
    width: 400,
    height: 400,
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
  selectOptionWindow.on("closed", () => {
    selectOptionWindow = null;
  });
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

function createHiflDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 800,
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

  dashboardWindow.on("closed", () => {
    dashboardWindow = null;
  });
}

function createMahalaDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 800,
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
ipcMain.on("login-success", () => {
  if (loginWindow) loginWindow.close();
  createSelectOptionWindow();
});

ipcMain.on("open-janaza", () => {
  if (selectOptionWindow) createJanazaDashboardWindow();
});

ipcMain.on("open-hifl", () => {
  if (selectOptionWindow) createHiflDashboardWindow();
});

ipcMain.on("open-Mahallah", () => {
  if (selectOptionWindow) createMahalaDashboardWindow();
});

ipcMain.on(
  "update-member-status",
  async (event, memberId, month, status, location) => {
    try {
      await updateMemberStatusInDb(memberId, month, status, location);
      return { status: "success", success: true };
    } catch (error) {
      console.error("Error updating member status: ", error);
      return { status: "error", success: false };
    }
  }
);

ipcMain.handle("delete-member", async (event, id) => {
  return await deleteMember(id);
});
