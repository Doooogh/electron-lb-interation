var data;
$(function (){

    $(".cus-self").hide();
  $("#sysconfig-select").change(function (){
      let confVal=$(this).val();
      if(confVal==0){
          $(".cus-self").show();
      }else{
          $(".cus-self").hide();
      }
  });


    $("#confirm").click(function() {
        let confTypeVal=$("#sysconfig-select").val();
        if(confTypeVal==0){
            var result=validate();
            console.log(result)
            if(!result){
                return ;
            }
            data=getCusConfigData();
        }else{
            //从服务器上拉来下配置信息
            data=getConfigDataFromServer(confTypeVal);
        }
        writeConfigData();
    });

});

function writeConfigData(){
    //写入配置文件
    console.log(JSON.stringify(data));
    ipcRenderer.send('sendSysConfigData',data);
}

//从服务器获取配置信息
function getConfigDataFromServer(confTypeVal){
    //根据 confTypeVal 获取配置信息
    return {};
}

//获取自定义的配置信息
function getCusConfigData(){
    let host=$("#hostaddr").val();
    let port=$("#port").val();
    let nginx=$("#nginx").val();
    let mcu=$("#mcu").val();
    let rmanager=$("#rmanager").val();
    let cusData={
        host:host,
        port:port,
        nginx:nginx,
        mcu:mcu,
        rmanager:rmanager
    }
    return cusData;
}

function validate(){
    $("#form").validate({
        errorClass:"cus-error",
        rules: {
            hostaddr: "required",
            port: "required",
            nginx: "required",
            mcu: "required",
            rmanager: "required",
        },
        messages: {
            hostaddr: "请输入host地址",
            port: "请输port",
            nginx: "请输入nginx",
            mcu: "请输入mcu",
            rmanager: "请输入rmanager",
        },
        submitHandler:function(form){
            form.submit();
        },

    });
    return  $('#form').valid();
}