var pwds;
var Server = {
	JOIN:'/join',
	START_PREVIEW:'/startPreview',
	SWITCH_OUTPUT:"/switchOutput",
  	PTZ:"/ptz",
	getUserInfo : function(userId,callback){
		$.ajax({
		 type: 'GET',
		 url: "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.USER_INFO,
		 data: {
		 	userId : userId
		 	// id : userId
		 },
		 dataType: "JSON",
		 success: function(result){
		 	if(result.msg == "OK"){
				callback(result.data.userList[0]);
		 	}
		 	// callback(result.data);
		 },
		 error:function(result){
		 	alert("获取用户信息失败！");
		 }
		});
	},
	getLessonInfo: function(lessonId,token,callback){
		$.ajax({
		 type: 'GET',
		 url: "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.LESSON_INFO,
		 data:{
		 	lessonId:lessonId,
		 	// id:lessonId,
		 	tk:token 
		 },
		 dataType: "JSON",
		 success: function(result){
		 	if(result.success == true){
				callback(result.data);
		 	}
		 },
		 error:function(result){
		 	alert("获取课程信息失败！");
		 }
		});
	},	
	getClassroomInfo: function(classroomId,callback){
		$.ajax({
		 type: 'GET',
		 url: "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.CLASSROOM_INFO,
		 data:{
		 	classroomId:classroomId
		 },
		 dataType: "JSON",
		 success: function(result){
		 	if(result.success == true){
				callback(result.data);
		 	}
		 },
		 error:function(result){
		 	alert("获取教室信息失败！");
		 }
		});
	},
	//duration 何时关闭互动:0为不关闭，其他值为自动关闭的秒数
	startAVConf:function(classroomId,token,duration,callback){
		var data ={"duration":duration,"aec":1,"autocastOff":1};
		$.ajax({
			 type: 'POST',
			  url:  managerAddr+'/startAVConf?classroomId='+classroomId+"&token="+rmanager_token,
			 data:JSON.stringify(data),
			 dataType: "JSON",
			 success: function(result){
			 	if(result.rc == 0){
			 		$.ajax({
					 type: 'POST',
					 url: managerAddr+"/reqStatus?token="+rmanager_token,
					 dataType: "JSON",
					 success: function(result){
					 		callback(result);
					 },
					 error:function(result){
					 	
					 }
					});
			 		callback(result);
			 	}else{
			 		console.log(result);
			 		Server.join(managerAddr,username,pwds,deviceId,dynamic,function(_token){
		 				rmanager_token = _token;
		 				setTimeout(function(){Server.startAVConf(classroomId,token,duration,callback)},3000);
		 			});
			 	
			 	}
			 },
			 error:function(result){

			 	setTimeout(function(){Server.startAVConf(classroomId,token,duration,callback)},3000);
			 }
		});
	},
	stopAVConf:function(classroomId,token,callback){
		$.ajax({
			 type: 'POST',
			 url:  managerAddr+'/stopAVConf?classroomId='+classroomId+"&token="+rmanager_token,
			 data:'{}',
			 dataType: "JSON",
			 success: function(result){
			 	if(result.rc == 0){
			 		callback(result);
					// console.log(result);
			 	}else{
			 		Server.join(managerAddr,username,pwds,deviceId,dynamic,function(_token){
		 				rmanager_token = _token;
		 				setTimeout(function(){Server.stopAVConf(classroomId,rmanager_token,callback)},3000);
		 			});
			 		/*alert(result);*/
			 	}
			 },
			 error:function(result){

			 	callback("errorWin");
		
			 }
		});
	},
	setPipAndSwitch:function(classroomId,token,channelId,pipEdit,usePip,callback){
		var data = {"channelId":channelId,"pipEdit":pipEdit,"usePip":usePip,"outputIndex":1};//JSON.stringify({channelId:channelId,pipEdit:pipEdit,usePip:usePip});
		$.ajax({
			 type: 'POST',
			 url:  managerAddr+'/setPipAndSwitch?token='+rmanager_token,
	 		 data:JSON.stringify(data),
			 dataType: "JSON",
			 success: function(result){
			 	if(result.rc == 0){
					console.log(result);
			 	}else{
			 		Server.join(managerAddr,username,pwds,deviceId,dynamic,function(_token){
		 				rmanager_token = _token;
		 				setTimeout(function(){Server.setPipAndSwitch(classroomId,token,channelId,pipEdit,usePip,callback)},3000);
		 			});
			 		console.log(result);
			 	}
			 },
			 error:function(result){
			 	console.log(result)
			 }
		});
	},
	waitDeviceData:function(classroomId,token,seq,callback){
		seq = seq == null? -1:seq;
		var data = {seq:seq};
		$.ajax({
			 type: 'POST',
			 url:  "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.WAIT_DEVICE_DATA+'?classroomId='+classroomId+"&token="+token,
			 data:data,
			 dataType: "JSON",
			 success: function(result){
			 	if(result.rc == 0){
			 		callback(result);
			 	}else{
			 		callback(result);
			 	}
			 },
			 error:function(result){
			 	console.log(result)
			 }
		});
	},
	join:function(managerAddr,username,pwd,deviceId,dynamic,callback){
		pwds = pwd;
		password = $.md5(pwd+dynamic);
		$.ajax({
		 type: 'GET',
		 url: managerAddr+Server.JOIN,
		 data:{
		 	username:username,
		 	password:password,
		 	deviceId:deviceId,
		 	dynamic:dynamic
		 },
		 dataType: "JSON",
		 success: function(result){
		 	if(result.rc == 0){
				callback(result.token);
		 	}
		 },
		 error:function(result){
		 }
		});
	},
	startPreview:function(managerAddr,token,callback){
		$.ajax({
		 type: 'GET',
		 url: managerAddr+Server.START_PREVIEW+'?token='+rmanager_token,
		 data:{
		 },
		 dataType: "JSON",
		 success: function(result){
		 	if(result.rc == 0){
				if(typeof callback === "function" ){
		 			callback(result);
		 		}
		 	}else{
		 		Server.join(managerAddr,username,pwds,deviceId,dynamic,function(_token){
		 			rmanager_token = _token;
		 			setTimeout(function(){Server.startPreview(managerAddr,rmanager_token,callback)},3000);
		 		});
		 	}
		 },
		 error:function(result){
		 }
		});
	},
	/*
	*  7.4 视频切换
	*  index 切换哪一路视频上去  视频索引号，取值范围[0,12)
	*  outputIndex 将视频切换到哪一路 接口为/switchOutput时有效，1为切换第一路视频，2为切换第二路视频，默认为1
	*/
	switchOutput:function(managerAddr,token,index,outputIndex,callback){
		var date = {"index":index,"outputIndex":outputIndex};
		$.ajax({
		 type: 'POST',
		 url: managerAddr+Server.SWITCH_OUTPUT+'?token='+rmanager_token,
		 data:JSON.stringify(date),
		 dataType: "JSON",
		 success: function(result){
		 	if(result.rc == 0){
				if(typeof callback === "function" ){
		 			callback(result);
		 		}
		 	}else{
		 		Server.resultCallback('switchOutput',result,true)
		 	}
		 },
		 error:function(result){
		 	Server.resultCallback('switchOutput',result,true)
		 }
		});
	},
	/*
	*  7.5 云台控制
	*  Tools.ptz
	*/
	ptz:function(managerAddr,token,ptz,callback){
		var date = {"ptz":ptz};
		$.ajax({
		 type: 'POST',
		 url: managerAddr+Server.PTZ+'?token='+rmanager_token,
		 data:JSON.stringify(date),
		 dataType: "JSON",
		 success: function(result){
		 	if(result.rc == 0){
				if(typeof callback === "function" ){
		 			callback(result);
		 		}
		 	}else{
		 		Server.resultCallback('ptz',result,true)
		 	}
		 },
		 error:function(result){
		 	Server.resultCallback('ptz',result,true)
		 }
		});
	},
	resultCallback:function(action,result,isClose,callback){
		console.log(action+':'+JSON.stringify(result));
	},
	isPrintscreen:function(lessonId,rtmp,classroomId,isSart,callback){
		$.ajax({
		 type: 'POST',
		 url:  "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.ISPRINTSCREEN+'?lessonId='+lessonId+'&rtmp='+rtmp+'&classroomId='+classroomId+'&isSart='+isSart,
		 dataType: "JSON",
		 success: function(result){
		 	
		 },
		 error:function(result){
		 	
		 }
		});
	},
	analyze:function(lessonId,courseId,classroomId,analyzeType,callback){
		$.ajax({
		 type: 'POST',
		 url:  "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.ISPRINTSCREEN+'?lessonId='+lessonId+'&courseId='+courseId+'&classroomId='+classroomId+'&courseId='+courseId,
		 dataType: "JSON",
		 success: function(result){
		 	
		 },
		 error:function(result){
		 	
		 }
		});
	}
}
