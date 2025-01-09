const { contextBridge, ipcRenderer } = require("electron");
const { findUser, fetchMembers } = require("./db");

contextBridge.exposeInMainWorld("api", {
  login: async (username, password) => {
    return await findUser(username, password);
  },
  fetchMembers: async (location) => {
    return await fetchMembers(location);
  },
  updateMemberStatus: async (memberId, month, status, location) => {
    return await ipcRenderer.send(
      "update-member-status",
      memberId,
      month,
      status,
      location
    );
  },
  notifyLoginSuccess: () => {
    ipcRenderer.send("login-success");
  },
  openJanazaWindow: () => {
    ipcRenderer.send("open-janaza");
  },
  openHiflWindow: () => {
    ipcRenderer.send("open-hifl");
  },
  openMahallahWindow: () => {
    ipcRenderer.send("open-Mahallah");
  },
});
