const { app, BrowserWindow } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let member_array = new Array();

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();
  //mainWindow.setMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


/*********************** Self Logic ******************************/
const ipc = require('electron').ipcMain;

ipc.on('start_member_window', function () 
{
  mainWindow.loadURL(`file://${__dirname}/member.html`);
});

ipc.on('member_back_mainpage', function () 
{
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});

ipc.on('insert_query_member', function (event, name, num, page) 
{
  if (name != "")
  {
    member_array.push(name);
    console.log('[C_DEBUG] main array add:' + name);
  }

  var send_arry = new Array();
  var start_pos = (page - 1) * num;
  var end_pos = start_pos + num;
  var member_length = member_array.length;

  if (member_length % num == 0)
  {
    send_arry.push(member_length / num);
  }
  else
  {
    send_arry.push(member_length / num + 1); 
  }
  
  for (var i = start_pos; i < end_pos; i++)
  {
    if (i < member_length)
    {
      console.log('[C_DEBUG] send array add:' + member_array[i]);
      send_arry.push(member_array[i]);
    }
    else
    {
      break;
    }
  }
  
  event.returnValue = send_arry; 
});