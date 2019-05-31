const start_raffle = document.querySelector("#button_raffle")
const start_member = document.querySelector("#button_member_mgr")
const start_flowControl = document.querySelector("#button_flowControl")
const ipc = require('electron').ipcRenderer


start_raffle.addEventListener("click", function()
{
    ipc.send('start_raffle_window');
});


start_member.addEventListener("click", function()
{
    ipc.send('start_member_window');
});


start_flowControl.addEventListener("click", function()
{
    ipc.send('start_flowControl_window');
});
