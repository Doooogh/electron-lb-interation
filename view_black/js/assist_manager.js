let webview ;
let speaker_id;
var fyr_new_streamindex;
var zjr_title;
var fyr_title;
var fyr_id;
var main_stream_index;
var classroomList = [];
var coursesUserList = remote.getGlobal("coursesUserList");
var setTimeoutNum;
var bitstream = '0';//0 低码流 1高码流
canvasTop = 75;
var isOpenCanvas = false;
var fullScreen = true;
var	canvas_backImg="";
var	canvasType;
jQuery.fn.extend({
    /**
     * 交换任意两个jQuery对象的位置
     * @param another
     */
    swap: function(another){
    	if(this.length == 0 || another.length == 0) return;
        var me = this;
        var cloneMe = me.clone();
        var temp = $('<span/>');
        another.before(temp);
        me.replaceWith(another);
        temp.replaceWith(cloneMe);
          changeVideo();
        return this;
    }
});

function _change_pip() {

}

function dbClick(){
	changeVideo();
	if(fullScreen){
		fullScreen = false;
		window.Electron.setWindowFull();
	}else{
		fullScreen = true;
		currentWindow.setFullScreen(false);
		window.Electron.setWindowOldSize();
	}
}

function _assist_dblclick(clientId) {
	var snId = null;
	if (clientId == speaker_id)
	{
		snId = zhujianren;
	}
	else
	{
		for (var i = 0; i < classroomList.length; ++i)
		{
			if (classroomList[i].client_id == clientId)
			{
				snId = classroomList[i].client_sn;
			}
		}
	}

	if (snId == null)
	{
		//alert("当前教室未接入");
		remote.dialog.showMessageBox({
            type:'info',
            title: '提示',
            message: '当前教室未接入',
            buttons:['ok']
          });  
		return;
	}
	if(setTimeoutNum){
		clearTimeout(setTimeoutNum);
	}
	if(!fayanren){
		request_on_stage(snId);
		closeHandTime = new Date();
	}else{
		var now = new Date();
		if(now.getTime() - closeHandTime.getTime()<=1000){
			//alert('请勿频繁切换，请稍后重试！');
		remote.dialog.showMessageBox({
            type:'info',
            title: '提示',
            message: '请勿频繁切换，请稍后重试！',
            buttons:['ok']
          }); 			
			return;
		}
		if(fayanren !=  snId){
			request_on_stage(snId);
			closeHandTime = new Date();
		}else{
			endHandup();
		}
	}
}
$(document).ready(function() {
	webview = document.querySelector('webview');
	currentWindow.setSkipTaskbar(false);
			$(".hdUL_2 li").each(function(index){
				if ( index > 12 ){ 
					$(this).remove();
				};
			});
		
			
			$(".icon_close").click(function(){
				 currentWindow.hide();
		         currentWindow.close();
		     });
			
			$(".icon_zoom").click(function(){
				changeVideo();
				if(fullScreen){
					fullScreen = false;
					window.Electron.setWindowFull();
				}else{
					fullScreen = true;
					currentWindow.setFullScreen(false);
					window.Electron.setWindowOldSize();
				}
			});
			$(".icon_narrow").click(function(){
				currentWindow.minimize();
			})

			
			$(".hdM ul li").dblclick(function(e){
					//alert("当前教室未接入");
				remote.dialog.showMessageBox({
		            type:'info',
		            title: '提示',
		            message: '当前教室未接入',
		            buttons:['ok']
	          	}); 				
			});
			
			
			var Num=""; 
			
			var lessonModel = remote.getGlobal("lessonModel");
			
			$('.lesson_name').html(lessonModel.lessonName);
			
			Server.getUserInfo(getUrlParam("id"),function(data){
				var classroomName;
				speaker_id = remote.getGlobal('lessonModel').course.teacherId;
				$('.zhujiangren').attr('id',speaker_id);
				if(remote.getGlobal('lessonModel').classroom){
					classroomName = remote.getGlobal('lessonModel').classroom.classroomName
					isClassroom = true;
					classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
				}
				
				if(!classroomName){
					classroomName = data.realname;
				}
				var _isSpeaker = true;
				if(window.Electron.remote.getGlobal('role') == 'manager'){
					_isSpeaker = false;
					classroomName = "辅助屏";
				}

				if(remote.getGlobal('lessonModel').classroom.bitstream){
					bitstream = remote.getGlobal('lessonModel').classroom.bitstream;
				}
				connect(classroomName,data.userId, remote.getGlobal("roomId"),'user','recordCastClient',[],'0',_isSpeaker,true);
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
							// break;
						}
					}
				});

			ipcRenderer.on('removehooks',function(event,sn,video_no){
					videoList = new Array();
				});
			ipcRenderer.on('display-metrics-changed',function(){
				changeVideo();
			});
			ipcRenderer.on('handUp',function(event,userId){
				 

				for (var i =peer_conn_list.length - 1; i >= 0; i--) {
				   	if(peer_conn_list[i].client_id == userId)
				   	{
				   		 if(!fayanren){
							request_on_stage(peer_conn_list[i].client_sn);
							closeHandTime = new Date();
						}else{

							if(fayanren !=  peer_conn_list[i].client_sn){
								request_on_stage( peer_conn_list[i].client_sn);
							}else{
								endHandup();
							}
						}
				   	}	
				}
			});

			ipcRenderer.on('moveWindow',function(event,result){
				console.log("moveWindow------"+result);
			});
			ipcRenderer.on('videoWindowDblClick',function(event,windowId){
				_assist_dblclick(windowId);
			});
			ipcRenderer.on('stopLive',function(event){
				ipcRenderer.send("stopLive");
			});
			ipcRenderer.on("savePip",function(event,pipData){
				sendToPeer("broadcast", JSON.stringify({"key":"pip","data":pipData,"save":1}));
			})

			ipcRenderer.on("changeVol",function(event,_vol){
				var _streamindex_list = new Array();
				var _vol_list = new Array();
				for (var i = 0; i < videoList.length; i++) 
				{
					var videoStr = videoList[i];
					var str = videoStr.split("_");
					var sn = str[0];
					var streamindex = str[1];
					if(sn == speaker_id){
						_vol = 100;
					}
					_streamindex_list.push(streamindex);
					_vol_list.push(_vol);
				}
				ipcRenderer.send('changeVolWindow',_streamindex_list,_vol_list);
			})
			ipcRenderer.on("recTime",function(event,recTime)
			{
				bottom_recTime(recTime);
			});

			ipcRenderer.on("closeWin",function(){
				var close = confirm("正在录制,是否停止并关闭窗口!","提示");
				if(close)
				{
					ipcRenderer.send("stopRec");
					currentWindow.close();
				}
			});
			/*ipcRenderer.on('escWindow',function(event){
					currentWindow.setFullScreen(false);
					fullScreen = true;
				
			});*/
			ipcRenderer.on('escWindow',function(event){
				var childWins = window.Electron.remote.getCurrentWindow().getChildWindows();
				for (var i = childWins.length - 1; i >= 0; i--) {
					if(childWins[i].getTitle() != 'childVideoWindow'){
						//当前页面包含打开的管理端子页面，
						return;
					}
				}
				changeVideo();
				if(!fullScreen){
					fullScreen = true;
					currentWindow.setFullScreen(false);
					window.Electron.setWindowOldSize();
				}
				
			});
			/*//推题传白板图片
			ipcRenderer.on('operCancas',function(event,fileName){
				ppt_name = '/wba';
				ppt_page = 0;
				var confData = window.Electron.readConf();
	            var filePath = confData.nginx+'/v0/mcu/'+fileName;
	            changeCanvas();
	            drawingDisabled = false;
	            var data = {
	              scope:'public',
	              from:my_mid,
	              to:'',
	              path:filePath
	            }
	            sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));
	            renderMainWhiteboard(3); 
			});	
			//关闭推题
			ipcRenderer.on('closeCanvas',function(event){
				    deleteCanvas();
					drawingDisabled = true;
					var data = {
						scope:'public',
						from:my_mid,
						to:'',
						path:''
					}
					sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));	
					whiteboard = new Array();
					renderMainWhiteboard(3); 
			});	*/
			
			/*$('div').resize(function(){	
				if(fayanren ==null )
				{
					for (var i = 0; i < videoList.length; i++) 
					{
						var videoStr = videoList[i];
						var str = videoStr.split("_");
						var sn = str[0];
						var streamindex = str[1];
						var winIndex = str[2];
						
						var vol = 100;
				  		if(sn == speaker_id)vol = 100;
						//hookormove(div_id,url,userId,vol,streamindex,winindex,move)
						hookormove(sn,null,null,vol,streamindex,winIndex,true);
					}
				}
				else
				{
					var peer = findRemotePeer(parseInt(fayanren));
					if(peer == null) return;
					for (var i = 0; i < videoList.length; i++) 
					{
						var videoStr = videoList[i];
						var str = videoStr.split("_");
						var sn = str[0];
						var streamindex = str[1];
						var winIndex = str[2];
						if($('#'+sn+' div').length ==0)break;

						var vol = 100;
						if(sn == peer.client_id){
							vol = 100;
						}else if(sn == speaker_id){
							val = 100;
						}
						hookormove(sn,null,null,vol,streamindex,winIndex,true);
					}
				}				
			});*/
		});
		function changeVideo(divList){
			setTimeout(function(){
				if(fayanren ==null )
					{
						for (var i = 0; i < videoList.length; i++) 
						{
							var videoStr = videoList[i];
							var str = videoStr.split("_");
							var sn = str[0];
							var streamindex = str[1];
							var winIndex = str[2];
							
							var vol = window.Electron.readConf().vol;
					  		if(sn == speaker_id){vol = 100}
							//hookormove(div_id,url,userId,vol,streamindex,winindex,move)
							hookormove(sn,null,null,vol,streamindex,winIndex,true);
						}
					}
					else
					{
						var peer = findRemotePeer(parseInt(fayanren));
						if(peer == null) return;
						var vol ;
						for (var i = 0; i < videoList.length; i++) 
						{
							var videoStr = videoList[i];
							var str = videoStr.split("_");
							var sn = str[0];
							var streamindex = str[1];
							var winIndex = str[2];
							if($('#'+sn+' div').length ==0)break;

							if(sn == peer.client_id){
								vol = 100;
							}else if(sn == speaker_id){
								vol = 100;
							}else{
								vol	= window.Electron.readConf().vol;
							}
							hookormove(sn,null,null,vol,streamindex,winIndex,true);
						}
					}		
			},200);
		}
		function hdkt_layout(){
			/*course_start_time();
			if(isClassroom){
				// var startTime = remote.getGlobal('lessonModel').startTime;
				// var endTime = remote.getGlobal('lessonModel').endTime;
				Server.startAVConf(classroomId,getUrlParam("token"),0,function(result){
					if(result.liveStatus == 3){
						//检查是否推流入会
						if(!is_send_url){
							var url = result.liveAddr.lo[0];
							if(bitstream == '1'){//默认低码流，
								url = result.liveAddr.hi[0];
							}
							var video_no = 0;
							in_url(video_no,url);
							is_send_url = true;
						}
					}
				})
			}*/
			bottom_init();
		}

		function changeLineWidth(_lineWidth,_this){
			lineWidth = _lineWidth;
			$(_this).siblings().removeClass("on");
			$(_this).addClass("on");
		}

		function renderMainWhiteboard(changeType) {
			var newWhiteboardName = null;
			/* board sequence: private > public. */
			for (var i = 0; i < whiteboard.length; ++i) {
				
				if (whiteboard[i].ppt_name == "/wba") /* public whiteboard */ {
					newWhiteboardName = whiteboard[i].ppt_name;
					break;
				}
			}

			if (ppt_name != newWhiteboardName || changeType == 3)
			{
				ppt_name = newWhiteboardName;
				ppt_page = 0;
				

				if (ppt_name == null) {
					$("#canvasDiv").hide();
					$(".zhujiangren").find(".main").css('top', "30px");
					$(".zhujiangren").find(".main").css('left', "0");
					$(".zhujiangren").find(".main").css('width', "100%");
					$(".zhujiangren").find(".main").css('height', "calc(100% - 30px)");
					$(".zhujiangren").find(".main").show();
					isOpenCanvas = false;
					drawingDisabled = true;
				} else {
					$("#canvasDiv").show();
					$(".zhujiangren").find(".main").css('top', "75%");
					$(".zhujiangren").find(".main").css('left', "75%");
					$(".zhujiangren").find(".main").css('width', "25%");
					$(".zhujiangren").find(".main").css('height', "25%");
	    			document.getElementById(currentDrawingId).width = $("#drawing").width();
	   				document.getElementById(currentDrawingId).height = $("#drawing").height();
					isOpenCanvas = true;
					drawingDisabled = false;
				}
				/*$('div').trigger('resize');*/
				changeVideo();
				renderAllPaths();
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
				renderMainWhiteboard(wbop);
			} else {
				if (wbIndex != -1) {
					var whiteboard2 = whiteboard[wbIndex];
					if (whiteboard2.ppt_name == ppt_name) {
						renderAllPaths();				
					}
				}
			}
		}

		function course_start_time(){
			sendToPeer("broadcast", JSON.stringify({"key":"startTime","data":new Date().getTime(),"save":1}));
		}

		function _addUser(authority_level,client_id,client_name,client_seq,client_sn,client_type,is_speaker,video_numbers,video_status){
			if(!window.Electron.readConf().vol&&window.Electron.readConf().vol!=0){
				 window.Electron.writeConf(['vol'],[30]);
			}
			console.log("client_id=" + client_id+";snId="+client_sn+";client_name="+client_name);
			var classroomObj = {"client_id":client_id,"client_name":client_name,"client_sn":client_sn};
			var inClassroom = false;
			for (var m = 0; m < classroomList.length; m++) 
			{
				if(classroomList[m].client_id ==client_id )
				{
					inClassroom = true;
					$('#'+client_id).attr("sn_Id",client_sn);
					classroomList[m].client_sn = client_sn;
					break;
				}
			}
			if(is_speaker){
				$('.zhujiangren').attr('id',speaker_id);
			}
			if(!inClassroom)
			{
				if(!is_speaker && client_name != "辅助屏")
				{
					classroomList.push(classroomObj);
					if(classroomList.length == 4)
					{
						appendLi5(classroomList);
						$(".sd").css("height","30px");
					}
					
					else if(classroomList.length == 6)
					{
						appendLi7(classroomList);
						$(".sd").css("height","30px");
					}
					else if(classroomList.length == 8)
					{
						appendLi12(classroomList);
						$(".sd").css("height","24px");
					}
					else
					{	
						var classroomId = "";
						for(var v=0;v<coursesUserList.length;v++)
						{
							if(coursesUserList[v].userId == client_id){
								classroomId=coursesUserList[v].classroomId;
							}
						}
						var manageHtml = '<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+client_id+'&classroomId='+classroomId+'\')"></a>';
				/*		$(".hdM ul li").eq(classroomList.length).find("h4").html(client_name+manageHtml);
						$(".hdM ul li").eq(classroomList.length).attr("id",client_id);
						$(".hdM ul li").eq(classroomList.length).attr("sn_id",client_sn);*/
						if($(".hdM ul li").eq(classroomList.length).attr("id")==null||$(".hdM ul li").eq(classroomList.length).attr("id")==""){
							$(".hdM ul li").eq(classroomList.length).find("h4").html(client_name+manageHtml);
							$(".hdM ul li").eq(classroomList.length).attr("id",client_id);
							$(".hdM ul li").eq(classroomList.length).attr("sn_id",client_sn);
						}else{
							$("#allRoom").find('li').each(function() {

								if($(this).attr("class")!="zhujianren"){
									if($(this).attr("id")==null||$(this).attr("id")==""){
										$(this).find("h4").html(client_name+manageHtml);
										$(this).attr("id",client_id);
										$(this).attr("sn_id",client_sn);
										return false;
									}
								}

							});

						}
						$(".sd").css("height","30px");
					}

				}
				for (var i = 0; i < videoList.length; i++) 
				{
					var videoStr = videoList[i];
					var str = videoStr.split("_");
					var sn = str[0];
					var streamindex = str[1];
					var winIndex = str[2];
					
					var vol = window.Electron.readConf().vol;
			  		if(sn == speaker_id){vol = 100};
					hookormove(sn,null,null,vol,streamindex,winIndex,true);
				}
			
			}
			
			console.log(videoList);
			for(var i=0; i<video_numbers; i++) {
				if(is_speaker){
					hdkt_subscribeVideo(client_sn,i,false,0,'',client_name);
				}
			}

			if(is_speaker){
				var conf = window.Electron.readConf();
				var pipData = {"pip":conf.pip,"stuUp":conf.stuUp}
				sendToPeer("broadcast", JSON.stringify({"key":"pip","data":pipData,"save":1}));
			}

   			if(canvasType == 3) {
					renderMainWhiteboard(canvasType);
					$('#canvasDiv').css('background-image','url('+canvas_backImg+')');

			}
			
		}

		 			

		function showWin(allVideos){
			var peer = findRemotePeer(parseInt(fayanren));
			if($('#allRoom .zhujiangren').length > 0 && peer){
					fyr_id = peer.client_id;
					var speaker_div = $('.zhujiangren');
					var fayanren_div =$('#'+peer.client_id);
				if($('#allRoom li').length<=8&&$('#allRoom .zhujiangren').index()==0){

					fayanren_div.swap(speaker_div);
				}else if($('#allRoom li').length>8&&$('#allRoom .zhujiangren').index()==1){

					fayanren_div.swap(speaker_div);
				}
				/*if(||$('#allRoom .zhujiangren').index()==1){
					
				}*/
				$(".icon_unhook").show();
			}
			for (var j = 0; j < videoList.length; j++) 
			{	var is_have = false;
				var snId = videoList[j].split("_");
				for(var i=0; i<allVideos.length; i++)
				{
					var _peer = findRemotePeer(allVideos[i].mcu_id);
					if(_peer.client_id == snId[0])
					{
						is_have = true;
						break;
					}
				}	
				if(!is_have)
				{
					if(snId[0] == speaker_id)
					{
						$('#'+snId[0]+' div:eq(0)').html("<img src='../img/img02.jpg' />");
					}
					else
					{
						$('#'+snId[0]+' div:eq(0)').html("<img src='../img/img04.jpg' />");
					}
					removeWindow(snId[0],snId[1]);
				}
			}
			for(var i=0; i<allVideos.length; i++)
			{
				var is_show = false;
				for (var j = 0; j < videoList.length; j++) 
				{
					var snId = videoList[j].split("_");
					var _peer = findRemotePeer(allVideos[i].mcu_id);
					if(_peer.client_id == snId[0])
					{
						is_show = true;
						break;
					}	
				}

				if(!is_show)
				{
					var _peer = findRemotePeer(allVideos[i].mcu_id);
					hookAllWindow(_peer.client_id,0,allVideos[i].sdp);
					
				}
			}
			
		}

		function hookSpeakerWindow(sn,video_no,url,move,streamindex,winIndex){
			
			zhujianren = sn;
			var peer = findRemotePeer(parseInt(sn));
			var lessonModel = remote.getGlobal("lessonModel")
			$("#"+speaker_id+" h4").attr('classroomId',lessonModel.classroomId);
			var classroomId = lessonModel.classroomId;
			zjr_title = peer.client_name+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+peer.client_id+'&classroomId='+classroomId+'\')"></a>';
			$("#"+speaker_id+" h4").html(zjr_title);
			$("#"+speaker_id+"").attr("sn_Id",peer.client_sn);
		
		}


		//上台
		function hookWindow(sn,streamindex,url,move,winIndex){
			$(".icon_unhook").show();

			var peer = findRemotePeer(sn);

			if(!fayanren)
			{	

				var speaker_div = $('[sn_id="'+zhujianren+'"]');
				var fayanren_div =$('[sn_id="'+sn+'"]');
				fayanren_div.swap(speaker_div);
			}else{
				$('[sn_id="'+fayanren+'"]').find("h4 font").remove();
				var fayanren_div = $('[sn_id="'+fayanren+'"]');
				var speaker_div1 = $('[sn_id="'+zhujianren+'"]');
				speaker_div1.swap(fayanren_div);
				var speaker_div2 = $('[sn_id="'+zhujianren+'"]');
				var sn_div = $('[sn_id="'+sn+'"]');
				speaker_div2.swap(sn_div);
			}
			fayanren = sn;

			var main_stream_index2,fayanren_stream;
			var vol ;

			for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				var str = videoStr.split("_");
				streamindex = str[1];
				winIndex =  str[2];
				
				if($('#'+str[0]+' div').length ==0)break;
				if(str[0] == speaker_id){
					main_stream_index2 = streamindex;
					vol = 100;
				}else if(str[0] == peer.client_id){
					fayanren_stream = streamindex;
					vol = 100;
				}else{
					vol = window.Electron.readConf().vol;
				}
				hookormove(str[0],null,null,vol,streamindex,winIndex,true);
			}
			ipcRenderer.send("switchPip",main_stream_index2,fayanren_stream,true);
			/*$('[sn_id="'+fayanren+'"]').find("h4").append("<font color='red'>(学生视频最大化)</font>");*/
			fayanrenVideoWindow();
			fyr_id = $("[sn_id='"+fayanren+"']").attr("id");
		}
		function fayanrenVideoWindow(){
			var userId = "";
			var videoPath = "";
			var name = "";
			for(var i = 0; i < peer_conn_list.length; i++){
				if(peer_conn_list[i].client_sn==fayanren){
					userId = peer_conn_list[i].client_id;
					name = peer_conn_list[i].client_name;
					break;
				}

			}
			for (var i = 0; i < allVideos.length; i++) {
				var _peer = findRemotePeer(allVideos[i].mcu_id);
				if(userId == _peer.client_id){
					videoPath = allVideos[i].sdp;
					break;
				}
			}
			ipcRenderer.send("fayanrenVideo",name,videoPath);
		}

		function onEndHandup(){
			if(!fayanren)return;
			
		    $(".icon_unhook").hide();
		    var speaker_div = $('[sn_id="'+zhujianren+'"]');
			var fayanren_div =$("#"+fyr_id);
			fayanren_div.swap(speaker_div);
			for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				var str = videoStr.split("_");
				streamindex = str[1];
				winIndex =  str[2];
				if(str[0] == speaker_id){
					hookormove(str[0],null,null,100,streamindex,winIndex,true);
				}else{
					hookormove(str[0],null,null,window.Electron.readConf().vol,streamindex,winIndex,true);
				}
				if(str[0] == speaker_id) {
					ipcRenderer.send("switchPip",streamindex,null,false);
				}
			}
		  	$('[sn_id="'+fayanren+'"]').find("h4 font").remove();
		  	ipcRenderer.send('close_fyrWindow');
			fayanren = null;
			fyr_id = null;
			sendToPeer("broadcast", JSON.stringify({"key":"on_stage_sn","data":"","save":1}));
	    }
		//下台
		function unhookWindow(sn,streamindex,url,move,winIndex){
		}

		function hookAllWindow(userId,streamindex,url,move,winIndex){
			if($('#'+userId+' div').length ==0) return;
			// $('#'+userId+' div img').remove();
			if(move){
				var vol = 100;
		  		if(sn == speaker_id){
			  		vol=100;
		  		}
				hookormove(userId,null,null,vol,streamindex,winIndex,true);
			}else{
				
				if(fayanren)
				{	
					var peer = findRemotePeer(parseInt(fayanren));
					
					if(userId == speaker_id)
					{
						hookormove(userId,url,userId,100,null,null,false);
					}
					else
					{
						hookormove(userId,url,userId,100,null,null,false);
					}
				}
				else
				{
			  		var vol = window.Electron.readConf().vol;
			  		if(userId == speaker_id){vol=100;}
					
					hookormove(userId,url,userId,vol,null,null,false);
				}
				
			}

		}

		function fullScreen(_this){
			ipcRenderer.send('fullScreen');
		}

		function removeWindow(userId,video_no){
			for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				if(videoStr.indexOf(userId+"_"+video_no) == 0){
					var winindex = videoStr.replace(userId+"_"+video_no+"_","");
					ipcRenderer.send('removeWindow',userId,video_no,winindex);
				}
			}
		}
		
		function appendLi12(classroomArr)
		{
				var zjr_title = "主讲教室";
				var zjr_snId = "";
				if(zhujianren)
				{
					var peer = findRemotePeer(parseInt(zhujianren));
					zjr_title = peer.client_name;
					zjr_snId = zhujianren;
				}
				/*var classroomId = "";
				for(var v=0;v<coursesUserList.length;v++)
				{
					if(coursesUserList[v].userId == speaker_id){
						classroomId=coursesUserList[v].classroomId;
					}
				}*/
				var str = '<ul class="hdUl hdUL_2" id="allRoom">';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li id="'+speaker_id+'" sn_id="'+zjr_snId+'" class="zhujiangren"><h4>'+zjr_title+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+speaker_id+'&classroomId='+classroomId+'\')"></a>'+'</h4><div class="main"><img src="../img/img02.jpg" /></div>';
				str +='<div id="canvasDiv" style="position: absolute;left:0;top:30px;width:100%;height:calc(100% - 30px);/*background: #ffffff;*/ display: none;background-size: 100% 100%;">';
				str +='		<div  style="/*background: #ffffff;*/ width:100%; height:100%">';
				str +='			<canvas id="drawing" class="avr_canvas_class" style="/*background: #ffffff;*/ width:100%; height:100%" ></canvas>';
				str +='		</div>';
				str +='	</div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='</ul>';
				$("#classroom_section").html(str);

				append_li(classroomArr,true)
		}
		function appendLi5(classroomArr)
		{
				var zjr_title = "主讲教室";
				var zjr_snId = "";
				if(zhujianren)
				{
					var peer = findRemotePeer(parseInt(zhujianren));
					zjr_title = peer.client_name;
					zjr_snId = zhujianren;
				}

				/*var classroomId = "";
				for(var v=0;v<coursesUserList.length;v++)
				{
					if(coursesUserList[v].userId == speaker_id){
						classroomId=coursesUserList[v].classroomId;
					}
				}
				*/
				var str = '<ul class="hdUl hdUL_1" id="allRoom">';
				str +='<li id="'+speaker_id+'" sn_id="'+zjr_snId+'" class="zhujiangren"><h4>'+zjr_title+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+speaker_id+'&classroomId='+classroomId+'\')"></a>'+'</h4><div class="main"><img src="../img/img02.jpg" /></div>';
				str +='<div id="canvasDiv" style="position: absolute;left:0;top:30px;width:100%;height:calc(100% - 30px);/*background: #ffffff;*/ display: none;background-size: 100% 100%;">';
				str +='		<div  style="/*background: #ffffff;*/ width:100%; height:100%">';
				str +='			<canvas id="drawing" class="avr_canvas_class" style="/*background: #ffffff;*/ width:100%; height:100%" ></canvas>';
				str +='		</div>';
				str +='	</div></li>';
				str += '<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str += '<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str += '<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str += '<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str += '<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str += '</ul>';
				$("#classroom_section").html(str);
				append_li(classroomArr);
		}

		function appendLi7(classroomArr)
		{
			var zjr_title = "主讲教室";
			var zjr_snId = "";
			if(zhujianren)
			{
				var peer = findRemotePeer(parseInt(zhujianren));
				zjr_title = peer.client_name;
				zjr_snId = zhujianren;
			}
			/*var classroomId = "";
			for(var v=0;v<coursesUserList.length;v++)
			{
				if(coursesUserList[v].userId == speaker_id){
					classroomId=coursesUserList[v].classroomId;
				}
			}
			*/
			var str ='<ul class="hdUl hdUL_4" id="allRoom">';
			str +='<li id="'+speaker_id+'" sn_id="'+zjr_snId+'" class="zhujiangren"><h4>'+zjr_title+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+speaker_id+'&classroomId='+classroomId+'\')"></a>'+'</h4><div class="main"><img src="../img/img02.jpg" /></div>';
			str +='<div id="canvasDiv" style="position: absolute;left:0;top:30px;width:100%;height:calc(100% - 30px);/*background: #ffffff;*/ display: none;background-size: 100% 100%;">';
			str +='		<div  style="/*background: #ffffff;*/ width:100%; height:100%">';
			str +='			<canvas id="drawing" class="avr_canvas_class" style="/*background: #ffffff;*/ width:100%; height:100%" ></canvas>';
			str +='		</div>';
			str +='	</div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
			str +='</ul>';
			$("#classroom_section").html(str);
			append_li(classroomArr);
		}

		function append_li(classroomArr,is12){
			
				for(var j=0;j<classroomArr.length;j++)
				{
					var liObj;
					if(j==0 && is12)
					{
						liObj = $(".hdM ul li").eq(j);
					}
					else
					{
						liObj = $(".hdM ul li").eq((j+1));
					}
					var classroomId = "";
					for(var v=0;v<coursesUserList.length;v++)
					{
						if(coursesUserList[v].userId == classroomArr[j].client_id){
							classroomId=coursesUserList[v].classroomId;
						}
					}

					liObj.find("h4").html(classroomArr[j].client_name+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+classroomArr[j].client_id+'&classroomId='+classroomId+'\')"></a>');
					liObj.attr("id",classroomArr[j].client_id);
					liObj.attr("sn_id",classroomArr[j].client_sn);
				}
				$(".hdM ul li").dblclick(function(e){
					//alert("当前教室未接入");
					remote.dialog.showMessageBox({
			            type:'info',
			            title: '提示',
			            message: '当前教室未接入',
			            buttons:['ok']
		          	}); 					
				})
		}
		function getCourseStartTime(time)
		{
			webview.executeJavaScript(`Tools.setLiveTime('__startTime',${time})`);
		}

		function _deleteUser(client_sn){
			
			if(fayanren==client_sn){
					var speaker_div = $('.zhujiangren');
					var fayanren_div =$('[sn_id="'+client_sn+'"]');
					fayanren_div.swap(speaker_div);
			}
			$('[sn_id="'+client_sn+'"] h4').html('');
			$('[sn_id="'+client_sn+'"]').attr('id','');
			$('[sn_id="'+client_sn+'"]').attr('sn_id','');
			for(var i = 0;i<classroomList.length;i++){
				if(classroomList[i].client_sn == client_sn){
					classroomList.splice(i,1);
					break;
				}
			}
			

		}
		function hdkt_on_stage(sn, video_no) 
		{
			hdkt_subscribeVideo(sn, video_no, false, 0, "", "");
		}

		function hookormove(div_id,url,userId,vol,streamindex,winIndex,move)
		{
			var left =$('#'+div_id+' .main').offset().left;
			var top = $('#'+div_id+' .main').offset().top;
			var width = $('#'+div_id+' .main').width();
			var height = $('#'+div_id+' .main').height();

			//console.log(left);
			if(!move)
			{
				var ltwhArrays = new Array();
				var urls = new Array();
				var snList = new Array();
				var volList = new Array();
		  		
		  		ltwhArrays.push(left,top,width,height);
		  		urls.push(url);
		  		snList.push(userId);
		  		volList.push(vol);
				
				ipcRenderer.send('hookWindow',ltwhArrays,urls,snList,volList, userId);
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
			  	volList.push(vol);//声音0-100
		  		
				ipcRenderer.send('moveWindow',ltwhArrays,streamindexList,winIndexList,volList);
			}

		}

function change_rec_status(status)
{
	if(status == "start")
	{
		$(".icon_lz_manager").addClass("on");
		//ipcRenderer.send("startRec",1280,720);
	}
	else
	{
	/*	if(remote.getGlobal("isRec"))
		{}*/
			$(".icon_lz_manager").removeClass("on");
			//ipcRenderer.send("stopRec");
			//$(".icon_lz").html("00:00:00");
		
		
	}
}

function on_bc_share_doc(data){
	if(data.scope == 'public'){
		if(data.path != ''){
			$('#canvasDiv').css('background-image','url('+data.path+')');
			canvas_backImg = data.path;
			canvasType = 3;
		}else{
			$('#canvasDiv').css('background-image','');
			canvas_backImg = "";
			canvasType = 1
		}
	}
}

function initFayanren(_fayanren){
	closeHandTime = new Date();
}
