window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.min.js');
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.js');
const ipc = require('electron').ipcRenderer
const insert_round = document.querySelector("#button_insert_round");
const back_main = document.querySelector("#button_back_mainpage");
const dialog_insert_round = document.querySelector("#dialog_insert_round");
const button_insert_sure = document.querySelector("#button_insert_sure");
const button_insert_cancel = document.querySelector("#button_insert_cancel");

let crt_page_num=1;
let crt_page_size=10;

insert_round.addEventListener("click", function()
{
    dialog_insert_round.showModal();
});


button_insert_sure.addEventListener("click", function()
{
    let name = $("#input_round_name").val();
    let num = $("#input_round_maxnum").val();
    let type = $("#input_round_type").val();

    if (name == "")
    {
        return;
    }

    dialog_insert_round.close();
    $("#input_round_name").val('');
    $("#input_round_maxnum").val('');
    $("#input_round_type").val('default');
});


button_insert_cancel.addEventListener("click", function()
{
    dialog_insert_round.close();
});


back_main.addEventListener("click", function()
{
    ipc.send('back_mainpage');
});


//===================================FUNCTION===========================================
function isNull( str )
{
    if ( str == "" ) return true;
    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return re.test(str);
}

function updateTable(name, num, type)
{
}


//================================MAIN=====================================
$("#table_flowControl").bootstrapTable(
    {
        cache:  false,
    
        columns: [{
            field: 'select_item',
            checkbox: true
        },{
            field: 'round_id',
            title: '编号'
        },{
            field: 'round_name',
            title: '奖名' 
        },{
            field: 'round_maxnum',
            title: '总人数'  
        },{
            field: 'round_type',
            title: '抽奖类型'  
        },{
            field: 'round_state',
            title: '状态'
        },{
            field: 'round_modify',
            title: '操作'
        }]
});