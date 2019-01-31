window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.min.js');
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.js');
const insert_member = document.querySelector("#button_insert_member");
const delete_member = document.querySelector("#button_delete_member");
const clear_member = document.querySelector("#button_clear_member");
const input_member = document.querySelector("#button_input_member");
const output_member = document.querySelector("#button_output_member");
const back_main = document.querySelector("#button_back_mainpage");
const dialog_insert_member = document.querySelector("#dialog_insert_member");
const name_insert = document.querySelector("#button_name_insert");
const name_cancel = document.querySelector("#button_name_cancel");
const dialog_clear_member = document.querySelector("#dialog_clear_member");
const clear_sure = document.querySelector("#button_clear_sure");
const clear_cancel = document.querySelector("#button_clear_cancel");
const dialog_output_member = document.querySelector("#dialog_output_member");
const processbar_sure = document.querySelector("#button_processbar_sure");
const ipc = require('electron').ipcRenderer

let crt_page_num=1;
let crt_page_size=10;

insert_member.addEventListener("click", function()
{
    dialog_insert_member.showModal();
});


delete_member.addEventListener("click", function()
{
    var select_array = $("#table_member").bootstrapTable('getSelections');

    var arry_length = select_array.length; 
    if (arry_length < 1 )
    {
        return;
    }

    ipc.sendSync("batch_delete_member", select_array);
    updateTable("");
});


clear_member.addEventListener("click", function()
{
    dialog_clear_member.showModal();
});


input_member.addEventListener("click", function()
{
    ipc.send('open_input_directory_dialog');
});


output_member.addEventListener("click", function()
{
    ipc.send('open_output_directory_dialog');
});


back_main.addEventListener("click", function()
{
    ipc.send("back_mainpage");
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


clear_sure.addEventListener("click", function()
{
    ipc.sendSync("clear_all_member");
    crt_page_num = 1;
    updateTable("");
    dialog_clear_member.close();
});


clear_cancel.addEventListener("click", function()
{
    dialog_clear_member.close();
});


processbar_sure.addEventListener("click", function()
{
    dialog_output_member.close();
    $("#progress_bar_member").removeClass("progress-bar bg-danger");
    $("#progress_bar_member").addClass("progress-bar progress-bar-striped progress-bar-animated");
    $("#button_processbar_sure").hide();
    $("#p_processbar_content").text("正在导出，请耐心等待...");
});


ipc.on('show_output_member_processbar', function(event, percent, is_error)
{
    if (!is_error)
    {
        $("#progress_bar_member").removeClass("progress-bar progress-bar-striped progress-bar-animated");
        $("#progress_bar_member").addClass("progress-bar bg-danger");
        $("#progress_bar_member").css('width', percent + '%');
        $("#button_processbar_sure").show();
        $("#p_processbar_content").text("导出失败");
        return;
    }

    if (percent == 0)
    {
        $("#button_processbar_sure").hide();
        $("#progress_bar_member").css('width', percent + '%');
        dialog_output_member.showModal();
    }

    if (percent == 100)
    {
        $("#p_processbar_content").text("导出成功");
        $("#button_processbar_sure").show();
    }

    $("#progress_bar_member").css('width', percent + '%');
});


ipc.on('input_member_update_table', function(event)
{
    updateTable("");
});


//===================================FUNCTION===========================================
function updateTable(input_value)
{
    var return_arry = ipc.sendSync("insert_query_member", input_value, crt_page_size, crt_page_num);

    var table = $("#table_member");
    table.bootstrapTable('removeAll');
    var arry_length = return_arry.length;
    for (var i = 1; i < arry_length; i++)
    {
        table.bootstrapTable('insertRow',
            {
                index:(i - 1),
                row:{
                    member_idx:(i - 1) + (crt_page_num - 1) * crt_page_size,
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

function operateFormatter(value, row, index) 
{
    return ["<button type='button' class='btn btn-danger' \
    onclick='member_script.deleteRow("+row.member_idx+", \""+row.member_name+"\")'>删除</button>"].join('');
}

module.exports = {
    deleteRow : (idx, name) =>
    {
        let memeber = new Object();
        memeber.member_idx = idx;
        memeber.member_name = name;

        let delete_arry = new Array();
        delete_arry[0] = memeber;

        ipc.sendSync("batch_delete_member", delete_arry);
        updateTable("");
    }
}     

//================================MAIN=====================================
$("#table_member").bootstrapTable(
{
    cache:  false,

    columns: [{
        field: 'select_item',
        checkbox: true
    },{
        field: 'member_idx',
        title: '编号'
    },{
        field: 'member_name',
        title: '姓名'  
    },{
        field: 'member_modify',
        title: '操作',
        formatter: operateFormatter
    }],

    onClickCell: function(field, value, row, $element) 
    {
        if (field != 'member_name') 
        {
            return;
        }

        $element.attr('contenteditable', true);
        $element.off("blur").on("blur", function() 
        {
            var index = $element.parent().data('index');
            var tdValue = $element.html();

            if (tdValue == "")
            {
                console.log("send " + value + " " + tdValue);
                $element.html(value);
                return;
            }
            
            console.log("send " + value + " " + tdValue);
            ipc.sendSync("update_single_member", index + (crt_page_num - 1) * crt_page_size, tdValue);
            value = tdValue;
        })
    }
});

updateTable("");