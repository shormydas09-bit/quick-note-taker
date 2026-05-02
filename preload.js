const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note-json', note),
  deleteNote: (id) => ipcRenderer.invoke('delete-note-json', id),

  onMenuAction: (channel, func) => {
    ipcRenderer.on(channel, func);
  }

});