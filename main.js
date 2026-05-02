const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
let tray;

const notesPath = path.join(app.getPath('userData'), 'notes.json');

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  win.on('close', (e) => {
    e.preventDefault();
    win.hide();
  });
}

function readNotes() {
  if (!fs.existsSync(notesPath)) return [];
  return JSON.parse(fs.readFileSync(notesPath));
}

function writeNotes(notes) {
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

app.whenReady().then(() => {
  createWindow();

  // MENU
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Note', click: () => win.webContents.send('menu-new') },
        { label: 'Save', click: () => win.webContents.send('menu-save') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // TRAY
  tray = new Tray(path.join(__dirname, 'tray-icon.png'));
  tray.setToolTip('Quick Note');

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() }
  ]));

  tray.on('double-click', () => {
    win.isVisible() ? win.hide() : win.show();
  });
});


// IPC
ipcMain.handle('get-notes', () => {
  return readNotes();
});

ipcMain.handle('save-note-json', (e, note) => {
  let notes = readNotes();

  const index = notes.findIndex(n => n.id === note.id);

  if (index === -1) {
    notes.push(note);
  } else {
    notes[index] = note;
  }

  writeNotes(notes);
});

ipcMain.handle('delete-note-json', (e, id) => {
  let notes = readNotes();
  notes = notes.filter(n => n.id !== id);
  writeNotes(notes);
});