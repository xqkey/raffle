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

    if (name != "" || num != 0)
    {
      updateTable(name, num, type, true);
    }

    dialog_insert_round.close();
    $("#input_round_name").val('');
    $("#input_round_maxnum").val('');
    $("#input_round_type").val('default');
});


button_insert_cancel.addEventListener("click", function()
{
    dialog_insert_round.close();
    $("#input_round_name").val('');
    $("#input_round_maxnum").val('');
    $("#input_round_type").val('default');
});


back_main.addEventListener("click", function()
{
    ipc.send('back_mainpage');
});


//===================================FUNCTION===========================================
function updateTable(name, num, type, need_add)
{
  var return_arry = ipc.sendSync("insert_round_info", name, num, type, crt_page_size, crt_page_num, need_add);

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
                  round_num:return_arry[i].num,
                  round_type:return_arry[i].type,
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
