window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.min.js');
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');
const insert_member = document.querySelector("#button_insert_member");
const dialog_insert_member = document.querySelector("#dialog_insert_member");
const name_insert = document.querySelector("#button_name_insert");
const name_cancel = document.querySelector("#button_name_cancel");
const ipc = require('electron').ipcRenderer

insert_member.addEventListener("click", function()
{
    dialog_insert_member.showModal();
});

name_insert.addEventListener("click", function()
{
    var input_value = document.getElementById("input_member_name").value;
    if (input_value != "")
    {
        var return_arry = ipc.sendSync("insert_member", input_value, 10, 1);
        var table = document.getElementById("table_member");

        //clear table
        for(var i = table.rows.length - 1; i > 0; i--)
        { 
            table.deleteRow(i); 
        } 

        //add data
        for (var i = 0; i < return_arry.length; i++)
        {
            var tr = table.insertRow();
            var td1 = tr.insertCell();
            var td2 = tr.insertCell();

            td1.innerHTML = i;
            td2.innerHTML = return_arry[i];
        }
    }

    dialog_insert_member.close();
    document.getElementById("input_member_name").value = "";
});

name_cancel.addEventListener("click", function()
{
    dialog_insert_member.close();
    document.getElementById("input_member_name").value = "";
});