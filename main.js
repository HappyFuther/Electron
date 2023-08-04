const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron')
const fs = require('fs')
const { debuglog } = require('util')
const { remote } = require('electron');

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
  }
];
/*
const menuTemplate = [{
    label: 'Calendar', 
    submenu: [
      {
        label: 'Show Calendar',
        click: () => {
          mainWindow.loadFile('index.html');
        }
      },
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
      }
    ]
  },
  {
    label: 'About',
    click: () => {
      mainWindow.loadFile('about.html');
      // createAboutWindow();
    }
  }
]*/

// Create the menu from the template
const menu = Menu.buildFromTemplate(menuTemplate)

// Set the application menu
Menu.setApplicationMenu(menu)

let mainWindow;
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
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

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

let aboutWin;
function createAboutWindow () {
  // Create the browser window.
  const aboutWin = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    resizable: false
  });
  aboutWin.loadFile('about.html');
  aboutWin.on('closed', () => {
    // aboutWin = null;
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

ipcMain.on('exportSelectionToPDF', (event) => {
  let window = BrowserWindow.fromWebContents(event.sender);
  window.webContents.printToPDF({ 
    silent: false,
    marginType: 1,
    landscape: true,
    pagesPerSheet: 1,
    collate: true,
    copies: 1,
    printSelectionOnly: false,
    printBackground: true,
    pageSize: {
      height: 15,
      width: 25
    }
  }).then((data) => {
    console.log(data);
      fs.writeFile('./print.pdf', data, (error) => {
        if(error) console.log(error);
      })
      // Use the data however you like :)
  });
});

function closeAboutWin() {
  aboutWin.close();
}

