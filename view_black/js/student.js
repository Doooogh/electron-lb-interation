var currentWindow = remote.getCurrentWindow();
let webview ;
let teacher_url;
var setTimeoutNum;
var isSetTime;
var bitstream = '0';//0 低码流 1高码流
var isQp = false;//true 全屏 false 窗口化
function createFullScreen(){//全屏
	// currentWindow.setFullScreen(true);
	window.Electron.setWindowFull();
	canvasTop = 0;
	$(".hdM").css("height","100%");
	$(".hdT").hide();
	$(".hdB").hide();
	currentWindow.setMaximizable(false);
	isQp = true;
	changeVideo();
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
	changeVideo();
}
let classroomModel ;
createFullScreen();
$(document).ready(function() {
	webview = document.querySelector('webview');
	currentWindow.setSkipTaskbar(false);
	Server.getUserInfo(getUrlParam("id"),function(data){
		var classroomName ;
		var userList = remote.getGlobal('coursesUserList');
		var is_hav = false;
		
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
	})

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

	ipcRenderer.on('stopLive',function(event){
		
		ipcRenderer.send("stopLive");
	});

	ipcRenderer.on('display-metrics-changed',function(){
		changeVideo();
	})

	$('.icon_close').click(function(){
		currentWindow.close()
	});
	
	$('.icon_zoom').click(function(){
		if(currentWindow.isFullScreen()){
			currentWindow.setFullScreen(false);
        	$(".hdT").show();
			$(".hdB").show();
			setTimeout(function(){
			$(".hdM").css("height", "calc(100% - 90px)");
			},100);
			
		}else{
			createFullScreen();
		}
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
		changeVideo();
	});
	$('.icon_narrow').click(function(){
		currentWindow.minimize();
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
					
					lineMode = 'choose';
				});//橡皮
		});

		$(".func_v_qp").click(function(){//删除白板线
			resetEverything();
		});

});

function hdkt_layout(){
	if(isClassroom){
		Server.startAVConf(classroomId,getUrlParam("token"),0,function(result){
			if(result.liveStatus == 3){
				//检查是否推流入会
				// if(!is_send_url){
					var url = result.liveAddr.lo[0];
					if(bitstream == '1'){//默认低码流，
						url = result.liveAddr.hi[0];
					}
					var video_no = 0;
					in_url(video_no,url);
					is_send_url = true;

				// }
			}
		})
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
				//结束推题
				if(fayanren) {
					$('.main2').css('top','0')
					$('.main2').css('left','50%')
					$('.main2').css('width','50%');
					$('.main2').css('height','100%');
					$('.main1').show();
					$('.main1').css('top','0');
					$('.main1').css('width','50%');
				}else{
					$('.main2').css('top','0')
					$('.main2').css('left','0')
					$('.main2').css('width','100%');
					$('.main2').css('height','100%');
				}
				$("#canvasDiv").hide();
			} else {
				//推题
				if(fayanren) {
					$('.main2').css('left','50%');
					$('.main2').css('top','50%');
					$('.main2').css('width','50%');
					$('.main2').css('height','50%');
					$('#canvasDiv').css('left','50%')
					$('#canvasDiv').css('width','50%');
					$('#canvasDiv').css('height','50%');
					$('.main1').show();
					$('.main1').css('top','0');
					$('.main1').css('width','50%');
				}else{
					$(".main2").css('left', "74%");
					$(".main2").css('top', "74%");
					$(".main2").css('width', "25%");
					$(".main2").css('height', "25%");
					$('#canvasDiv').css('left','0')
					$('#canvasDiv').css('width','100%');
					$('#canvasDiv').css('height','100%');
				}
				$("#canvasDiv").show();
				hdkt_turn_to_page("public");
    			document.getElementById(currentDrawingId).width = $("#drawing").width();
   				document.getElementById(currentDrawingId).height = $("#drawing").height();

			}
			renderAllPaths();
			changeVideo();
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
			$('.avr_canvas_div_class').css('background-image','url('+data.path+')');
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
	if(is_speaker){
		$('.main2').attr('sn_id',client_sn);
	}
}

function _deleteUser(client_sn){
	for (var i = 0; i < videoList.length; i++) {
		var videoStr = videoList[i];
		var str = videoStr.split("_");
		var _sn = str[0];
		var streamindex = str[1];
		var winIndex = str[2];
		if(client_sn == _sn){
			ipcRenderer.send('removeWindow',str[0],streamindex,winIndex);
		}
	}
}

function getCourseStartTime(_startTime){
	webview.executeJavaScript(`Tools.setLiveTime('__startTime',${_startTime})`);
}

function hookSpeakerWindow(sn,video_no,url,move,streamindex,winIndex,call_by_resize){
	teacher_url = teacher_url ? teacher_url : url;
	zhujianren = zhujianren ? zhujianren : sn;
	var canvasDiv_display = $("#canvasDiv").css("display");
	if(canvasDiv_display == 'none'){
		if(fayanren) {
			$('.main2').css('top','0')
			$('.main2').css('left','50%')
			$('.main2').css('width','50%');
			$('.main2').css('height','100%');
		}else{
			$('.main2').css('top','0')
			$('.main2').css('left','0')
			$('.main2').css('width','100%');
			$('.main2').css('height','100%');
		}
	}else{
		if(fayanren) {
			$('.main2').css('left','50%');
			$('.main2').css('top','50%');
			$('.main2').css('width','50%');
			$('.main2').css('height','50%');
			$('#canvasDiv').css('left','50%')
			$('#canvasDiv').css('width','50%');
			$('#canvasDiv').css('height','50%');
		}else{
			$(".main2").css('left', "74%");
			$(".main2").css('top', "74%");
			$(".main2").css('width', "25%");
			$(".main2").css('height', "25%");
			$('#canvasDiv').css('left','0')
			$('#canvasDiv').css('width','100%');
			$('#canvasDiv').css('height','100%');
		}
	}

	if(fayanren){
		showFayanren(fayanren);
	}

	var left = $('[sn_id="'+sn+'"]').offset().left;
	var top = $('[sn_id="'+sn+'"]').offset().top;
	var width = $('[sn_id="'+sn+'"]').width();
	var height = $('[sn_id="'+sn+'"]').height();
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
		var ltwhArrays = new Array();
		var urls = new Array();
		var snList = new Array();
		var volList = new Array();
  		ltwhArrays.push(left,top,width,height);
  		urls.push(url);
  		snList.push(sn);
  		volList.push(100);
  		console.log('hookSpeakerWindow:url='+url)
		ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList,'main2');
	}
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

function showFayanren(_sn){
	var url = '';
	for (var i = 0; i < allVideos.length; i++) {
		if(allVideos[i].mcu_id == _sn){
			url = allVideos[i].sdp;
		}
	}
	hookWindow(_sn,null,url,false,null);
}

//发言人
function hookWindow(sn,streamindex,url,move,winIndex,isSetTime){
	fayanren = sn;
	$('.main1').attr('sn_id',fayanren);
	var canvasDiv_display = $("#canvasDiv").css("display");
	if(canvasDiv_display == 'none'){
		$('.main2').css('top','0')
		$('.main2').css('left','50%')
		$('.main2').css('width','50%');
		$('.main2').css('height','100%');
	}else{
		$('.main2').css('left','50%');
		$('.main2').css('top','50%');
		$('.main2').css('width','50%');
		$('.main2').css('height','50%');
		$('#canvasDiv').css('left','50%')
		$('#canvasDiv').css('width','50%');
		$('#canvasDiv').css('height','50%');
	}
	$('.main1').show();
	$('.main1').css('top','0');
	$('.main1').css('width','50%');
	console.log('fayanren:'+fayanren+'   sn:'+sn)
	if($('[sn_id="'+sn+'"]').length == 0) return;
	var left = $('[sn_id="'+sn+'"]').offset().left;
	var top = $('[sn_id="'+sn+'"]').offset().top;
	var width = $('[sn_id="'+sn+'"]').width();
	var height = $('[sn_id="'+sn+'"]').height();
	

	for (var i = 0; i < videoList.length; i++) {
		var videoStr = videoList[i];
		var str = videoStr.split("_");
		var _sn = str[0];
		var streamindex = str[1];
		var winIndex = str[2];
		if(zhujianren != _sn){
			ipcRenderer.send('removeWindow',str[0],streamindex,winIndex);
		}
	}

	var ltwhArrays = new Array();
	var urls = new Array();
	var snList = new Array();
	var volList = new Array();
	ltwhArrays.push(left,top,width,height);
	urls.push(url);
	snList.push(sn);
	var vol = 100;
	if(sn == my_mid) vol = 0;
	volList.push(vol);
	ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList,'main1');
	changeVideo();
}

function moveWindow(sn,streamindex,winIndex){
	if($('[sn_id="'+sn+'"]').length == 0) return;
	var left = $('[sn_id="'+sn+'"]').offset().left;
	var top = $('[sn_id="'+sn+'"]').offset().top;
	var width = $('[sn_id="'+sn+'"]').width();
	var height = $('[sn_id="'+sn+'"]').height();
	var ltwhArrays = new Array();
	var streamindexList = new Array();
	var winIndexList = new Array();
	var volList = new Array();
	ltwhArrays.push(left,top,width,height);
	streamindexList.push(streamindex);
	winIndexList.push(winIndex);
	var vol = 100;
	if(sn == my_mid) vol = 0;
	volList.push(vol);
	ipcRenderer.send('moveWindow',ltwhArrays,streamindexList,winIndexList,volList);
	
}

function onEndHandup(){
	if(!fayanren) return;
	fayanren = null;

	for (var i = 0; i < videoList.length; i++) {
		var videoStr = videoList[i];
		var str = videoStr.split("_");
		var sn = str[0];
		var streamindex = str[1];
		var winIndex = str[2];
		if(zhujianren != sn){
			ipcRenderer.send('removeWindow',str[0],streamindex,winIndex);
		}
	}
	var canvasDiv_display = $("#canvasDiv").css("display");
	if(canvasDiv_display == 'none'){
		$('.main1').hide();
		$('.main2').css('left','0');
		$('.main2').css('top','0');
		$('.main2').css('width','calc(100% - 20px)');
	}else{
		$('.main2').css('left','75%');
		$('.main2').css('top','75%');
		$('.main2').css('width','25%');
		$('.main2').css('height','25%');
		$('#canvasDiv').css('left','0')
		$('#canvasDiv').css('width','100%');
		$('#canvasDiv').css('height','100%');
	}
	changeVideo();
}

function changeVideo(divList){
	setTimeout(function(){
		for (var i = 0; i < videoList.length; i++) 
		{
			var videoStr = videoList[i];
			var str = videoStr.split("_");
			var sn = str[0];
			var streamindex = str[1];
			var winIndex = str[2];
			moveWindow(sn,streamindex,winIndex);
		}
	},200);
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
