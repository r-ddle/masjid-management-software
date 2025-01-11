const { contextBridge, ipcRenderer } = require("electron");
const {
  findUser,
  fetchMembers,
  updateMemberStatusInDb,
  updateMember,
  deleteMember,
} = require("./db");

contextBridge.exposeInMainWorld("api", {
  login: async (username, password) => {
    return await findUser(username, password);
  },
  fetchMembers: async (location) => {
    return await fetchMembers(location);
  },
  updateMemberStatusInDb: (memberId, month, status, location) =>
    updateMemberStatusInDb(memberId, month, status, location),
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
  createAdmin: (username, password) => {
    return ipcRenderer.invoke("create-admin", username, password);
  },
  addMember: (memberData) => {
    return ipcRenderer.invoke("add-member", memberData);
  },
  updateMember: (memberData) => ipcRenderer.invoke("update-member", memberData),
  deleteMember: (id) => {
    console.log("Invoking deleteMember with ID:", id);
    return ipcRenderer.invoke("delete-member", id);
  },
});
