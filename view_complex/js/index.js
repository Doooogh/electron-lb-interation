var currentWindow = remote.getCurrentWindow();

$(document).ready(function() {
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
	$(".func_v_xp").click(function(){
		/*if($(this).hasClass("done") == false){
			$(this).parent().find(".done").removeClass("done");
			$(".func_v_hb_box").hide();
			$(this).addClass("done");
			$(".func_v_xp_box").show();
		}else{
			$(this).removeClass("done");
			$(".func_v_xp_box").hide();
		};*/
		$(".func_v_hb").removeClass("done");
		$(".func_v_hb_box").hide();
		lineMode = 'choose';
	});//橡皮
	$(".func_v_qp").click(function(){//删除白板线
		resetEverything();
	});
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

	$('#pip_vga_max').click(function(){
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
		
		$('.gnM ul li').css("background-color","");
		$(this).css("background-color","#606060");
	});
	$('#pip_vga_min').click(function(){
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
		$('.gnM ul li').css("background-color","");
		$(this).css("background-color","#606060");
	});
	$('#pip_vga_no').click(function(){
		// if(fayanren){
			// alert("当前发言状态，不能做此更改！");
		// }else{
			Tools.pip_vga_no();
		// }
		$('.gnM ul li').css("background-color","");
		$(this).css("background-color","#606060");		
	});

	$('#pip_vga_one').click(function(){
		// if(fayanren){
		// 	alert("当前发言状态，不能做此更改！");
		// }else{
			Tools.pip_vga_one();
		// }
		$('.gnM ul li').css("background-color","");
		$(this).css("background-color","#606060");		
	});

	$('#startRec').click(function(){
		if(!recStatus || recStatus != 'start'){
			sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"start","save":1}));
			recStatus = 'start';
		}else{
			//alert("正在录制");
			remote.dialog.showMessageBox({
		            type:'info',
		            title: '提示',
		            message: '正在录制！',
		            buttons:['ok']
		    }); 
		}
	});

	$('#stopRec').click(function(){
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
	});

	$('#openCanvas').click(function(){
		openWhiteboard();
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
	//$(".part1_r_btn").show();
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
	if(is_speaker || client_name == '辅助屏') return;
	var span_html = "";
	span_html +='<span id="'+client_sn+'" onclick="change_stage(this)">'+client_name+'</span>';
	$('#users').append(span_html);
	for(var i=0; i<video_numbers; i++) {
		if(video_status[i]==-1){
			if(is_speaker){
				hdkt_subscribeVideo(client_sn,i,false,0,'',client_name);
			}
		}
	}
}

function _deleteUser(client_sn){
	$('#'+client_sn).remove();
}

function change_stage(_this){
	$('#users span').css("background-color","");
	$('#users span').css("border-color","");

	if(!fayanren){
		request_on_stage($(_this).attr('id'));
		// Tools.student_pip_vga_max();
		var pipData = window.Electron.readConf();
		switch(pipData.pip)
		{
			case 1:
			    if(pipData.stuUp > 0)
			    {
			    	Tools.student_2_1_pip_vga_stu_max();
			    	setTimeout(function(){
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
			    	setTimeout(function(){
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
			    	setTimeout(function(){
						Tools.student_pip_vga_max();
			    	},pipData.stuUp);
			    }else
			    {
			    	Tools.student_pip_vga_max();
			    }
		}
		$(_this).css("background-color","#f87b00");
		$(_this).css("border-color","#f87b00");
	}else{
		if(fayanren != $(_this).attr('id')){
			request_on_stage($(_this).attr('id'));
			$(_this).css("background-color","#f87b00");
			$(_this).css("border-color","#f87b00");
		}else{
			endHandup();
			Tools.pip_vga_max();
			fayanren = null;
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
}

function change_stage_sn(sn){
	$('#users span').css("background-color","");
	$('#users span').css("border-color","");

	if(sn && sn != ''){
		$("#"+sn).css("background-color","#f87b00");
		$("#"+sn).css("border-color","#f87b00");
	}
}

function change_rec_status(_recStatus){
	if(_recStatus == 'start'){
		$(".gn_lz").removeClass("open");
		$(".jslz").show();
		$(".kslz").hide();
	}else{
		$(".gn_lz").addClass("open");
		$(".jslz").hide();
		$(".kslz").show();
	};
	recStatus = _recStatus;
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
			$('body').css('background-image','url('+filePath+')');
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
				plan:window.Electron.readConf().plan
			}
			sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));
			Tools.pip_vga_no();
			$("#toolsFunc").show();
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
		path:''
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
		}else{
			$('body').css('background-image','');
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
