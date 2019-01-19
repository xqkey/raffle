window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.min.js');
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.js');
const insert_member = document.querySelector("#button_insert_member");
const back_main = document.querySelector("#button_back_mainpage");
const dialog_insert_member = document.querySelector("#dialog_insert_member");
const name_insert = document.querySelector("#button_name_insert");
const name_cancel = document.querySelector("#button_name_cancel");
const ipc = require('electron').ipcRenderer

let crt_page_num=1;
let dft_page_size=10;

insert_member.addEventListener("click", function()
{
    dialog_insert_member.showModal();
});

name_insert.addEventListener("click", function()
{
    var input_value = document.getElementById("input_member_name").value;
    if (input_value != "")
    {
        updateTable(input_value);
    }

    dialog_insert_member.close();
    document.getElementById("input_member_name").value = "";
});

name_cancel.addEventListener("click", function()
{
    dialog_insert_member.close();
    document.getElementById("input_member_name").value = "";
});

back_main.addEventListener("click", function()
{
    ipc.send("member_back_mainpage");
});


function updateTable(input_value)
{
    var return_arry = ipc.sendSync("insert_query_member", input_value, dft_page_size, crt_page_num);

    var table = $("#table_member");
    table.bootstrapTable('removeAll');
    var arry_length = return_arry.length;
    for (var i = 1; i < arry_length; i++)
    {
        table.bootstrapTable('insertRow',
            {
                index:(i - 1),
                row:{
                    member_idx:(i - 1) + (crt_page_num - 1) * dft_page_size,
                    member_name:return_arry[i]
                }
            } 
        );
    }

    var lis = $("#ul_pagination");
    lis.empty();

    var max_page_num = return_arry[0];
    var lis_html = "<li class=\"page-item\" id=\"li_pre\"><a class=\"page-link\" href=\"#\">上一页</a></li>";
    for (var i = 1; i <= max_page_num; i++)
    {
        if (i == crt_page_num)
        {
            lis_html += "<li class=\"page-item active\" id=\"li_";
        }
        else
        {
            lis_html += "<li class=\"page-item\" id=\"li_";
        }
        lis_html += i;
        lis_html += "\"><a class=\"page-link\" href=\"#\">";
        lis_html += i;
        lis_html += "</a></li>";
    }
    lis_html += "<li class=\"page-item\" id=\"li_next\"><a class=\"page-link\" href=\"#\">下一页</a></li>";

    lis.append(lis_html);

    $("#li_pre").click(function()
    {
        var tmp_num = crt_page_num - 1;
        if (tmp_num >= 1)
        {
            crt_page_num = tmp_num;
            updateTable("");
        }
    });

    $("#li_next").click(function()
    {
        var tmp_num = crt_page_num + 1;
        if (tmp_num <= ($("#ul_pagination li").length - 2))
        {
            crt_page_num = tmp_num;
            updateTable("");
        }
    });
}

//========================================================
$("#table_member").bootstrapTable(
{
    cache:  false,
    clickToSelect: true,
    
    columns: [{
        field: 'select_item',
        checkbox: true
    },{
        field: 'member_idx',
        title: '编号'
    }, {
        field: 'member_name',
        title: '姓名'
    }]
});

updateTable("");