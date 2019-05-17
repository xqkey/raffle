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

ipc.on('back_mainpage', function () 
{
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});

ipc.on('start_flowControl_window', function () 
{
  mainWindow.loadURL(`file://${__dirname}/flowControl.html`);
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

ipc.on('batch_delete_member', function (event, values) 
{
  var values_length = values.length;
  var member_length = member_array.length;

  var next_pos = values[0].member_idx;
  var z = 0;
  for (var i = values[0].member_idx; i < member_length; i++)
  {
    for (var j = next_pos; j < member_length; j++)
    {
      if (z < values_length && values[z].member_idx == j)
      {
        z++;
      }
      else
      {
        next_pos = j;
        break;
      }
    }

    member_array[i] = member_array[next_pos];
    next_pos++;
    if (next_pos < next_pos)
    {
      break;
    }
  }

  member_array.length -= values_length;
  event.returnValue = true;
});


ipc.on('clear_all_member', function (event) 
{
  member_array.length = 0;
  event.returnValue = true;
});


ipc.on('update_single_member', function (event, index, value) 
{
  member_array[index] = value;
  event.returnValue = true;
});


ipc.on('open_output_directory_dialog', function (event) 
{
  let member_length = member_array.length;
  if (member_length == 0)
  {
    return;
  }

  let electron = require('electron');
  let dialog = electron.dialog;
  dialog.showOpenDialog(
    {
      properties: ['openDirectory']
    },
    function (files) 
    {
      console.log('[C_DEBUG] catch file:' + files);
      if (typeof(files) == "undefined")
      {
        console.log('[C_DEBUG] undefined file:' + files);
        return;
      }

      let path = files[0] + '\\raffle_dft_data.csv';
      console.log('[C_DEBUG] start output file:' + path);
      let fs = require('fs');
      if (fs.existsSync(path))
      {
        fs.unlinkSync(path);
      }
      
      let file_buff = '';
      for (let i = 0; i < member_length; i++)
      {
        file_buff += member_array[i];
        file_buff += "\n";
      }
      
      fs.writeFile(
        path,
        file_buff,
        function(err) {
          if (err)
          {
            event.sender.send('show_output_member_processbar', 100, false);
            return console.error(err);
          }

          event.sender.send('show_output_member_processbar', 100, true);
          console.log("[C_DEBUG] output file finish:" + path);
        }
      );

      event.sender.send('show_output_member_processbar', 0, true);
    });
});


ipc.on('open_input_directory_dialog', function (event) 
{
  let electron = require('electron');
  let dialog = electron.dialog;
  dialog.showOpenDialog(
    {
      filters: [
        { name: 'Custom File Type', extensions: ['csv'] }
      ],
      properties: ['openFile']
    },
    function (file) 
    {
      console.log('[C_DEBUG] get file:' + file);
      if (typeof(file) == "undefined")
      {
        console.log('[C_DEBUG] undefined file:' + file);
        return;
      }

      let fs = require('fs');
      let file_buff = fs.readFileSync(file.toString());
      let file_buff_array = file_buff.toString().split("\n");

      let length = file_buff_array.length;
      if (length == 0)
      {
        return;
      }

      length--;
      for (let i = 0; i < length; i++)
      {
        if(file_buff_array[i] == "" || file_buff_array[i] == "\r")
        {
          continue;
        }

        member_array.push(file_buff_array[i]);
      }

      event.sender.send('input_member_update_table');
    });
});