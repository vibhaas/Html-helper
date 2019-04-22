const electron = require('electron');
const url = require('url');
const path = require('path');
var fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

let mainWindow;

var openedFile = undefined;
var changed = false;

// listen for app to be ready
app.on('ready', function(){
  // create new window
  mainWindow = new BrowserWindow({
    width: 1281,
    height: 800,
    icon: path.join(__dirname, 'assets/icons/png/icon.png')
  });
  // load html file
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', function (){
    app.quit();
  });
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// goSave function
function goSave() {
  mainWindow.webContents.send('file:goSave', 'gosave');
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
       mainWindow.webContents.send('file:open', data);
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

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click(){
          dialog.showMessageBox({type:"info", buttons:["OK"], title:"Feature unavailable", message:"Feature unavailable in this version."});
        }
      },
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
                app.quit();
              }
              else {
                app.quit();
              }
            });
          }
          else {
            app.quit();
          }
        }
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

// If mac, add empty object to menuitem
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({
    label: ''
  });
}
