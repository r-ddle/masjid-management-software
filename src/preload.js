const { contextBridge, ipcRenderer } = require("electron");
const { findUser } = require("./db");

contextBridge.exposeInMainWorld("api", {
  login: async (username, password) => {
    return await findUser(username, password);
  },
  notifyLoginSuccess: () => {
    ipcRenderer.send("login-success");
  },
});
