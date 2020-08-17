var serverStatus=true;

function mySubmit(){
	
	
	var isRemember=false;
	var remeberPwd=$("input[name='isRemember']:checked")
	if(remeberPwd.length==1){
		console.log("login is remember"+"_____________________________true")
		isRemember=true;
	}
	var param = {
		host : $('#host').val(),
		port : $('#port').val(),
		nginx : $('#nginx').val(),
		mcu : $('#mcu').val(),
		rmanager : $('#rmanager').val(),
		userName : $('#userName').val(),
		passWord : $('#passWord').val(),
		isRemember : isRemember  //是否记住密码
		
	}
	// window.Electron.initWin();
	var loginParam={
		userName:$('#userName').val(),
		passWord : $('#passWord').val(),
	}
	
	
	//判断如果登陆成功后 才进行 写入配置文件
	//获取全局变量中的 登陆成功 状态 isSuccessLogin
	
	login(loginParam,(res)=>{
		if(res){
			console.log("login success!!!!");
			console.log("_____________login ")
			$("#login-msg").text("");
			
		}else{
			console.log("login fail !!!! ");
			console.log("_____________login")
			$("#login-msg").text("用户名或密码错误,请重试！");
		}
	})
	window.Electron.saveConf(param); 
	window.Electron.startListenServerStatus(); 
	
	
	
	
}

function login(param,callback){
	window.Electron.userLogin(param);
	console.log("login method is complate")
	if(remote.getGlobal("isSuccessLogin")){
		callback(true);
	}else{
		callback(false);
	
	}
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
	//从配置文件读取是否 为记住密码
	var isRemember=conf.isRemember;
	console.log("_____________init login page  sout isRemember status ")
	console.log(isRemember);
	console.log("end____________________________________")
	if(isRemember){
		$('#userName').val(conf.userName);
		$('#passWord').val(conf.passWord);
		$("input[name='isRemember']").attr("checked",'checked');     //设置记住密码选择 状态为选中
		
	}else{
		$("input[name='isRemember']").removeAttr('checked')    //设置
	}
	$('#host').val(conf.host);
	$('#port').val(conf.port);
	$('#nginx').val(conf.nginx);
	$('#rmanager').val(conf.rmanager);
	$('#mcu').val(conf.mcu);
})