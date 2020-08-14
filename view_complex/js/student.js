var currentWindow = remote.getCurrentWindow();
let webview ;
let teacher_url;
var setTimeoutNum;
var isSetTime;
var bitstream = '0';//0 低码流 1高码流
var isQp = false;//true 全屏 false 窗口化
let classroomModel ;
var plan = window.Electron.readConf().plan;
var userId,classroomName,deviceId,managerAddr,username,password,rmanager_token;
var dynamic = "ehrec";
var my_url;
function createFullScreen(){//全屏
	// currentWindow.setFullScreen(true);
	window.Electron.setWindowFull();
	canvasTop = 0;
	$(".hdM").css("height","100%");
	$(".hdT").hide();
	$(".hdB").hide();
	currentWindow.setMaximizable(false);
	isQp = true;
	showTt(true);
}

function showTt(_flag){//判断全屏最小化 当前是否推题和有发言人

	if(fayanren==null&&!drawingDisabled){//当前没发言人 和推题状态下
		if(_flag){
			$('#canvasDiv').css('height',currentWindow.getBounds().height);
			$('#canvasDiv').css('width',currentWindow.getBounds().width);
			$('#canvasDiv').css("left",0);
		}else{
			$('#canvasDiv').css('height',currentWindow.getBounds().height-90);
			var canvasWidth = $('#canvasDiv').height()*16/9;
			$('#canvasDiv').css('width',canvasWidth);
			$('#canvasDiv').css('left',(currentWindow.getBounds().width-canvasWidth)/2);
		}	
			$(".func").css("margin-left","-140px");
			$(".func_v_hb_box").css("bottom","80px");
			$(".func").css("bottom","25px");
	}else if(fayanren!=null&&!drawingDisabled){
		if(_flag){
			$(".func").css("margin-left","-140px");
			$(".func").css("bottom","-40px");
			$(".func_v_hb_box").css("bottom","50px");

		}else{
			$(".func").css("bottom","-30px");
			$(".func_v_hb_box").css("bottom","50px");
		}

	}
			document.getElementById(currentDrawingId).width = $("#drawing").width();
			document.getElementById(currentDrawingId).height = $("#drawing").height();
			renderAllPaths();
}
$(document).ready(function() {

	webview = document.querySelector('webview');
	currentWindow.setSkipTaskbar(false);
	if(remote.getGlobal("hdType")=="inner"){//内网直播
		bitstream=remote.getGlobal("bitstream");//内网默认高码流
		classroomId = remote.getGlobal("in_clientId");//教室ID
		deviceId = remote.getGlobal("deviceId");
		classroomName = remote.getGlobal('in_clientName');
		managerAddr = remote.getGlobal('rmanager');
		username = remote.getGlobal('recName');
		password = remote.getGlobal('recPwd');
		Server.join(managerAddr,username,password,deviceId,dynamic,function(_token){
			rmanager_token = _token;
			
		});
		isClassroom = true;
		$(".lesson_name").html(classroomName);
		connect(classroomName,classroomId, remote.getGlobal("roomId"),'user','recordCastClient',[],'0',false,true);
	}else{
	Server.getUserInfo(getUrlParam("id"),function(data){
		var classroomName ;
		var userList = remote.getGlobal('coursesUserList');
		var is_hav = false;
		/*var classroomModel ;*/
		for (var i = 0; i < userList.length; i++) {
			if(getUrlParam("id") == userList[i].userId && userList[i].classroomId != -1){
				classroomName = userList[i].classroomModel.classroomName;
				classroomId = userList[i].classroomModel.classroomId;
				isClassroom = true;
				is_hav = true;
				classroomModel = userList[i].classroomModel;
				break;
			}
		}
		if(!classroomName){
			classroomName = data.realname;
		}
		$(".lesson_name").html(classroomName);


		if(classroomModel.bitstream){
			bitstream = classroomModel.bitstream;
		}

		connect(classroomName,data.userId, remote.getGlobal("roomId"),'user','recordCastClient',[],'0',false,true);
		Server.getClassroomInfo(classroomId,function(classroom_result){
			deviceId = classroom_result.deviceId;
			classroomName = classroom_result.classroomName;
			managerAddr = remote.getGlobal('rmanager');
			username = classroom_result.username;
			password = classroom_result.password;
			console.log('---------------classroom_result---------------');
			console.log(classroom_result)
			Server.join(managerAddr,username,password,deviceId,dynamic,function(_token){
				rmanager_token = _token;
				
			});
		})
	})
}
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
				isOpenStr = false;
				requestCloseVideo(sn,0);
			}
		}
	});
	ipcRenderer.on('display-metrics-changed',function(){
		changeVideo();
	});
	ipcRenderer.on('stopLive',function(event){
		Server.stopAVConf(classroomId,rmanager_token,function(msg){
			if(msg =="errorWin"){
				ipcRenderer.send("errorWin")
			}else{
				ipcRenderer.send("stopLive");
			}
		})
	});
	ipcRenderer.on('closePrintscreen',function(event){
		if(remote.getGlobal("hdType")!="inner"){
			Server.isPrintscreen(remote.getGlobal('lessonModel').lessonId,my_url,classroomId,0,function(result){

			});
		}
	});
	ipcRenderer.on('escWindow',function(event){
		if(isQp){
			$(".hdT").show();
			$(".hdB").show();
			setTimeout(function(){
				$(".hdM").css("height", "calc(100% - 90px)");
				showTt(false);
			},100); 

			window.Electron.setWindowOldSize();
			isQp = false;
		}


	});
	$('.icon_close').click(function(){

		currentWindow.close();
	});
	
	$('.icon_zoom').click(function(){//全屏
		createFullScreen();
	});
	
	ipcRenderer.on('videoWindowDblClick',function(event,windowId){//视频点击事件
		if(currentWindow.isFullScreen()){
			currentWindow.setFullScreen(false);
	    	$(".hdT").show();
			$(".hdB").show();
			setTimeout(function(){
			/*var height = $(".zscreen").css("he")-90;*/
			var hdMheight = $(".hdM").height()-90;
			/*$(".zscreen").css("height","calc(100% - 90px)");	*/
			$(".hdM").css("height", "calc(100% - 90px)");
			},100);
			
		}else{
			currentWindow.setFullScreen(true);
			$(".hdM").css("height","100%");
			$(".hdT").hide();
			$(".hdB").hide(); 
		}
		changeVideo();
	});
	$('.icon_narrow').click(function(){
		currentWindow.minimize();
	});

	$(".zscreen").resize(function(){
		for (var i = 0; i < videoList.length; i++) {
			var videoStr = videoList[i];
			var str = videoStr.split("_");
			var sn = str[0];
			var streamindex = str[1];
			var winIndex = str[2];
			if(str[0] == zhujianren){
				hookSpeakerWindow(sn,streamindex,'',true,streamindex,winIndex,true);
			}
		}
		document.getElementById(currentDrawingId).width = $("#drawing").width();
		document.getElementById(currentDrawingId).height = $("#drawing").height();
		renderAllPaths();
	});

	$(document).ready(function() {
	
			$(".func_v_yc").click(function(){
				$(this).parent().find(".done").removeClass("done");
				$(".func_v_hb_box").hide();
				$(".func_v_xp_box").hide();
				if($(this).hasClass("none") == true){
					$(this).removeClass("none");
					$(".func_v_hb").show();
					$(".func_v_xp").show();
					$(".func_v_qp").show();
				}else{
					$(this).addClass("none");
					$(".func_v_hb").hide();
					$(".func_v_xp").hide();
					$(".func_v_qp").hide();
				}
			});//隐藏/显示
			$(".thicknessBtn").click(function(){
				$(".thickness").find(".on").removeClass("on");
				$(this).addClass("on");
			});//粗细选择
			$(".func_v_xp_box .eraser li").click(function(){
				$(this).parent().find(".on").removeClass("on");
				$(this).addClass("on");
			});//橡皮选择
			$(".func_v_hb").click(function(){
					if($(this).hasClass("done") == false){
						$(this).parent().find(".done").removeClass("done");
						$(".func_v_xp_box").hide();
						$(this).addClass("done");
						$(".func_v_hb_box").show();
					}else{
						$(this).removeClass("done");
						$(".func_v_hb_box").hide();
					};
					lineMode = 'any';
				});//画笔
				$(".func_v_xp").click(function(){


						$(".func_v_hb").removeClass("done");
						$(".func_v_hb_box").hide();
					
					/*if($(this).hasClass("done") == false){
						$(this).parent().find(".done").removeClass("done");
						$(".func_v_hb_box").hide();
						$(this).addClass("done");
						$(".func_v_xp_box").show();
					}else{
						$(this).removeClass("done");
						$(".func_v_xp_box").hide();
					};*/
					lineMode = 'choose';
				});//橡皮
		});

		$(".func_v_qp").click(function(){//删除白板线
			resetEverything();
		});
		createFullScreen();
});

function hdkt_layout(){
	if(isClassroom){
		// var startTime = remote.getGlobal('lessonModel').startTime;
		// var endTime = remote.getGlobal('lessonModel').endTime;
		Server.startAVConf(classroomId,getUrlParam("token"),0,function(result){
			if(result.liveStatus == 3){
				//检查是否推流入会
				// if(!is_send_url){
					var url = result.liveAddr.lo[0];
					if(bitstream == '1'){//默认低码流，
						url = result.liveAddr.hi[0];
					}
					if(remote.getGlobal("hdType")!="inner"){
						my_url = url;
						Server.isPrintscreen(remote.getGlobal('lessonModel').lessonId,url,classroomId,1,function(result){

						});
					}
					var video_no = 0;
					in_url(video_no,url);
					is_send_url = true;

				// }
			}
		})
	}
}

function dbClick(){//双击事件

	if(isQp){
			
			$(".hdT").show();
			$(".hdB").show();
			setTimeout(function(){
				$(".hdM").css("height", "calc(100% - 90px)");
				showTt(false);
			},100); 

			window.Electron.setWindowOldSize();
			isQp = false;
		}else{

			createFullScreen();
		}
}

function renderWhiteboard(wbop, wbIndex) {
	var boardMayChange = false;
	if (wbop == 1) /* delete */ {
		if (wbIndex != -1) whiteboard.splice(wbIndex, 1);
		boardMayChange = true;
	} else if (wbop == 2 || wbop == 3) {		
		boardMayChange = true;		
	}

	if (boardMayChange) {
		$(".tishi").show();
		var newWhiteboardName = null;

		for (var i = 0; i < whiteboard.length; ++i) {
			if (whiteboard[i].ppt_name == "/wba") /* public whiteboard */ {
				newWhiteboardName = whiteboard[i].ppt_name;
	
				break;
			}
		}

		if (ppt_name != newWhiteboardName)
		{
			ppt_name = newWhiteboardName;
			ppt_page = 0;
			if (ppt_name == null) {
				
				$("#canvasDiv").hide();

				$(".zscreen").css('left', "0");
				$(".zscreen").css('top', "0");
				$(".zscreen").css('width', "100%");
				$(".zscreen").css('height', "100%");
				drawingDisabled = true;
			} else {
				canvasTop = 45;
				$("#canvasDiv").show();
				var canvasHeight = $('#canvasDiv').width()*9/16;
				$('#canvasDiv').css('height',canvasHeight);
				hdkt_turn_to_page("public");
				$(".zscreen").css('left', "74%");
				$(".zscreen").css('top', "74%");
				$(".zscreen").css('width', "25%");
				$(".zscreen").css('height', "25%");
    			document.getElementById(currentDrawingId).width = $("#drawing").width();
   				document.getElementById(currentDrawingId).height = $("#drawing").height();

				drawingDisabled = false;
			}

			renderAllPaths();
		}
	} else {
		if (wbIndex != -1) {
			var whiteboard2 = whiteboard[wbIndex];
			if (whiteboard2.ppt_name == ppt_name) {
				renderAllPaths();				
			}
		}
		
	}
	
}

function on_bc_share_doc(data) {

	if(data.scope=="public"){
		if(data.path != ''){
			setTimeout(function(){
			if(fayanren==null&&window.screen.height!=$(".hdM").height()){
				showTt(false);
				$(".func").css("margin-left","-140px");
			}else{
				showTt(true);
			}
			},200);
			$('.avr_canvas_div_class').css('background-image','url('+data.path+')');
			plan = data.plan;
			if(data.plan=="b"){
				$("#tools").hide();
				$(".func_v_hb_box").hide();
				document.getElementsByClassName('avr_canvas_div_class')[0].removeEventListener('mouseleave',divMouseleave,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].removeEventListener('mousemove',divMousemove,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].removeEventListener('mousedown',divMousedown,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].removeEventListener('mouseup',divMouseup,false);
			}else{
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mouseleave',divMouseleave,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mousemove',divMousemove,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mousedown',divMousedown,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mouseup',divMouseup,false);
				$("#tools").show();
			}
		}else{
			$('.avr_canvas_div_class').css('background-image','');
		}
	}
}
function _addUser(authority_level,client_id,client_name,client_seq,client_sn,client_type,is_speaker,video_numbers,video_status){
	for(var i=0; i<video_numbers; i++) {
		if(video_status[i]==-1){
			if(is_speaker){
				hdkt_subscribeVideo(client_sn,i,false,0,'',client_name);
			}
		}
	}
}

function _deleteUser(client_sn){
	for (var i = 0; i < videoList.length; i++) {
		var videoStr = videoList[i];
		var str = videoStr.split("_");
		streamIndex = str[1];
		var str = videoStr.split("_");
		var	streamIndex = str[1];
		var winindex = str[2];
		if(client_sn == str[0]){
			ipcRenderer.send('removeWindow',str[0],streamIndex,winindex);
		}
	}
}

function getCourseStartTime(_startTime){
	webview.executeJavaScript(`Tools.setLiveTime('__startTime',${_startTime})`);
}

function hookSpeakerWindow(sn,video_no,url,move,streamindex,winIndex,call_by_resize){
	teacher_url = teacher_url ? teacher_url : url;
	zhujianren = zhujianren ? zhujianren : sn;

	$('.zscreen img').hide();
	$('.tishi').hide();
	$(".zscreen").attr("id",sn);
	if(fayanren && showFayanren(call_by_resize)) {
		renderAllPaths();
		return;
	}
	var left = $('#'+sn).offset().left;
	var top = $('#'+sn).offset().top;
	var width = $('#'+sn).width();
	var height = $('#'+sn).height();
	if(move){
		var ltwhArrays = new Array();
		var streamindexList = new Array();
		var winIndexList = new Array();
		var volList = new Array();
  		ltwhArrays.push(left,top,width,height);
  		streamindexList.push(streamindex);
  		winIndexList.push(winIndex);
  		volList.push(100);
		ipcRenderer.send('moveWindow',ltwhArrays,streamindexList,winIndexList,volList);
	}else{
		removeAllWindows();

		var ltwhArrays = new Array();
		var urls = new Array();
		var snList = new Array();
		var volList = new Array();
  		ltwhArrays.push(left,top,width,height);
  		urls.push(url);
  		snList.push(sn);
  		volList.push(100);
		ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList);
	}
	// window.Electron.setWindowFull();
}

function showFayanren(call_by_resize){
	var peer = findRemotePeer(parseInt(fayanren));
	if(!peer) return false;
	var url = '';
	for (var i = 0; i < allVideos.length; i++) {
		if(allVideos[i].mcu_id == parseInt(fayanren)){
			url = allVideos[i].sdp;
		}
	}
	hookWindow(fayanren,null,url,false,null,call_by_resize);
	return true;
}

function removeAllWindows()
{
	for (var i = 0; i < videoList.length; i++) {
		var videoStr = videoList[i];
		var str = videoStr.split("_");
		streamIndex = str[1];
		var str = videoStr.split("_");
		var	streamIndex = str[1];
		var winindex = str[2];
		ipcRenderer.send('removeWindow',str[0],streamIndex,winindex);
	}
}

function hookWindow(sn,streamindex,url,move,winIndex,isSetTime){

	isSetTime = isSetTime == true ? true:false;
	var left = $('.zscreen').offset().left;
	var top = $('.zscreen').offset().top;
	var width = $('.zscreen').width();
	var height = $('.zscreen').height();
	var vol_fyr = sn == my_mid ? 0 : 100;

	if (!move) removeAllWindows();
	fayanren = sn;
	if(!drawingDisabled){
		$('#canvasDiv').css('left',0);
		$('#canvasDiv').css('width','73%');
		var canvasHeight = $('#canvasDiv').width()*9/16;
		$('#canvasDiv').css('height',canvasHeight);
		$('#main2').show();

		left = $('#main2 .fyr').offset().left;
	 	top = $('#main2 .fyr').offset().top;
	 	width = $('#main2 .fyr').width();
	 	height = $('#main2 .fyr').height();

	 	var ltwhArrays = new Array();
		var urls = new Array();
		var snList = new Array();
		var volList = new Array();
		var left1 = $('#main2 .zjr').offset().left;
	 	var top1 = $('#main2 .zjr').offset().top;
	 	var width1 = $('#main2 .zjr').width();
	 	var height1 = $('#main2 .zjr').height();
	 	var ltwhArrays1 = new Array();
		var urls1 = new Array();
		var snList1 = new Array();
		var volList1 = new Array();
	
	  	ltwhArrays.push(left,top,width,height);
	  	ltwhArrays1.push(left1,top1,width1,height1);
	  	volList.push(vol_fyr);
	  	volList1.push(100);
		if (!move) {	
		 	urls.push(url);
	  		snList.push(sn);
			ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList,1);

		 	urls1.push(teacher_url);
	  		snList1.push(zhujianren);
			ipcRenderer.send('hookWindow',ltwhArrays1,urls1,snList1,volList1,2);
		} else {
			var zjr_stream = null, zjr_winindex = null;
			var fyr_stream = null, fyr_winindex = null;

			for (var i = 0; i < videoList.length; ++i)
			{
				var strArr = videoList[i].split("_");
				if (parseInt(fayanren) == strArr[0]) {
					fyr_stream = strArr[1];
					fyr_winindex = strArr[2];
				}
				if (zhujianren == strArr[0]) {
					zjr_stream = strArr[1];
					zjr_winindex = strArr[2];
				}
			}

			if (zjr_stream != null && zjr_winindex != null)
			{
				ipcRenderer.send('moveWindow',ltwhArrays1,zjr_stream,zjr_winindex);
			}
			if (fyr_stream != null && fyr_winindex != null)
			{
				ipcRenderer.send('moveWindow',ltwhArrays,fyr_stream,fyr_winindex);
			}
		}

			showTt(isQp);
	}else{
		var left2_scale ;
		var top2_scale ;
		var width2_scale ;
		var height2_scale ;

		var confData = window.Electron.readConf();
		var pip = confData.pip;
		
		if(confData.stuUp > 0 && isSetTime == false){
			if(pip == 0){
				left2_scale = student_max_x;
				top2_scale = student_max_y;
				width2_scale = student_max_w;
				height2_scale = student_max_h;
			}else if(pip == 1){
				left2_scale = student_2_1_max_x;
				top2_scale = student_2_1_max_y;
				width2_scale = student_2_1_max_w;
				height2_scale = student_2_1_max_h;
			}else if(pip == 2){
				left2_scale = student_3_1_max_x;
				top2_scale = student_3_1_max_y;
				width2_scale = student_3_1_max_w;
				height2_scale = student_3_1_max_h;
			}
			if(setTimeoutNum){
				clearTimeout(setTimeoutNum);
			}
			setTimeoutNum = setTimeout(function(){
				for (var i = 0; i < videoList.length; i++) {
					var videoStr = videoList[i];
					if(videoStr.indexOf(fayanren+"_") == 0){
						var str = videoStr.split("_");
						var sn = str[0];
						var	streamIndex = str[1];
						var winindex = str[2];
						hookWindow(sn,streamIndex,null,true,winindex,true);
					}
				}
			},confData.stuUp);
		}else{
			
			if(pip == 0){
				left2_scale = student_x;
				top2_scale = student_y;
				width2_scale = student_w;
				height2_scale = student_h;
			}else if(pip == 1){
				left2_scale = student_2_1_x;
				top2_scale = student_2_1_y;
				width2_scale = student_2_1_w;
				height2_scale = student_2_1_h;
			}else if(pip == 2){
				left2_scale = student_3_1_x;
				top2_scale = student_3_1_y;
				width2_scale = student_3_1_w;
				height2_scale = student_3_1_h;
			}
		}
		
		if(move){
			var ltwhArrays = new Array();
			var streamindexList = new Array();
			var winIndexList = new Array();
			var volList = new Array();
	  		var left2 = left, top2 = top, width2 = width, height2 = height;
			if (width > height / 9.0 * 16.0)
			{
				width2 = parseInt(height / 9.0 * 16.0 + 0.5);
				var diff = parseInt(width - width2) / 2 * 2;
				left2 += diff / 2;
			}
			else
			{
				height2 = parseInt(width / 16.0 * 9.0 + 0.5);
				var diff = parseInt(height - height2) / 2 * 2;
				top2 += diff / 2;
			}
	  		ltwhArrays.push(left,top,width,height);
	  		ltwhArrays.push(left2 - left + width2*left2_scale, top2 - top + height2*top2_scale,width2*width2_scale,height2*height2_scale);
	  	
	  		var zjrStream ,zjrWinIndex,fyrStream,fyrWinIndex;
	  		for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				// if(videoStr.indexOf(zhujianren+"_") == 0){
					var str = videoStr.split("_");
					var	streamIndex = str[1];
					var winindex = str[2];

					if(str[0] == zhujianren){
						zjrStream = streamIndex;
						zjrWinIndex = winindex;
					}else if(str[0] == fayanren){
						fyrStream = streamIndex;
						fyrWinIndex = winindex;
					}
				// }
			}
	  		streamindexList.push(zjrStream,fyrStream);
	  		winIndexList.push(zjrWinIndex,fyrWinIndex);
	  		volList.push(100,vol_fyr);
			ipcRenderer.send('moveWindow',ltwhArrays,streamindexList,winIndexList,volList);
		}else{
			// if(fayanren){
			var streamIndex ;
			for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				var str = videoStr.split("_");
				streamIndex = str[1];
				var str = videoStr.split("_");
				var	streamIndex = str[1];
				var winindex = str[2];
				ipcRenderer.send('removeWindow',str[0],streamIndex,winindex);
			}

			// }
			
			var ltwhArrays = new Array();
			var urls = new Array();
			var snList = new Array();
			var volList = new Array();
			//height = width * 9/16;

			var left2 = left, top2 = top, width2 = width, height2 = height;
			if (width > height / 9.0 * 16.0)
			{
				width2 = parseInt(height / 9.0 * 16.0 + 0.5);
				var diff = parseInt(width - width2) / 2 * 2;
				left2 += diff / 2;
			}
			else
			{
				height2 = parseInt(width / 16.0 * 9.0 + 0.5);
				var diff = parseInt(height - height2) / 2 * 2;
				top2 += diff / 2;
			}
	  		ltwhArrays.push(left,top,width,height);
	  		ltwhArrays.push(left2 - left + width2*left2_scale, top2 - top + height2*top2_scale,width2*width2_scale,height2*height2_scale);
	  		
	  		urls.push(teacher_url,url);
	  		snList.push(zhujianren,sn);
	  		volList.push(100,vol_fyr);
			ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList,0);		
		}
	}
}

function onEndHandup(){
	if(!fayanren) return;
	fayanren = null;

	/*$('#canvasDiv').css('height',canvasHeight);*/
	if(window.screen.height!=$(".hdM").height()){//当前非最大化
		showTt(false);
	}else{
		$('#canvasDiv').css('width','100%');
		var canvasHeight = $('#canvasDiv').width()*9/16;
		$('#canvasDiv').css('height',canvasHeight);
		$(".func").css("margin-left","-140px");
		$(".func_v_hb_box").css("bottom","80px");
		$(".func").css("bottom","25px");
	}
	if(!drawingDisabled){
		$('#main2').hide();

	}
	for (var i = 0; i < videoList.length; i++) {
		var videoStr = videoList[i];
		var str = videoStr.split("_");
		var	streamIndex = str[1];
		var winindex = str[2];
		ipcRenderer.send('removeWindow',str[0],streamIndex,winindex);
	}

	var left = $('.zscreen').offset().left;
	var top = $('.zscreen').offset().top;
	var width = $('.zscreen').width();
	var height = $('.zscreen').height();
	var ltwhArrays = new Array();
	var urls = new Array();
	var snList = new Array();
	var volList = new Array();
	ltwhArrays.push(left,top,width,height);
	urls.push(teacher_url);
	snList.push(zhujianren);
	volList.push(100);
	console.log("-------------onEndHandup--------");
	ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList,0);
}	
function changeColor(_color,type){
	fillStyle=_color;
	strokeStyle=_color;
	lineMode = type;
	$('#hb_color').css('background-color',_color);
}
function onStuVideoChange(data){
	console.log(data)
	//v_index 0:学生全景  1:板书
	var v_index = 0;
	switch(data){
		case 0:
			v_index = 0;
			break;
		case 1:
			v_index = 1;
			break
	}
	initDevice(v_index);
}

//v_index 0:学生全景  1:板书
function initDevice(v_index){
	var managerAddr = classroomModel.remoteAddr;
	var username = classroomModel.username;
	var password = classroomModel.password;
	var deviceId = classroomModel.deviceId;
	var dynamic = 'easyhao';
	Server.join(managerAddr,username,password,deviceId,dynamic,function(_token){
		var token = _token;
		console.log("token---"+token)
		Server.switchOutput(managerAddr,token,v_index,1,function(){
			console.log("ok");
			PTZ.camera = v_index;
			PTZ.home(managerAddr,token);
		});
	});
}