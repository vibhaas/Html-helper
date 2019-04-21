const electron = require('electron');
const url = require('url');
const path = require('path');
var fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

let mainWindow;

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
  //Quit app when closed
  mainWindow.on('closed', function (){
    app.quit();
  });
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

function open(filePath) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
     if(err){
         console.log("An error ocurred reading the file :" + err.message);
         return;
     }

     // Change how to handle the file content
     console.log("The file content is : " + data);
  });
}

function save(fileName) {
  var content = ""; // Get this somehow [selectedTab.getContent()]
  fs.writeFile(fileName, content, (err) => {
      if(err){
          console.log("An error ocurred creating the file "+ err.message);
      }

      console.log("The file has been succesfully saved");
  });
}

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click(){
          console.log('Feature unavailable in this version.');
        }
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click(){
          dialog.showOpenDialog({
              title: "Select a file",
              properties: ["openFile", 'multiSelections']
          }, (filePaths) => {
              if(filePaths === undefined){
                  console.log("No file selected!");
                  return;
              }
              else {
                console.log(filePaths);
                var i = 0;
                for(i = 0; i < filePaths.length; i++) {
                  open(filePaths[i]);
                }
              }
          });
        }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click(){
          dialog.showSaveDialog((fileName) => {
              if (fileName === undefined){
                  console.log("An error occured");
                  return;
              }
              // Access the save() function

          });
        }
      },
      {
        label: 'Save as',
        accelerator: 'CmdOrCtrl+Shift+S',
        click(){
          console.log('Feature unavailable in this version.');
        }
      },
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
          console.log('Feature unavailable in this version.');
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
