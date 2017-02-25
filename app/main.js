const {app, BrowserWindow} = require('electron');

require('electron-debug')({showDevTools: true});


let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});


app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1700, height: 1100});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/window.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
