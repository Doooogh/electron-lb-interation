var userId,classroomId,classroomName,deviceId,managerAddr,username,password;
var dynamic = 'easyhao';
var isSpeaker = 'false';
var token ;
var ptz ; 
var videoList = new Array();
ipcRenderer.on('escWindow',function(event){
	$(".tc_close").trigger('click');
});
$(document).ready(function() {

	$(".tc_close").click(function(){
		var sns = new Array();
		var streamindexs = new Array();
		var winindexs = new Array();
		for (var i = 0; i < videoList.length; i++) {
			var videoStr = videoList[i];
			sns.push(videoStr.split("_")[0]);
			streamindexs.push(videoStr.split("_")[1]);
			winindexs.push(videoStr.split("_")[2]);
		}
		window.Electron.ipcRenderer.send("manege_removeWindows",sns,streamindexs,winindexs);
		if(videoList.length == 0){
			window.Electron.closeCurrWin();
		}
	});
	
	isSpeaker = getUrlParam('isSpeaker');
	userId = getUrlParam('userId');

	if(isSpeaker == "true"){
		$('.kgjm_tc_btn').hide();
	}else{
		$('.kgjm_tcB').hide();
	}
	
	classroomId = getUrlParam('classroomId');
	Server.getClassroomInfo(classroomId,function(classroom_result){
		deviceId = classroom_result.deviceId;
		classroomName = classroom_result.classroomName;
		managerAddr = remote.getGlobal('rmanager');
		username = classroom_result.username;
		password = classroom_result.password;

		$('#courseName').html(classroomName);
		console.log('---------------classroom_result---------------');
		console.log(classroom_result)
		initDevice();
	})

	ipcRenderer.on('videoWindowDblClick',function(event,windowId){
		_manage_dblclick(windowId);
	});


	//底部视频滚动
	$(".kgjm_tcB li").dblclick(function(e){
		//alert('暂无视频');
		remote.dialog.showMessageBox({
            type:'info',
            title: '提示',
            message: '暂无视频',
            buttons:['ok']
   		 }); 
	});

	ipcRenderer.on('onhook',function(event,snList,streamindexList,winindexList){
		for (var i = 0; i < snList.length; i++) {
			videoList.push(snList[i]+"_"+streamindexList[i]+"_"+winindexList[i]);
		}
	});

	ipcRenderer.on('removehook',function(event,sn,video_no){
		for (var i = 0; i < videoList.length; i++) {
			var videoStr = videoList[i];
			if(videoStr.indexOf(sn+"_"+video_no) == 0){
				videoList.splice(i,1);
			}
		}
		if(videoList.length == 0){
			window.Electron.closeCurrWin();
		}
	});

	$(".sliderP_1 .jws-handle").mouseover(function(){
		$(this).parent().find(".jws-text").stop().fadeIn();
	});
	$(".sliderP_1 .jws-handle").mouseleave(function(){
		$(this).parent().find(".jws-text").stop().fadeOut();
	});

	//滑块
	var option = {
		width: '137px',
		progress: 1,
		handleSrc: '../img/slider_handle.png',
		isCustomText: false
	};
	$('#sliderParent')
		.jackWeiSlider(option)
		.setProgress(0.5)
		.setOnStartDragCallback(function () {
			console.log('start');
		})
		.setOnDragCallback(function (p) {
			console.log(p);
			PTZ.speed = Math.round(p*100);
		})
		.setOnStopDragCallback(function () {
			console.log('stop');
	});

	$("#ptz_center").click(function(){
	  PTZ.home(managerAddr,token);
	});

	$("#ptz_up").mousedown(function(){
	  PTZ.up(managerAddr,token);
	});
	$("#ptz_leftup").mousedown(function(){
	  	PTZ.leftup(managerAddr,token);
	});
	$("#ptz_left").mousedown(function(){
	  PTZ.left(managerAddr,token);
	});
	$("#ptz_leftdown").mousedown(function(){
	  PTZ.leftdown(managerAddr,token);
	});
	$("#ptz_down").mousedown(function(){
	  PTZ.down(managerAddr,token);
	});
	$("#ptz_rightdown").mousedown(function(){
	  PTZ.rightdown(managerAddr,token);
	});
	$("#ptz_right").mousedown(function(){
	  PTZ.right(managerAddr,token);
	});
	$("#ptz_rightup").mousedown(function(){
	  PTZ.rightup(managerAddr,token);
	});
	$("#itemsContainer a").mouseup(function(){
	  PTZ.stop(managerAddr,token);
	});
	$("#ptz_near").mousedown(function(){
	  PTZ.near(managerAddr,token);
	});
	$("#ptz_near").mouseup(function(){
	  PTZ.stop(managerAddr,token);
	});
	$("#ptz_far").mousedown(function(){
	  PTZ.far(managerAddr,token);
	});
	$("#ptz_far").mouseup(function(){
	  PTZ.stop(managerAddr,token);
	});
	$("#ptz_focus_add").mousedown(function(){
	  	PTZ.focus(managerAddr,token,PTZ.speed);
	});
	$("#ptz_focus_add").mouseup(function(){
	    PTZ.stopFocus(managerAddr,token);
	});
	$("#ptz_focus_sub").mousedown(function(){
	 	PTZ.focus(managerAddr,token,-PTZ.speed);
	});
	$("#ptz_focus_sub").mouseup(function(){
	    PTZ.stopFocus(managerAddr,token);
	});

	$('.kgjm_tc_btn').click(function(){
		var webContentsId = window.Electron.remote.getCurrentWindow().getParentWindow().webContents.id;
		window.Electron.ipcRenderer.sendTo(webContentsId,"handUp",Number(userId));
	});
});

function _manage_dblclick(id){
	console.log("_manage_dblclick:"+id);
	id = Number(id.replace("rtmp-in",""));
	Server.startPreview(managerAddr,token,function(result){
		var has =0;
		switch(id+1)
		{
			case 1:
			  has = result.video1.capType;
			  break;
			case 2:
			  has = result.video2.capType;
			  break;
			  case 3:
			  has = result.video3.capType;
			  break;
			case 4:
			  has = result.video4.capType;
			  break;
			  case 5:
			  has = result.video5.capType;
			  break;
			case 6:
			  has = result.video6.capType;
			  break;
			  case 7:
			  has = result.video7.capType;
			  break;
			case 8:
			  has = result.video8.capType;
			  break;
			  case 9:
			  has = result.video9.capType;
			  break;
			case 10:
			  has = result.video10.capType;
			  break;
			  case 11:
			  has = result.video11.capType;
			  break;
			case 12:
			  has = result.video12.capType;
			  break;
			default:
		}
		if(has != 0)
		{
			Server.switchOutput(managerAddr,token,id,1,function(){
			});
		}
		var camera;
		if(has == 3){
			camera = id;
		}else{
			camera = null;
		}
		PTZ.camera = camera;
		$('#camera').html(id);
	});
}

function initDevice(){
	Server.join(managerAddr,username,password,deviceId,dynamic,function(_token){
		token = _token;
		rmanager_token = _token;
		let href = managerAddr.substr(0,managerAddr.indexOf(":"));
		Server.startPreview(managerAddr,token,function(result){
			var previewChannel = result.previewChannel;
			var prevConf2 = result.prevConf2;
			var channel = prevConf2.channels[previewChannel];
			var mainUri = initUri(previewChannel,channel,'out',result.previewURL_base2,result.deviceId);
			//"rtmp://"+href+"/mp4/"+result.previewURL_base2+"_"+result.deviceId+"_Out1"
			hookWindow("main1",null,mainUri,false,null);
			if(isSpeaker == 'true'){
				for(var i=0; i<6; i++)
				{
					var inUri = initUri(previewChannel,channel,'in',result.previewURL_base2,result.deviceId,i);
					//"rtmp://"+href+"/"+result.previewURL_base+"_"+result.deviceId+"_In"+i
				 	hookWindow("rtmp-in"+i,null,inUri,false,null);
				}
			}
		});
	});
}

function initUri(previewChannel,channel,in_out,previewURL_base2,deviceId,i){
	var href = managerAddr.substr(0,managerAddr.indexOf(":"));
	var type ;
	var uri = '';
	if(in_out == "out"){
		type = channel.out[previewChannel].type;
		switch(type){
			case 1:
				uri = "rtmp://"+href+"/mp4/"+previewURL_base2+"_"+deviceId+"_Out1";
				break;
			case 2:
				uri = channel.out[previewChannel].addr+"/"+previewURL_base2+"_"+deviceId+"_Out1";
				break;
		}
	}else{
		type = channel.in[previewChannel].type;
		switch(type){
			case 1:
				uri = "rtmp://"+href+"/mp4/"+previewURL_base2+"_"+deviceId+"_In"+i;
				break;
			case 2:
				uri = channel.out[previewChannel].addr+"/"+previewURL_base2+"_"+deviceId+"_In"+i;
				break;
		}
	}
	return uri;
}

function hookWindow(divId,streamindex,url,move,winIndex,is_hide){
	var left,top,width,height;
	left = $('#'+divId).offset().left;
	top = $('#'+divId).offset().top;
	width = $('#'+divId).width();
	height = $('#'+divId).height();


	console.log(divId);
	console.log("left="+left+";top="+top+";width="+width+";height="+height);
	if(!move)
	{
		var ltwhArrays = new Array();
		var urls = new Array();
		var snList = new Array();
		var volList = new Array();
  		
  		ltwhArrays.push(left,top,width,height);
  		urls.push(url);
  		snList.push(divId);
  		volList.push(100);
		
		ipcRenderer.send('manege_hookWindow',ltwhArrays,urls,snList,volList,divId);
	}
	else
	{

		var ltwhArrays = new Array();
		var streamindexList = new Array();
		var winIndexList = new Array();
		var volList = new Array();
  		ltwhArrays.push(left,top,width,height);
  		streamindexList.push(streamindex);
  		winIndexList.push(winIndex);
	  	volList.push(100);//声音0-100
  		
		ipcRenderer.send('manege_moveWindow',ltwhArrays,streamindexList,winIndexList,volList);
	}
}


function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
