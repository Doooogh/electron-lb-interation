const cusHttp=nodeRequire('../../res/js/main-js/cus-http.js')
const loger = nodeRequire('../../res/js/loger.js')
const cusConst=nodeRequire('../../res/js/main-js/const.js')
const cusSystem=nodeRequire('../../res/js/main-js/cus-system.js')
var data;
var siteInfoList=new Array();
$(function (){
    loger.info("----------------------------data site info--------------");
    getSiteInfo();
    //选择配置时 进行 设置input 中的信息
  $("#sysconfig-select").change(function (){
      let confVal=$(this).val();
      console.log(confVal+"----------------------------confVal")
      if(confVal=="0"){
          $(".cus-self input").val("");
      }else{
          let conf=siteInfoList[confVal-1];
         $("#hostaddr").val(conf.host);
         $("#port").val(conf.port);
         $("#nginx").val(conf.nginxUrl);
         $("#mcu").val(conf.mcuUrl);
         $("#rmanager").val(conf.rmanagerUrl);
      }
  });

    //确定
    $("#confirm").click(function() {
        let confTypeVal=$("#sysconfig-select").val();
        var result=validate();
        if(result){
                data=getCusConfigData();
        }else{
            return ;
        }
        loger.info("data is-----------------------");
        loger.info(JSON.stringify(data));
        writeConfigData();
    });

});

//从服务器获取配置文件信息
function getSiteInfo(){
    loger.info("----------------------------data site info--------------");
    cusHttp.httpRetryCallback(config.SITE_CONFIG_INFO_ADDR,(data)=>{
        loger.info("----------------------------data site info--------------");
        loger.info(JSON.stringify(data));
        siteInfoList=data;
        $("#sysconfig-select").html("");
        var html="";
        html+=('<option value="">请选择配置</option>');
        $.each(siteInfoList,function (index,siteData){
            html+=('<option value="'+ parseInt(index+1)+'">'+siteData.name+'</option>');
        });
        html+=('<option value="0">自定义</option>');
        $("#sysconfig-select").append(html);
    });
}

function writeConfigData(){
    //写入配置文件

    let readConfData = cusConst.confDefaultData;
    readConfData.host=data.host;
    readConfData.port=data.port;
    readConfData.nginx=data.nginx;
    readConfData.mcu=data.mcu;
    readConfData.rmanager=data.rmanager;

    loger.info("write config file-----------------------");
    loger.info(JSON.stringify(readConfData));
    cusSystem.createConf(()=>{
        currentWindow.close();
    },readConfData);
    // ipcRenderer.send('sendSysConfigData',readConfData);
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
            sysconfigSelect:'required',
            hostaddr: "required",
            port: "required",
            nginx: "required",
            mcu: "required",
            rmanager: "required",
        },
        messages: {
            sysconfigSelect:'请选择配置',
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