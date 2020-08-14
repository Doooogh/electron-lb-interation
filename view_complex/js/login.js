var serverStatus=true;

function mySubmit(){
	
	var param = {
		host : $('#host').val(),
		port : $('#port').val(),
		nginx : $('#nginx').val(),
		mcu : $('#mcu').val(),
		rmanager : $('#rmanager').val(),
		userName : $('#userName').val(),
		passWord : $('#passWord').val()
		remeberPwd:$("input[id='remeberPwd']:checked")
	}
	window.Electron.saveConf(param);
	// window.Electron.initWin();
	window.Electron.userLogin();
}

$(function(){
	window.Electron.checkServerStatus(function(res){
		if(!res){
			$("#login-btn").attr("disabled", true);
			$("#status-msg").text("系统网络错误，请联系管理员");
		}else{
			$("#login-btn").removeAttr("disabled")
			$("#status-msg").text("");
		}
		// console.log('----------checkServerStatus-----------------:'+res)
	})
	var conf = window.Electron.readConf();
	$('#host').val(conf.host);
	$('#port').val(conf.port);
	$('#nginx').val(conf.nginx);
	$('#rmanager').val(conf.rmanager);
	$('#mcu').val(conf.mcu);
})