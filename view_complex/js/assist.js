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
var	canvas_backImg="";
var	canvasType;
var plan = window.Electron.readConf().plan;
var userId,classroomName,deviceId,managerAddr,username,password,rmanager_token;
var dynamic = "ehrec";
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
        drawingCxt = document.getElementById(currentDrawingId).getContext("2d");
    	drawingCxt.strokeStyle = "#FFFFFF";
    	renderAllPaths();
    	changeVideo();
        return this;
    }
});

function _change_pip() {

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
            message: '当前教室未接入!',
            buttons:['ok']
        });  
		return;
	}
	if(setTimeoutNum){
		clearTimeout(setTimeoutNum);
	}
	var pipData = window.Electron.readConf();
	if(!fayanren){
		request_on_stage(snId);
		closeHandTime = new Date();
		if(!drawingDisabled){
			Tools.pip_vga_no();
		}else{
			
			switch(pipData.pip)
			{
				case 1:
				    
				    if(pipData.stuUp > 0)
				    {
				    	Tools.student_2_1_pip_vga_stu_max();
				    	setTimeoutNum = setTimeout(function(){
							Tools.student_2_1_pip_vga_max();
							_change_pip();
				    	},pipData.stuUp);
				    }else
				    {
				    	Tools.student_2_1_pip_vga_max();
				    }
				    
				    break;
				case 2:
				 	
				 	 if(pipData.stuUp > 0)
				    {
				    	Tools.student_3_1_pip_vga_stu_max();
				    	setTimeoutNum = setTimeout(function(){
							Tools.student_3_1_pip_vga_max();
							_change_pip();
				    	},pipData.stuUp);
				    }else
				    {
				    	Tools.student_3_1_pip_vga_max();
				    }
					break;
				default:
					 if(pipData.stuUp > 0)
				    {
				    	Tools.student_pip_vga_stu_max();
				    	setTimeoutNum = setTimeout(function(){
							Tools.student_pip_vga_max();
							_change_pip();
				    	},pipData.stuUp);
				    }else
				    {
				    	Tools.student_pip_vga_max();
				    }
			}
		}
	

		
	}else{

		var now = new Date();
		if(closeHandTime && (now.getTime() - closeHandTime.getTime() <= pipData.stuUp)){
			//alert('暂不能切换发言，请稍后重试！');
			remote.dialog.showMessageBox({
			    type:'info',
			    title: '提示',
			    message: '暂不能切换发言，请稍后重试！',
			    buttons:['ok']
			});	 
			return;
		}
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
			closeHandTime = new Date();
			request_on_stage(snId);
			if(!drawingDisabled){
				Tools.pip_vga_no();
			}else{
				switch(pipData.pip)
				{
					case 1:
					    
					    if(pipData.stuUp > 0)
					    {
					    	Tools.student_2_1_pip_vga_stu_max();
					    	setTimeoutNum = setTimeout(function(){
								Tools.student_2_1_pip_vga_max();
								_change_pip();
					    	},pipData.stuUp);
					    }else
					    {
					    	Tools.student_2_1_pip_vga_max();
					    }
					    
					    break;
					case 2:
					 	
					 	 if(pipData.stuUp > 0)
					    {
					    	Tools.student_3_1_pip_vga_stu_max();
					    	setTimeoutNum = setTimeout(function(){
								Tools.student_3_1_pip_vga_max();
								_change_pip();
					    	},pipData.stuUp);
					    }else
					    {
					    	Tools.student_3_1_pip_vga_max();
					    }
						break;
					default:
						 if(pipData.stuUp > 0)
					    {
					    	Tools.student_pip_vga_stu_max();
					    	setTimeoutNum = setTimeout(function(){
								Tools.student_pip_vga_max();
								_change_pip();
					    	},pipData.stuUp);
					    }else
					    {
					    	Tools.student_pip_vga_max();
					    }
				}
			}	
		}else{
			endHandup();
			Tools.pip_vga_max();
		}
	}
	
}
var fullScreen = true;
$(document).ready(function() {
	if(plan=="a"){
		$("#plan").show();
	}else{
		$("#plan").hide();
	}
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
			ipcRenderer.on('display-metrics-changed',function(){
				changeVideo();
			});
			
			$(".hdM ul li").dblclick(function(e){
					//alert("当前教室未接入");
					remote.dialog.showMessageBox({
			            type:'info',
			            title: '提示',
			            message: '当前教室未接入!',
			            buttons:['ok']
			        }); 
			});
			//连接mcu
			var Num=""; 
			if(remote.getGlobal("hdType")=="inner"){//内网直播
				bitstream=remote.getGlobal("bitstream");//内网默认高码流
				classroomId = remote.getGlobal("in_clientId");//教室ID
				deviceId = remote.getGlobal("deviceId");
				classroomName = remote.getGlobal('in_clientName');
				managerAddr = remote.getGlobal('rmanager');
				username = remote.getGlobal('recName');
				password = remote.getGlobal('recPwd');
				$('.lesson_name').html(remote.getGlobal("courseName"));
				speaker_id = remote.getGlobal("in_clientId");
				$('.zhujiangren').attr('id',speaker_id);

				Server.join(managerAddr,username,password,deviceId,dynamic,function(_token){
					rmanager_token = _token;
					
				});
				connect(classroomName,speaker_id, remote.getGlobal("roomId"),'user','recordCastClient',[],'0',true,true);
					isClassroom = true;
			}else{//外网直播
			var lessonModel = remote.getGlobal("lessonModel");
			
			$('.lesson_name').html(lessonModel.lessonName);
				classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
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
				connect(classroomName,data.userId, remote.getGlobal("roomId"),'user','recordCastClient',[],'0',true,true);
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
							// break;
						}
					}
				});

			ipcRenderer.on('removehooks',function(event,sn,video_no){
					videoList = new Array();
				});

			ipcRenderer.on('handUp',function(event,userId){
				
				for (var i =peer_conn_list.length - 1; i >= 0; i--) {
				   	if(peer_conn_list[i].client_id == userId)
				   	{
				   		 if(!fayanren){
							request_on_stage(peer_conn_list[i].client_sn);
							closeHandTime = new Date();
							Tools.student_pip_vga_max();
						}else{

							if(fayanren !=  peer_conn_list[i].client_sn){
								request_on_stage( peer_conn_list[i].client_sn);
							}else{

								endHandup();
								Tools.pip_vga_max();
							}
						}
				   	}	
				}
			});

			ipcRenderer.on('moveWindow',function(event,result){
				window.Electron.log("assist.js:moveWindow",result);
				console.log("moveWindow------"+result);
			});
			ipcRenderer.on('videoWindowDblClick',function(event,windowId){
				_assist_dblclick(windowId);
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
					_streamindex_list.push(streamindex);
					if(sn == speaker_id){
						_vol_list.push(0);
					}else{
						_vol_list.push(_vol);
					}
					
					
				}
				ipcRenderer.send('changeVolWindow',_streamindex_list,_vol_list);
			})
			ipcRenderer.on("updatePlan",function(event,_plan){
				plan=_plan;
				if(_plan=="a"){
					$("#plan").show();
					passageway = 5;
				}else{
					$("#plan").hide();
					passageway = 4;
				}
				sendToPeer("broadcast", JSON.stringify({"key":"updatePlanInfo","data":_plan}));
			});	
			
			ipcRenderer.on("recTime",function(event,recTime)
			{
				bottom_recTime(recTime);
			});

			ipcRenderer.on("closeWin",function(){
				var close = confirm("正在录制,是否停止并关闭窗口!","提示");
				if(close)
				{
					ipcRenderer.send("stopRec");
					sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
					currentWindow.close();
				}
			});
			ipcRenderer.on('escWindow',function(event){
				changeVideo();
				if(!fullScreen){
					fullScreen = true;
					currentWindow.setFullScreen(false);
					window.Electron.setWindowOldSize();
				}
			});
			//currentWindow.setFullScreen(true);
		
		});
		function updatePlanInfo(_plan){
			plan=_plan;
			window.Electron.writeConf(["plan"],[_plan]);
			if(_plan=="a"){
				$("#plan").show();
				passageway = 5;
			}else{
				$("#plan").hide();
				passageway = 4;
			}

		}
		function changeVideo(divList){
			setTimeout(function(){
				var zjliId = $('[sn_id="'+zhujianren+'"]').attr("id");
				var fyrliId = $('[sn_id="'+fayanren+'"]').attr("id");
				var vol = window.Electron.readConf().vol;
				if(divList){
					for (var d = 0; d < divList.length; d++) {
						for (var i = 0; i < videoList.length; i++) 
						{
							var videoStr = videoList[i];
							var str = videoStr.split("_");
							var sn = str[0];
							var streamindex = str[1];
							var winIndex = str[2];
							if($('#'+sn+' div').length ==0)break;
							if(divList[d] == sn){
								if(zjliId==sn){
									hookormove(sn,null,null,0,streamindex,winIndex,true);
								}else if(fyrliId==sn){
									hookormove(sn,null,null,100,streamindex,winIndex,true);
								}else{
									hookormove(sn,null,null,vol,streamindex,winIndex,true);
								}
								
							}
						}
					}
				}else{
					for (var i = 0; i < videoList.length; i++) 
					{
						var videoStr = videoList[i];
						var str = videoStr.split("_");
						var sn = str[0];
						var streamindex = str[1];
						var winIndex = str[2];
						if($('#'+sn+' div').length ==0)break;
						
						if(zjliId==sn){
							hookormove(sn,null,null,0,streamindex,winIndex,true);
						}else if(fyrliId==sn){
							hookormove(sn,null,null,100,streamindex,winIndex,true);
						}else{
							hookormove(sn,null,null,vol,streamindex,winIndex,true);
						}
						
					}
				}
			},200);
		}

		function hdkt_layout(){
			course_start_time();
			if(isClassroom){
				Server.startAVConf(classroomId,rmanager_token,0,function(result){
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
							// initVoice();//初始化声控
						}
					}
				})
			}
			bottom_init();
		}


		function initVoice(){
			Voice.startConvert(classroomId,getUrlParam("token"),function(result){
				console.log(result);
				//window.Electron.ipcRenderer.send('openMsg',result.msg);
				switch(result.tag){
					case Voice.VGA_NO:
						Tools.pip_vga_no();
						break;
					case Voice.VGA_ONLY:
						Tools.pip_vga_one();
						break;
					case Voice.VGA_MAX:
						Tools.pip_vga_max();
						break;
					case Voice.VGA_MIN:
						Tools.pip_vga_min();
						break;
					case Voice.REC_START://开始录制
						if($(".icon_lz").hasClass("on")==false){
							window.Electron.ipcRenderer.send('openMsg',"开始录制");
							$(".icon_lz").addClass('on');
							var mianStrIndex = "";
							for (var i = 0; i < videoList.length; i++) 
								{
									var videoStr = videoList[i];
									var str = videoStr.split("_");
									var sn = str[0];
									var streamindex = str[1];
									var winIndex = str[2];
									if(sn==my_id){
										mianStrIndex = streamindex;
										break;
									}
									
								}
							window.Electron.ipcRenderer.send("startRec",1280,720,mianStrIndex);
							sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"start","save":1}));
						}

						break;
					case Voice.REC_STOP://结束录制
						if($(".icon_lz").hasClass("on")==true){
							window.Electron.ipcRenderer.send('openMsg',"结束录制");
							$(".icon_lz").removeClass("on");
							window.Electron.ipcRenderer.send("stopRec");
							$(".icon_lz").html("00:00:00");
							sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
						}
						break;
					case Voice.CANVAS_START://打开推题
						//开始推题
						//window.Electron.ipcRenderer.send("OpenOrCloseCanvas",true);//打开推题
						if(canvasType!=3){
							window.Electron.ipcRenderer.send('openMsg',"开始推题");
							sendToPeer("broadcast", JSON.stringify({"key":"openOrCloseCanvas","data":true}));
						}
						break;
					case Voice.CANVAS_STOP://结束推题
						//结束推题
						//window.Electron.ipcRenderer.send("OpenOrCloseCanvas",false);//打开推题
						if(canvasType==3){
							window.Electron.ipcRenderer.send('openMsg',"结束推题");
							sendToPeer("broadcast", JSON.stringify({"key":"openOrCloseCanvas","data":false}));	
						}
						
						break;
					case Voice.STAGE_ON://学生上台
						for (var i = 0; i < peer_conn_list.length; i++) {
							if(result.msg.indexOf(peer_conn_list[i].client_name) >= 0 ){
								if(fayanren){
									if(fayanren!=peer_conn_list[i].client_sn){
										//request_on_stage(peer_conn_list[i].client_sn);
										_assist_dblclick(peer_conn_list[i].client_id);
										window.Electron.ipcRenderer.send('openMsg',peer_conn_list[i].client_name+"上台");
										break;
									}	
								}else{
									//request_on_stage(peer_conn_list[i].client_sn);
									_assist_dblclick(peer_conn_list[i].client_id);
									window.Electron.ipcRenderer.send('openMsg',peer_conn_list[i].client_name+"上台");
									break;
								}
								
							}
						}
						break;
					case Voice.STAGE_OFF://结束发言
						if(fayanren!=null){
							window.Electron.ipcRenderer.send('openMsg',"结束发言");
							Tools.pip_vga_max();
							endHandup();
						}
						break;
				}
			});
		}

		function changeLineWidth(_lineWidth,_this){
			lineWidth = _lineWidth;
			$(_this).siblings().removeClass("on");
			$(_this).addClass("on");
		}

		function renderMainWhiteboard(changeType) {
			var newWhiteboardName = null;
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
					drawingDisabled = true;
				} else {
					$("#canvasDiv").show();
					$(".zhujiangren").find(".main").css('top', "75%");
					$(".zhujiangren").find(".main").css('left', "75%");
					$(".zhujiangren").find(".main").css('width', "25%");
					$(".zhujiangren").find(".main").css('height', "25%");
	    			document.getElementById(currentDrawingId).width = $("#drawing").width();
	   				document.getElementById(currentDrawingId).height = $("#drawing").height();
					drawingDisabled = false;
				}
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
			if(client_name.indexOf("web_")==0||client_name.indexOf("phone_")==0){
				return false;
			}
			if(!window.Electron.readConf().vol&&window.Electron.readConf().vol!=0){
				 window.Electron.writeConf(['vol'],[30]);
			}
			window.Electron.log("assist.js:_addUser","client_id=" + client_id+";sn_id="+client_sn+";client_name="+client_name);
			//console.log("client_id=" + client_id+";sn_id="+client_sn+";client_name="+client_name);
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
			if(!inClassroom)
			{
				if(!is_speaker && client_name != "辅助屏")
				{
					classroomList.push(classroomObj);
					if(classroomList.length == 4)
					{
						appendLi5(classroomList);
					}
					
					else if(classroomList.length == 6)
					{
						appendLi7(classroomList);
					}
					else if(classroomList.length == 8)
					{
						appendLi12(classroomList);
					}
					else
					{
						var classroomId = "";
					/*	for(var v=0;v<coursesUserList.length;v++)
						{
							if(coursesUserList[v].userId == client_id){
								classroomId=coursesUserList[v].classroomId;
							}
						}*/
						var manageHtml = "";
						if($(".hdM ul li").eq(classroomList.length).attr("id")==null||$(".hdM ul li").eq(classroomList.length).attr("id")==""){
							$(".hdM ul li").eq(classroomList.length).find("h4").html(client_name);
							$(".hdM ul li").eq(classroomList.length).attr("id",client_id);
							$(".hdM ul li").eq(classroomList.length).attr("sn_id",client_sn);
						}else{
							$("#allRoom").find('li').each(function() {

								if($(this).attr("class")!="zhujianren"){
									if($(this).attr("id")==null||$(this).attr("id")==""){
										$(this).find("h4").html(client_name);
										$(this).attr("id",client_id);
										$(this).attr("sn_id",client_sn);
										return false;
									}
								}

							});

						}
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
			  		if(sn == speaker_id){
			  			vol = 0;
			  		} else if(sn==fyr_id){
			  			vol = 100;
			  		}
			  		console.log("sn:"+sn+";vol:"+vol);
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
			console.log("fayanren="+fayanren);
			var peer = findRemotePeer(parseInt(fayanren));
			if($('#allRoom .zhujiangren').length > 0 && peer){
					var speaker_div = $('.zhujiangren');
					var fayanren_div =$('#'+peer.client_id);
					fyr_id = peer.client_id;
				if($('#allRoom li').length<=8&&$('#allRoom .zhujiangren').index()==0){

					fayanren_div.swap(speaker_div);
				}else if($('#allRoom li').length>8&&$('#allRoom .zhujiangren').index()==1){

					fayanren_div.swap(speaker_div);
				}

				$(".icon_unhook").show();
			}

			for (var j = 0; j < videoList.length; j++) 
			{

				var is_have = false;
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
			var lessonModel = remote.getGlobal("lessonModel");
			var classroomId =""
			if(remote.getGlobal("hdType")=="inner"){
				classroomId = remote.getGlobal('in_clientId');
			}else{
				classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
			}
			$("#"+speaker_id+" h4").attr('classroomId',classroomId);
			//var classroomId = lessonModel.classroomId;
			zjr_title = peer.client_name;/*+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+peer.client_id+'&classroomId='+classroomId+'\')"></a>';*/
			$("#"+speaker_id+" h4").html(zjr_title);
			$("#"+speaker_id+"").attr("sn_Id",peer.client_sn);
		
		}


		//上台
		function hookWindow(sn,streamindex,url,move,winIndex){
			$(".icon_unhook").show();

			var peer = findRemotePeer(sn);
			var loFyanren = $('[sn_id="'+fayanren+'"]').attr("id");
			if(!fayanren)
			{
				var speaker_div = $('[sn_id="'+zhujianren+'"]');
				var fayanren_div =$('[sn_id="'+sn+'"]');
				fayanren_div.swap(speaker_div);
			}else{
				var fayanren_div = $('[sn_id="'+fayanren+'"]');
				var speaker_div1 = $('[sn_id="'+zhujianren+'"]');
				speaker_div1.swap(fayanren_div);
				var speaker_div2 = $('[sn_id="'+zhujianren+'"]');
				var sn_div = $('[sn_id="'+sn+'"]');
				speaker_div2.swap(sn_div);
			}
			fayanren = sn;

			var main_stream_index2,fayanren_stream;
			var vol;

			for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				var str = videoStr.split("_");
				streamindex = str[1];
				winIndex =  str[2];
				
				if($('#'+str[0]+' div').length ==0)break;
				if(str[0] == speaker_id){
					main_stream_index2 = streamindex;
					vol = 0;
				}
				if(str[0] == peer.client_id){
					fayanren_stream = streamindex;
					vol = 100;
				}
				if(str[0] == loFyanren){
					vol = window.Electron.readConf().vol;
				}
				hookormove(str[0],null,null,vol,streamindex,winIndex,true);
			}
			ipcRenderer.send("switchPip",main_stream_index2,fayanren_stream,true);
			fayanrenVideoWindow();
			//currentWindow.minimize();
			fyr_id = $('[sn_id="'+fayanren+'"]').attr("id");
			
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
		
		var endVol=window.Electron.readConf().vol;
		function onEndHandup(){
			if(!fayanren)return;
			
		    $(".icon_unhook").hide();
		    var speaker_div = $('[sn_id="'+zhujianren+'"]');
			var fayanren_div =$('#'+fyr_id);
			fayanren_div.swap(speaker_div);
			for (var i = 0; i < videoList.length; i++) {
				var videoStr = videoList[i];
				var str = videoStr.split("_");
				streamindex = str[1];
				winIndex =  str[2];
				
				if($('#'+str[0]+' div').length ==0)break;
				var zjliId = $('[sn_id="'+zhujianren+'"]').attr("id");
				if(str[0]==zjliId){
					hookormove(str[0],null,null,0,streamindex,winIndex,true);	
				}else{
					hookormove(str[0],null,null,endVol,streamindex,winIndex,true);	
				}
				
				if(str[0] == speaker_id) {
					ipcRenderer.send("switchPip",streamindex,null,false);
				}
			}
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
			if(move){

				//是否有音量显示  设置音量大小
				var vol = window.Electron.readConf().vol;
		  		alert(vol)
		  		if(sn == speaker_id){
			  		vol=0;
		  		}

				hookormove(userId,null,null,vol,streamindex,winIndex,true);
			}else{
				
				if(fayanren)
				{	
					var peer = findRemotePeer(parseInt(fayanren));
					
					if(userId == speaker_id)
					{
						hookormove(userId,url,userId,0,null,null,false);
					}
					else
					{
						hookormove(userId,url,userId,window.Electron.readConf().vol,null,null,false);
					}

				}
				else
				{
			  		var vol = window.Electron.readConf().vol;
			  		if(userId == speaker_id){vol=0;}
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
				var classroomId =""
				if(remote.getGlobal("hdType")=="inner"){
					classroomId = remote.getGlobal('in_clientId');
				}else{
					classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
				}
				
				var str = '<ul class="hdUl hdUL_2" id="allRoom">';
				str +='<li><h4></h4><div class="main"><img src="../img/img04.jpg" /></div></li>';
				str +='<li id="'+speaker_id+'" sn_id="'+zjr_snId+'" class="zhujiangren"><h4>'+zjr_title+/*'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+speaker_id+'&classroomId='+classroomId+'\')"></a>'+*/'</h4><div class="main"><img src="../img/img02.jpg" /></div>';
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
				var classroomId =""
				if(remote.getGlobal("hdType")=="inner"){
					classroomId = remote.getGlobal('in_clientId');
				}else{
					classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
				}
				//var classroomId = remote.getGlobal('lessonModel').classroom.classroomId;

				var str = '<ul class="hdUl hdUL_1" id="allRoom">';
				str +='<li id="'+speaker_id+'" sn_id="'+zjr_snId+'" class="zhujiangren"><h4>'+zjr_title+/*'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+speaker_id+'&classroomId='+classroomId+'\')"></a>'+*/'</h4><div class="main"><img src="../img/img02.jpg" /></div>';
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
			var classroomId =""
			if(remote.getGlobal("hdType")=="inner"){
				classroomId = remote.getGlobal('in_clientId');
			}else{
				classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
			}
			//var classroomId = remote.getGlobal('lessonModel').classroom.classroomId;
			
			var str ='<ul class="hdUl hdUL_4" id="allRoom">';
			str +='<li id="'+speaker_id+'" sn_id="'+zjr_snId+'" class="zhujiangren"><h4>'+zjr_title/*+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+speaker_id+'&classroomId='+classroomId+'\')"></a>'*/+'</h4><div class="main"><img src="../img/img02.jpg" /></div>';
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
					/*var classroomId = "";
					for(var v=0;v<coursesUserList.length;v++)
					{
						if(coursesUserList[v].userId == classroomArr[j].client_id){
							classroomId=coursesUserList[v].classroomId;
						}
					}*/

					liObj.find("h4").html(classroomArr[j].client_name/*+'<a class="sd" onclick="window.Electron.openSetting(\'manage\',950,580,null,\'isSpeaker=true&userId='+classroomArr[j].client_id+'&classroomId='+classroomId+'\')"></a>'*/);
					liObj.attr("id",classroomArr[j].client_id);
					liObj.attr("sn_Id",classroomArr[j].client_sn);
				}
				$(".hdM ul li").dblclick(function(e){
					//alert("当前教室未接入");
					remote.dialog.showMessageBox({
			            type:'info',
			            title: '提示',
			            message: '当前教室未接入!',
			            buttons:['ok']
			        }); 
				})
		}
		function getCourseStartTime(time)
		{	console.log("time:+++++"+time);
			webview.executeJavaScript(`Tools.setLiveTime("__startTime",${time})`);
		}

		function _deleteUser(client_sn){
			if(fayanren==client_sn){
				var speaker_div = $('.zhujiangren');
				var fayanren_div =$('[sn_id="'+client_sn+'"]');
				fayanren_div.swap(speaker_div);
			}
			$('[sn_id="'+client_sn+'"] h4').html('');
			$('[sn_id="'+client_sn+'"]').attr('id','');
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
	if(window.Electron.remote.getGlobal("filePath")){
		if(status == "start"){
				var mianStrIndex = "";
				for (var i = 0; i < videoList.length; i++) 
					{
						var videoStr = videoList[i];
						var str = videoStr.split("_");
						var sn = str[0];
						var streamindex = str[1];
						var winIndex = str[2];
						if(sn==my_id){
							mianStrIndex = streamindex;
							break;
						}
						
					}

				$(".icon_lz").addClass("on");

				ipcRenderer.send("startRec",1280,720,mianStrIndex);//1920,1080  //可配置
			}else{

				if(remote.getGlobal("isRec")){

					$(".icon_lz").removeClass("on");
					//ipcRenderer.send("stopRec");
					window.Electron.ipcRenderer.send("stopRec");
					$(".icon_lz").html("00:00:00");
					sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
					
				}
			}
		}else{
			window.Electron.ipcRenderer.send("setting");
			sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
		}
	}

function chagePipInit(){
	Tools.pip_vga_max();
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