const http = nodeRequire('http');
const loger = nodeRequire('../../res/js/loger.js')
const md5 = nodeRequire('md5-node')
const cusHttp=nodeRequire('../../res/js/main-js/cus-http.js')
const cusWin=nodeRequire('../../res/js/main-js/open-window.js')
var confData={};
var confParam={};
function mySubmit(){
	
	
	var isRemember=false;
	var remeberPwd=$("input[name='isRemember']:checked")
	if(remeberPwd.length==1){
		console.log("login is remember"+"_____________________________true")
		isRemember=true;
	}
	 confParam = {
	/*	host : $('#host').val(),
		port : $('#port').val(),
		nginx : $('#nginx').val(),
		mcu : $('#mcu').val(),
		rmanager : $('#rmanager').val(),*/

		userName : $('#userName').val(),
		passWord : $('#passWord').val(),
		isRemember : isRemember  //是否记住密码
		
	}
	// window.Electron.initWin();
	var loginParam={
		userName:$('#userName').val(),
		passWord : $('#passWord').val(),
		dynamic : confData.dynamic
	}
	
	
	
	if(loginParam.userName==""||loginParam.passWord==""){
		console.log(loginParam.userName&&loginParam.passWord);
			$("#login-msg").text("账号或者密码不能为空！");
			return false;
	}
	
	//判断如果登陆成功后 才进行 写入配置文件
	//获取全局变量中的 登陆成功 状态 isSuccessLogin
	
	login(loginParam);
	
	
	
	
	
}



function login(param){
	var userName = param.userName;
	var dynamic = confData.dynamic;
	var passWord = md5(param.passWord+dynamic);
	var processParam="";
	loger.info("________________________________________________________")
	loger.info(userName+"_________"+passWord+"__________"+dynamic);
	if(userName&&passWord){
		cusHttp.httpRetryCallback("http://"+confData.host+":"+confData.port+config.USER_LOGIN+"?username="+userName+"&password="+passWord+"&dynamic="+dynamic,(data)=>{
				loger.info(userName+"_________"+passWord);
				loger.info("login status++++++++++++++____________________________");
				   if(data.rc == 0){
				      var token = data.token;
				      var userId = data.userId;
				      loger.info("http://"+confData.host+":"+confData.port+config.FIND_LESSON+"?token="+token)
				       http.get("http://"+confData.host+":"+confData.port+config.FIND_LESSON+"?token="+token,function(req,res){  
				            var json='';  
				            req.on('data',function(child_data){  
				                json+=child_data;  
				            });  
				            req.on('end',function(){  
				              loger.info("init-findLesson:"+json);
				              var child_data = JSON.parse(json);
				                if(child_data.rc == 0){
				                  if(child_data.hasOwnProperty('lesson')){
				                    var lessonId = child_data.lesson.lessonId;
				                    processParam = 'id='+userId+'&lessonId='+lessonId+'&token='+token;
									ipcRenderer.send('createWindowByProcessParam',processParam);
									window.Electron.saveConf(confParam); 
									currentWindow.close();
				                  }else{
				                    errorMsg = "no_course";
				                    cusWin.createErrorWindow()
				                  }
				                }
				            }); 
				       });
				    }else{
						$("#login-msg").text("用户名或密码错误,请重试！");
					}
				  
		});
	}
}




$(function(){
	
	//判断系统网络状况
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
		//获取配置文件中数据
	ipcRenderer.send('getConfData');
	ipcRenderer.on('sendConfData',(event,resConfData)=>{
		confData=resConfData;
		if(confData){
			loger.info("confData  init  login form value!!!!!!!!!!")
			var conf=confData;
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
			/*$('#host').val(conf.host);
			$('#port').val(conf.port);
			$('#nginx').val(conf.nginx);
			$('#rmanager').val(conf.rmanager);
			$('#mcu').val(conf.mcu);*/
		}
	})



	// var conf = window.Electron.readConf();
	
	
})