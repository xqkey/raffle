window.$ = window.jQuery = require('../node_modules/jquery/dist/jquery.min.js');
require('../node_modules/bootstrap/dist/js/bootstrap.min.js');
require('../node_modules/bootstrap-table/dist/bootstrap-table.min.js');
const ipc = require('electron').ipcRenderer
const insert_round = document.querySelector("#button_insert_round");
const delete_round = document.querySelector("#button_delete_round");
const clear_round = document.querySelector("#button_clear_round");
const back_main = document.querySelector("#button_back_mainpage");
const dialog_insert_round = document.querySelector("#dialog_insert_round");
const dialog_clear_round = document.querySelector("#dialog_clear_round");
const button_insert_sure = document.querySelector("#button_insert_sure");
const button_insert_cancel = document.querySelector("#button_insert_cancel");
const clear_sure = document.querySelector("#button_clear_sure");
const clear_cancel = document.querySelector("#button_clear_cancel");

let crt_page_num=1;
let crt_page_size=10;


insert_round.addEventListener("click", function()
{
    dialog_insert_round.showModal();
});


delete_round.addEventListener("click", function()
{
    let select_array = $("#table_flowControl").bootstrapTable('getSelections');

    let arry_length = select_array.length; 
    if (arry_length < 1)
    {
        return;
    }

    let delete_arry = new Array();
    for (let i = 0; i < arry_length; i++)
    {
        delete_arry.push(select_array.round_id);
    }

    ipc.sendSync("batch_delete_round", delete_arry);
    updateTable("", 0, "default", false);
});


button_insert_sure.addEventListener("click", function()
{
    let name = $("#input_round_name").val();
    let prize_name = $("#input_round_prize").val();
    let num = $("#input_round_num").val();
    let once_num = $("#input_round_once_num").val();

    if (name != "" && prize_name != "" && num != 0 && once_num != 0)
    {
        if (once_num <= num)
        {
            let total_remain_num = ipc.sendSync("get_total_remain_num");
            if (num <= total_remain_num)
            {
                updateTable(name, prize_name, num, once_num, true);
            }
            else
            {
                alert("已经没有人可以参与抽奖了");
            }
        }
        else
        {
            alert("单次人数需小于总人数");
        }
    }
    else
    {
        alert("输入值存在空值");
    }

    dialog_insert_round.close();
    $("#input_round_name").val('');
    $("#input_round_prize").val('');
    $("#input_round_num").val('');
    $("#input_round_once_num").val('');
});


button_insert_cancel.addEventListener("click", function()
{
    dialog_insert_round.close();
    $("#input_round_name").val('');
    $("#input_round_prize").val('');
    $("#input_round_num").val('');
    $("#input_round_once_num").val('');
});


clear_round.addEventListener("click", function()
{
    dialog_clear_round.showModal();
});


clear_sure.addEventListener("click", function()
{
    ipc.sendSync("clear_all_round");
    crt_page_num = 1;
    updateTable("", 0, "default", false);
    dialog_clear_round.close();
});


clear_cancel.addEventListener("click", function()
{
    dialog_clear_round.close();
});


back_main.addEventListener("click", function()
{
    ipc.send('back_mainpage');
});


//===================================FUNCTION===========================================
function updateTable(name, prize_name, num, once_num, need_add)
{
  var return_arry = ipc.sendSync("insert_round_info", name, prize_name, num, once_num, crt_page_size, crt_page_num, need_add);

  var table = $("#table_flowControl");
  table.bootstrapTable('removeAll');
  var arry_length = return_arry.length;
  for (var i = 1; i < arry_length; i++)
  {
      table.bootstrapTable('insertRow',
          {
              index:(i - 1),
              row:{
                  round_id:(i - 1) + (crt_page_num - 1) * crt_page_size,
                  round_name:return_arry[i].name,
                  round_prize:return_arry[i].prize_name,
                  round_num:return_arry[i].num,
                  round_once_num:return_arry[i].once_num,
                  round_state:return_arry[i].state
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
          updateTable("", 0, "default", false);
      }
  });

  $("#li_next").click(function()
  {
      var tmp_num = crt_page_num + 1;
      if (tmp_num <= ($("#ul_pagination li").length - 2))
      {
          crt_page_num = tmp_num;
          updateTable("", 0, "default", false);
      }
  });
}


function operateFormatter(value, row, index) 
{
    return ["<button type='button' class='btn btn-danger' \
    onclick='flowControl_script.deleteRow("+row.round_id+")'>删除</button>"].join('');
}


module.exports = {
    deleteRow : (idx) =>
    {
        let delete_arry = new Array();
        delete_arry[0] = idx;

        ipc.sendSync("batch_delete_round", delete_arry);
        updateTable("", 0, "default", false);
    }
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
        field: 'round_num',
        title: '总人数'
    },{
        field: 'round_once_num',
        title: '每次抽人数'
    },{
        field: 'round_prize',
        title: '奖品'
    },{
        field: 'round_state',
        title: '已经抽奖人数'
    },{
        field: 'round_modify',
        title: '操作',
        formatter: operateFormatter
    }]
});


updateTable("", 0, "default", false);