var currentWindow = remote.getCurrentWindow();
var setTimeoutNum;
var fyr_id;
var plan = window.Electron.readConf().plan;
var userId,classroomName,deviceId,managerAddr,username,password,rmanager_token;
var dynamic = "ehrec";
$(document).ready(function() {
	if(remote.getGlobal("hdType")=="inner"){//内网直播
		classroomId = remote.getGlobal("in_clientId");//教室ID
		deviceId = remote.getGlobal("deviceId");
		classroomName = remote.getGlobal('in_clientName');
		managerAddr = remote.getGlobal('rmanager');
		username = remote.getGlobal('recName');
		password = remote.getGlobal('recPwd');
		Server.join(managerAddr,username,password,deviceId,dynamic,function(_token){
			rmanager_token = _token;
		});
	}else{
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
	}

	$("#toolsFunc").hide();
	$(".func_v_yc").click(function(){
	$(this).parent().find(".done").removeClass("done");
	$(".func_v_hb_box").hide();
	$(".func_v_xp_box").hide();
	if($(this).hasClass("none") == true){
		$(this).removeClass("none");
		$(".func_v_hb").show();
		$(".func_v_xp").show();
		$(".func_v_qp").show();
		$(".func_v_cd").show();
	}else{
		$(this).addClass("none");
		$(".func_v_hb").hide();
		$(".func_v_xp").hide();
		$(".func_v_qp").hide();
		$(".func_v_cd").hide();
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

	$("#tools_child_xp").click(function(){
/*		$(".func_v_hb").removeClass("done");
		$(".func_v_hb_box").hide();*/
		lineMode = 'choose';
	});//橡皮
	
	$(".func_v_cd").click(function(){//关闭白板
		$(".func_v_yc").trigger("click");
		closeWhiteboard()
	});
	$(".gn_lz").click(function(){
		if($(this).hasClass("open") == true){
			$(this).removeClass("open");
			$(this).find(".jslz").show();
			$(this).find(".kslz").hide();
		}else{
			$(this).addClass("open");
			$(this).find(".jslz").hide();
			$(this).find(".kslz").show();
		};
	});
	var len1 = $(".gn_zd_box span").length;
	if ( len1 == 1 ){ 
		$(".gn_zd_box").css("bottom","150px");
	}else{
		if ( len1 == 2 ){ 
			$(".gn_zd_box").css("bottom","110px");
		};
	};

	$(".gn_zd").click(function(){
		if($('.gn_zd_box').css("display") == "none"){
			$('.gn_zd_box').css("display","block");
		}else{
			$('.gn_zd_box').css("display","none");
		}
	});

	$("#scroll1").niceScroll({  
		cursorcolor:"#ccc",  
		cursoropacitymax:1,  
		touchbehavior:false,  
		cursorwidth:"5px",  
		cursorborder:"0",  
		cursorborderradius:"5px"  
	}); 
	$('.icon_close').click(function(){
		currentWindow.hide();
	});

	
	

	var Num = "99";
	for(var i=0;i<6;i++) 
	{ 
		Num+=Math.floor(Math.random()*10); 
	} 
	var userId = Num;
	connect("辅助屏",userId,remote.getGlobal("roomId"),'user','recordCastClient',[],'0',false,true);
});
//右侧隐藏按钮
$(".part1_r_btn").click(function(){
	if($(this).hasClass("on") == false){
		$(this).addClass("on");
		
		$(".part1_l").animate({width:"100%"});
		$(".gnL").animate({width:"0"});
		$('.gn_zd_box').css("display","none");
	}else{
		$(".part1_l").animate({width:"0"});
		$(".gnL").animate({width:"135px"},500);

		$(this).removeClass("on");
	};
});

ipcRenderer.on("showBtn",function(){
	// $(".part1_r_btn").show();
});

ipcRenderer.on("tools_child_hb",function(event,flag){
	lineMode = 'any';
	if(flag){
		$("#tools_child_hb").show();
	}else{
		$("#tools_child_hb").hide();
	}
});

ipcRenderer.on("func_v_zj",function(event,flag){
	if(flag){
		$("#users").show();
	}else{
		$("#users").hide();
	}
});


ipcRenderer.on("tools_child_zd",function(event,flag){
	if(flag){
		$('.my_users ul').appendTo('.func_new_div');
		$('.func_new_div ul').removeClass('func_zd_new_l').addClass('func_zd_new');
	}else{
		$('.func_new_div ul').appendTo('.my_users');
		$('.my_users ul').removeClass('func_zd_new').addClass('func_zd_new_l');
	}
});


ipcRenderer.on("tools_child_xp",function(event,flag){
	$("#tools_child_hb").hide();
	if(flag){
		/*$("#tools_child_xp").show();*/
		lineMode = 'choose';
	}/*else{
		$("#tools_child_xp").hide();
	}*/
});

ipcRenderer.on("tools_child_pip_vga_max",function(event){
	if(fayanren){
		var pipData = window.Electron.readConf();
		switch(pipData.pip){
			case 1:
				Tools.student_2_1_pip_vga_max();
				break;
			case 2:
				Tools.student_3_1_pip_vga_max();
				break;
			default:
				Tools.student_pip_vga_max();
		}
	}else{
		Tools.pip_vga_max();
	}
})

ipcRenderer.on("tools_child_pip_vga_min",function(event){
	if(fayanren){
		var pipData = window.Electron.readConf();
		switch(pipData.pip){
			case 1:
				Tools.student_2_1_pip_vga_min();
				break;
			case 2:
				Tools.student_3_1_pip_vga_min();
				break;
			default:
				Tools.student_pip_vga_min();
		}
	}else{
		Tools.pip_vga_min();
	}
})

ipcRenderer.on("tools_child_pip_vga_no",function(event){
	 if(fayanren){
	 	//alert("当前发言状态，不能做此更改！");
	 	    remote.dialog.showMessageBox({
		            type:'info',
		            title: '提示',
		            message: '当前发言状态，不能做此更改！',
		            buttons:['ok']
		    }); 
	 }else{
		Tools.pip_vga_no();
	 }
})
ipcRenderer.on("tools_child_pip_vga_one",function(event){
	 if(fayanren){
	 	//alert("当前发言状态，不能做此更改！");
 	    remote.dialog.showMessageBox({
	            type:'info',
	            title: '提示',
	            message: '当前发言状态，不能做此更改！',
	            buttons:['ok']
	    }); 	 	
	 }else{
		Tools.pip_vga_one();
	 }
})
ipcRenderer.on("tools_child_startRec",function(event){
	if(!recStatus || recStatus != 'start'){
		sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"start","save":1}));
		recStatus = 'start';
	}else{
		//alert("正在录制");
 	    remote.dialog.showMessageBox({
	            type:'info',
	            title: '提示',
	            message: '正在录制',
	            buttons:['ok']
	    }); 		
	}
})
ipcRenderer.on("tools_child_stopRec",function(event){
	if(!recStatus || recStatus != 'stop'){
		sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
		recStatus = 'stop';
	}else{
		//alert("请先开始录制");
 	    remote.dialog.showMessageBox({
	            type:'info',
	            title: '提示',
	            message: '请先开始录制',
	            buttons:['ok']
	    }); 		
	}
})

ipcRenderer.on("tools_child_startRec_status",function(event,status){
	recStatus = status;
});
ipcRenderer.on("tools_child_openCanvas",function(event,isOpen){
	if(isOpen){
	openWhiteboard();
	}else{
	closeWhiteboard(); 
	}
})
ipcRenderer.on("open_child_tt",function(event){
	$("#close_tc").show();
});
ipcRenderer.on("close_child_tt",function(event){
	$("#close_tc").hide();
});
ipcRenderer.on("tools_child_clearCanvas",function(event){
	$("#tools_child_hb").hide();
	resetEverything();
})
$("#close_tc").click(function(){
	$("#close_tc").hide();
	window.Electron.ipcRenderer.send("close_tt");
});
$(window).resize(function(){
	$("#scroll1").getNiceScroll().resize();
});

function openMsg(){
	ipcRenderer.send("openMsg");
}

function closeMsg(){
	ipcRenderer.send("closeMsg");
}
function opensetting(){
	ipcRenderer.send("setting");
}

function _addUser(authority_level,client_id,client_name,client_seq,client_sn,client_type,is_speaker,video_numbers,video_status){
	if(client_name.indexOf("web_")==0||client_name.indexOf("phone_")==0){
		return false;
	}
	if(is_speaker || client_name == '辅助屏') return;
	var span_html = "";
	if(client_name.length>4){
		client_name = client_name.substring(0,4);
	}

	if($("[sn_id="+client_id+"]").length>0){
		if(fyr_id==client_id){
			var fyrDiv = $("#"+fayanren);
			change_stage(fyrDiv);
		}
		$("[sn_id="+client_id+"]").remove();
	}
	span_html +='<li sn_id="'+client_id+'"  id="'+client_sn+'" onclick="change_stage(this)"><a href="javascript:void(0)">'+client_name+'</a></li>';
	$('#'+client_sn).remove();
	$('#users').append(span_html);
	for(var i=0; i<video_numbers; i++) {
		if(video_status[i]==-1){
			if(is_speaker){
				hdkt_subscribeVideo(client_sn,i,false,0,'',client_name);
			}
		}
	}
	$(".func_zd_new_l").css("bottom",(window.screen.height-$("#users").height())/2);
}

function _deleteUser(client_sn){
	$('#'+client_sn).remove();
}

function change_stage(_this){
	console.log(this);
	var pipData = window.Electron.readConf();
	if(!fayanren){

		$('#users li').css("background-color","");
		$('#users li').css("border-color","");
		request_on_stage($(_this).attr('id'));
		// Tools.student_pip_vga_max();
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
				    	},pipData.stuUp);
				    }else
				    {
				    	Tools.student_pip_vga_max();
				    }
			}
		}
		$(_this).css("background-color","#f87b00");
		$(_this).css("border-color","#f87b00");
	}else{
		if(fayanren != $(_this).attr('id')){
			/*var now = new Date();
			if(now.getTime() - closeHandTime.getTime() <= pipData.stuUp){
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
			}*/
			$('#users li').css("background-color","");
			$('#users li').css("border-color","");
			request_on_stage($(_this).attr('id'));
			$(_this).css("background-color","#f87b00");
			$(_this).css("border-color","#f87b00");
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
			if(now.getTime() - closeHandTime.getTime() <= pipData.stuUp){
				//alert('暂不能结束发言，请稍后重试！');
			remote.dialog.showMessageBox({
	            type:'info',
	            title: '提示',
	            message: '暂不能结束发言，请稍后重试！',
	            buttons:['ok']
	   		 }); 
				return;
			}

			$('#users li').css("background-color","");
			$('#users li').css("border-color","");
			endHandup();
			Tools.pip_vga_max();
			fayanren = null;
			fyr_id = null;
		}
	}
}

function chagePipInit(){
	Tools.pip_vga_max();
}

function course_start_time(){
	sendToPeer("broadcast", JSON.stringify({"key":"startTime","data":new Date().getTime(),"save":1}));
}

function getCourseStartTime(_startTime){
	// console.log(_startTime);
	Tools.setLiveTime('startTime',_startTime);
}

function hookWindow(sn,streamindex,url,move,winIndex){
	fayanren = sn;
	fyr_id = $("#"+fayanren).attr("sn_id");
}

function change_stage_sn(sn){
	$('#users li').css("background-color","");
	$('#users li').css("border-color","");

	if(sn && sn != ''){
		closeHandTime = new Date();
		$("#"+sn).css("background-color","#f87b00");
		$("#"+sn).css("border-color","#f87b00");
	}
}
function change_stage_sn_end(){
	fayanren = null;
	fyr_id = null;
}
function initFayanren(_fayanren){
	closeHandTime = new Date();
	$("#"+_fayanren).css("background-color","#f87b00");
	$("#"+_fayanren).css("border-color","#f87b00");
}

function change_rec_status(_recStatus){
	window.Electron.ipcRenderer.send('child_to_tools_change_rec_status', _recStatus);
}

function renderWhiteboard(wbop, wbIndex){
	// console.log('------------renderWhiteboard---------------');
	// renderAllPaths();
	// $("#canvasDiv").show();
	// $(".zscreen").css('width', "25%");
	// $(".zscreen").css('height', "25%");

	// document.getElementById(currentDrawingId).width = $("#drawing").width();
	// document.getElementById(currentDrawingId).height = $("#drawing").height();
	var boardMayChange = false;
	if (wbop == 1) /* delete */ {
		if (wbIndex != -1) whiteboard.splice(wbIndex, 1);
		boardMayChange = true;
	} else if (wbop == 2 || wbop == 3) {		
		boardMayChange = true;		
	}

	if (boardMayChange) {
		var newWhiteboardName = null;
		/* board sequence: private > public. */
		for (var i = 0; i < whiteboard.length; ++i) {
			if (fayanren != null) {
				if (whiteboard[i].ppt_name == "/wbp_" + fayanren) {
					newWhiteboardName = whiteboard[i].ppt_name;
					break;
				}				
			}
			if (whiteboard[i].ppt_name == "/wbp_" + my_id) {
				newWhiteboardName = whiteboard[i].ppt_name;
				break;
			}
			else if (whiteboard[i].ppt_name == "/wba") /* public whiteboard */ {
				newWhiteboardName = whiteboard[i].ppt_name;
				break;
			}
		}

		if (ppt_name != newWhiteboardName)
		{
			ppt_name = newWhiteboardName;
			ppt_page = 0;
			if (ppt_name == null) {
				//window.Electron.ipcRenderer.send('setWhiteboardMode', "0", false);
				$(".avr_canvas_div_class").hide();
				$(".zscreen").css('width', "100%");
				$(".zscreen").css('height', "100%");
				drawingDisabled = true;

			} else {
				//window.Electron.ipcRenderer.send('setWhiteboardMode', "0", true);
				$(".avr_canvas_div_class").show();
				$("#toolsFunc").show();
				$(".zscreen").css('width', "25%");
				$(".zscreen").css('height', "25%");
    			document.getElementById(currentDrawingId).width = $("#drawing").width();
   				document.getElementById(currentDrawingId).height = $("#drawing").height();
				drawingDisabled = false;
				window.Electron.ipcRenderer.send('child_to_tools_whiteboard_status', true);
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
function openWhiteboard(){


	ppt_name = '/wba';
	ppt_page = 0;
		
		window.Electron.screenshot(function(fileName){
			var confData = window.Electron.readConf();
			var filePath = confData.nginx+'/v0/mcu/'+fileName;
			$('body').css('background-image','url('+filePath+') no-repeat');
			$('.avr_canvas_div_class').show();
	 		cvsWidth = $("#drawing").width();
		    cvsHeight = $("#drawing").height();
		    document.getElementById(currentDrawingId).width = cvsWidth;
		    document.getElementById(currentDrawingId).height = cvsHeight;
			changeCanvas();
			drawingDisabled = false;
			var data = {
				scope:'public',
				from:my_mid,
				to:'',
				path:filePath,
				plan:confData.plan
			}
			sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));
			Tools.pip_vga_no();
			if(setTimeoutNum){
				clearTimeout(setTimeoutNum);
			}
			$("#toolsFunc").show();
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mouseleave',divMouseleave,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mousemove',divMousemove,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mousedown',divMousedown,false);
				document.getElementsByClassName('avr_canvas_div_class')[0].addEventListener('mouseup',divMouseup,false);
		});
		


}
function closeWhiteboard(){
	deleteCanvas();
	$("#toolsFunc").hide();
	$('#openCanvas span').html('打开白板');
	$('.avr_canvas_div_class').hide();
	drawingDisabled = true;
	// $('body').css('background-image','');
	var data = {
		scope:'public',
		from:my_mid,
		to:'',
		path:'',
		plan:window.Electron.readConf().plan
	}
	sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));		
		
	if(fayanren){
		var pipData = window.Electron.readConf();
		switch(pipData.pip)
		{
			case 1:
			   	Tools.student_2_1_pip_vga_max();
			    break;
			case 2:
			 	Tools.student_3_1_pip_vga_max();
				break;
			default:
				Tools.student_pip_vga_max();
		}
	}else{
		Tools.pip_vga_one();
	}
}
function on_bc_share_doc(data){
	if(data.scope == 'public'){
		if(data.path != ''){
			$('body').css('background-image','url('+data.path+')');
			ipcRenderer.send("assistOpenOrCloseCanvas",true);
		}else{
			$('body').css('background-image','');
			ipcRenderer.send("assistOpenOrCloseCanvas",false);
		}
		
	}
}
function hdkt_messageHandle(from, msg,scope){
	if(scope=="private"){
		if(msg=="canvas_open"){
			openWhiteboard();
		}else if(msg=="canvas_close"){
			closeWhiteboard();
		}	
	}
};

function changeColor(_color,type){
	fillStyle=_color;
	strokeStyle=_color;
	lineMode = type;
	$('#hb_color').css('background-color',_color);
}

function onEndHandup(){
	$("#users li").css("background-color","");
	$("#users li").css("border-color","");
}
ipcRenderer.on('taskBarInfo',function(event,width,height,position){
	if(height==0){
		$(".func_new_div").css("bottom","0px");
	}else{
		$(".func_new_div").css("bottom",height+"px");
	}
	window.Electron.log("index+tools_child.js:taskBarInfo",'taskBarInfo:width='+width+';height='+height+';position='+position);
	//console.log('taskBarInfo:width='+width+';height='+height+';position='+position);
});

function openOrCloseCanvas(flag){
	ipcRenderer.send("openOrCloseCanvas",flag);

}