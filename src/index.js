const start_raffle = document.querySelector("#button_raffle")
const start_member = document.querySelector("#button_member_mgr")
const start_flowControl = document.querySelector("#button_flowControl")
const ipc = require('electron').ipcRenderer


start_raffle.addEventListener("click", function()
{
    let flowNum = ipc.sendSync('get_round_array_num');
    if (flowNum > 0)
    {
        ipc.sendSync('start_raffle_window');
    }
    else
    {
        alert('请先设置抽奖流程');
    }
});


start_member.addEventListener("click", function()
{
    ipc.send('start_member_window');
});


start_flowControl.addEventListener("click", function()
{
    ipc.send('start_flowControl_window');
});
