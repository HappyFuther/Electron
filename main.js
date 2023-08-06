const {app, BrowserWindow, Menu, ipcMain, shell, nativeImage, Tray} = require('electron');
const fs = require('fs');
const { debuglog } = require('util')
const { remote } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const iconPath = path.join(__dirname, '/', 'favicon.ico');

let db = new sqlite3.Database('./database.db');
const notifier = require('node-notifier');

// require('electron-reload')(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`)
// });

const menuTemplate = [
  {
    label: 'Print',
    // accelerator: 'CmdOrCtrl+p',
    click: () => {
      mainWindow.webContents.executeJavaScript('defaultPrint()');
    }
  },
  {
    label: 'Print All',
    click: () => {
      mainWindow.webContents.executeJavaScript('allPrint()');
    }
  },
  {
    label: 'Exit',
    // accelerator: 'CmdOrCtrl+x',
    click: () => {
      app.quit();
    }
  },
  {
    label: 'Tools',
    click: () => {
      mainWindow.webContents.openDevTools();
    }
  }
];

// Create the menu from the template
const menu = Menu.buildFromTemplate(menuTemplate);

// Set the application menu
Menu.setApplicationMenu(menu);

// Set Notification Type
const CustomNotyTypes = ['Event', 'Task', 'Reminder'];

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    icon: nativeImage.createFromPath(iconPath),
    title: "Restoration Calendar",
    webPreferences: {
      nodeIntegration: true,
      allowPrinting: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    'auto-hide-menu-bar': true,
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  
  // mainWindow.on('close', function(event) {
  //   // Hide the window instead of closing it
  //   event.preventDefault();
  //   mainWindow.hide();
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Check if the table already exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tbl_noty'", function(err, row) {
    if (err) {
      const { dialog } = electron;
      dialog.showMessageBox({
        type: 'info',
        title: 'Error',
        message: 'Database is invalid.\nThe program will close.',
        buttons: ['OK']
      }, function() {
        app.exit(0);
      });
    } else if (!row) {
      // Create the table schema if it doesn't exist
      db.run('CREATE TABLE tbl_noty (id INTEGER PRIMARY KEY, notytitle TEXT, notytype INTEGER, notydate DATE, notytime TIME, notydesc TEXT)');
    }
  });
  
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.exit(0);
  } else {
    createWindow();
  }

  /*
  let tray = new Tray(iconPath);
  tray.setToolTip('Restoration Calendar');
  let contextMenu = Menu.buildFromTemplate([
    { label: 'Show', type: 'normal', click: () => {
      mainWindow.show();
    }},
    { type: 'separator' },
    { label: 'Quit', type: 'normal', click: () => 
      {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  */

  showNotification();
  setInterval(showNotification, 1000);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', function () {
  db.close();
});

ipcMain.on('registerNotyInfo', (event, data) => {
  if(data.id) {
    db.run('UPDATE tbl_noty SET notytitle=?, notytype=?, notydate=?, notytime=?, notydesc=? WHERE id=?', [data.title, data.type, data.date, data.time, data.desc, data.id], function(err) {
      if (err) {
        console.error(err.message);
      } else {
        db.get("SELECT * FROM tbl_noty WHERE id=" + data.id, function(err, row) {
          if (row) {
            event.sender.send('registerNotyInfo', row);
          }
        });
      }
    });
  }
  else {
    notifier.notify({
      title: "test",
      message: "Contents",
      icon: iconPath
    });
    // Insert a new row into the table
    var newId = 0;
    db.get("SELECT max(id) as maxId FROM tbl_noty", function(err, row) {
      if (row) {
        newId = row.maxId;
      }
      newId++;
      db.run('INSERT INTO tbl_noty (id, notytitle, notytype, notydate, notytime, notydesc) VALUES (?, ?, ?, ?, ?, ?)', [newId, data.title, data.type, data.date, data.time, data.desc], function(err) {
        if (err) {
          console.error(err.message);
        } else {
          var lastId = this.lastID;
          db.get("SELECT * FROM tbl_noty WHERE id=" + lastId, function(err, row) {
            if (row) {
              event.sender.send('registerNotyInfo', row);
            }
          });
        }
      });
    });
  }
});
  
ipcMain.on('removeNotyInfo', (event, data) => {
  db.run('DELETE FROM tbl_noty WHERE id=?', [data.id], (err) => {
    if (err) {
      console.log(err);
    } else {
      event.sender.send('removeNotyInfo', {});
    }
  });
});

ipcMain.on('getNotyList', (event) => {
  var sqlStr = "SELECT * FROM tbl_noty";
  db.all(sqlStr, function(err, rows) {
    if (rows) {
      event.sender.send('getNotyList', rows);
    }
  });
});

ipcMain.on('getOneNotyInfo', (event, data) => {
  db.get("SELECT * FROM tbl_noty WHERE id=" + data.id, function(err, row) {
    if (row) {
      event.sender.send('getOneNotyInfo', row);
    }
  });
});

function showNotification() {
  var cDateObj = new Date();
  cDate = cDateObj.toLocaleDateString('sv-SE');
  cTime = cDateObj.toLocaleTimeString('sv-SE');
  var sqlStr = "SELECT * FROM tbl_noty WHERE strftime('%H:%M:00', notytime)='" + cTime + "' AND (strftime('%Y-%m-%d', notydate)='" + cDate + "')";
  db.all(sqlStr, function(err, rows) {
    if (rows) {
      for (var i=0; i<rows.length; i++) {
        //register as system notification
        notifier.notify({
          title: CustomNotyTypes[rows[i].notytype] + " : " + rows[i].notytitle,
          message: rows[i].notydesc,
          icon: nativeImage.createFromPath(iconPath)
        });
      }
    }
  });
}
