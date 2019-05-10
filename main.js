const electron = require('electron');
const url = require('url');
const path = require('path');
var fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

var codeCauldron, mainWindow;

var openedFile = undefined;
var changed = false;

// listen for app to be ready
app.on('ready', function(){
  createCauldron();
  createMenu(mainMenuTemplate);
  // create main window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, 'assets/icons/png/icon.png')
  });
  // load html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true
  }));
  mainWindow.on('close', function (){
    app.quit();
  });
});

// goSave function
function goSave() {
  codeCauldron.webContents.send('file:goSave', 'gosave');
}

function open(filePath) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
     if(err){
         dialog.showErrorBox("Unable to read file", "An error ocurred reading the file :" + err.message);
         return;
     }
     // Check file type
     if (path.extname(filePath) == ".html" || path.extname(filePath) == ".htm") {
       // Send the code
       codeCauldron.webContents.send('file:open', data);
       openedFile = filePath;
       changed = false;
    }
    else {
      dialog.showErrorBox("Incorrect filetype", "File is not HTMl!");
      return;
    }
  });
}

function save(fileName, content) {
  fs.writeFile(fileName, content, (err) => {
      if(err){
          dialog.showErrorBox("Unable to save file", "An error ocurred creating the file "+ err.message);
      }
      openedFile = fileName;
      changed = false;
  });
}

// Catch Window Change (window:codeCauldron || window:editor)

ipcMain.on('window:codeCauldron', function(event, item) {
  mainWindow.hide();
  createMenu(cauldronMenuTemplate);
  codeCauldron.show();
});

// Catch Save (file:save)

ipcMain.on('file:save', function(event, item) {
  if(openedFile != undefined) {
    save(openedFile, item);
  }
});

// Catch Change (file:changed)

ipcMain.on('file:changed', function(event, item) {
  changed = item;
});

// Create menu templates
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  },
  {
   label: 'View',
   submenu: [
      {
         role: 'resetzoom'
      },
      {
         role: 'zoomin'
      },
      {
         role: 'zoomout'
      },
      {
         type: 'separator'
      },
      {
         role: 'togglefullscreen'
      }
   ]
  },
  {
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: 'CmdOrCtrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        label: 'Exam Mode',
        accelerator: 'CmdOrCtrl+Shift+E',
        click() {
          dialog.showMessageBox({type:"info", buttons:["OK"], title:"Feature unavailable", message:"Feature unavailable in this version."});
        }
      },
      {
        role: 'reload'
      }
    ]
  }
];
const cauldronMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click(){
          if (changed == true) {
            dialog.showMessageBox({type:"question", buttons:["Cancel", "Save and Continue", "Ignore and Continue"], title:"Unsaved file", message:"You did not save the file"}, function(response) {
              if (response == 0) {
                return;
              }
              else if (response == 1) {
                goSave();
                dialog.showOpenDialog({
                    title: "Select a file",
                    properties: ["openFile", 'multiSelections']
                }, (filePaths) => {
                    if(filePaths === undefined){
                        dialog.showErrorBox("No file selected!", "No file selected! Please select a file!");
                        return;
                    }
                    else {
                      var i = 0;
                      for(i = 0; i < filePaths.length; i++) {
                        open(filePaths[i]);
                      }
                    }
                });
              }
              else {
                dialog.showOpenDialog({
                    title: "Select a file",
                    properties: ["openFile", 'multiSelections']
                }, (filePaths) => {
                    if(filePaths === undefined){
                        dialog.showErrorBox("No file selected!", "No file selected! Please select a file!");
                        return;
                    }
                    else {
                      var i = 0;
                      for(i = 0; i < filePaths.length; i++) {
                        open(filePaths[i]);
                      }
                    }
                });
              }
            });
          }
          else {
            dialog.showOpenDialog({
                title: "Select a file",
                properties: ["openFile", 'multiSelections']
            }, (filePaths) => {
                if(filePaths === undefined){
                    dialog.showErrorBox("No file selected!", "No file selected! Please select a file!");
                    return;
                }
                else {
                  var i = 0;
                  for(i = 0; i < filePaths.length; i++) {
                    open(filePaths[i]);
                  }
                }
            });
          }
        }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click(){
          if (openedFile == undefined) {
            dialog.showSaveDialog((fileName) => {
                if (fileName === undefined){
                    dialog.showErrorBox("An error occured", "Unable to save file");
                    return;
                }
                openedFile = fileName;
                goSave();
            });
          }
          else {
            goSave();
          }
        }
      },
      {
        label: 'Save as',
        accelerator: 'CmdOrCtrl+Shift+S',
        click(){
          dialog.showSaveDialog((fileName) => {
            if (fileName === undefined){
              dialog.showErrorBox("An error occured", "Unable to save file");
              return;
            }
            openedFile = fileName;
            goSave();
          });
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click(){
          if (changed == true) {
            dialog.showMessageBox({type:"question", buttons:["Cancel", "Save and Quit", "Ignore and Quit"], title:"Unsaved file", message:"You did not save the file"}, function(response) {
              if (response == 0) {
                return;
              }
              else if (response == 1) {
                goSave();
                codeCauldron.hide();
                mainWindow.show();
                createMenu(mainMenuTemplate);
              }
              else {
                codeCauldron.hide();
                mainWindow.show();
                createMenu(mainMenuTemplate);
              }
            });
          }
          else {
            codeCauldron.hide();
            mainWindow.show();
            createMenu(mainMenuTemplate);
          }
        }
      }
    ]
  },
  {
   label: 'View',
   submenu: [
      {
         role: 'resetzoom'
      },
      {
         role: 'zoomin'
      },
      {
         role: 'zoomout'
      },
      {
         type: 'separator'
      },
      {
         role: 'togglefullscreen'
      }
   ]
  },
  {
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: 'CmdOrCtrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        label: 'Exam Mode',
        accelerator: 'CmdOrCtrl+Shift+E',
        click() {
          dialog.showMessageBox({type:"info", buttons:["OK"], title:"Feature unavailable", message:"Feature unavailable in this version."});
        }
      },
      {
        role: 'reload'
      }
    ]
  }
];

function createCauldron() {
  // create new window
  codeCauldron = new BrowserWindow({
    width: 1281,
    height: 800,
    icon: path.join(__dirname, 'assets/icons/png/icon.png'),
    show: false
  });
  // load html file
  codeCauldron.loadURL(url.format({
    pathname: path.join(__dirname, 'codeCauldron.html'),
    protocol: 'file',
    slashes: true
  }));
  // Quit app when closed
  codeCauldron.on('close', function (){
    mainWindow.show();
    createMenu(mainMenuTemplate);
    openedFile = undefined;
    changed = false;
    createCauldron();
  });
}

function createMenu(temp){
    var menu = Menu.buildFromTemplate(temp);
   // If mac, add empty object to menuitem
   if(process.platform == 'darwin'){
     menu.unshift({
       label: ''
     });
   }
    Menu.setApplicationMenu(menu);
}
