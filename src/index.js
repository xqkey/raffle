const start_member = document.querySelector("#button_member_mgr")
const ipc = require('electron').ipcRenderer


start_member.addEventListener("click", function()
{
    ipc.send('start_member_window');
});
