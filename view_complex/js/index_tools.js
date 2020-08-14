var currentWindow = remote.getCurrentWindow();
var startRec = true;
var func_v_zd = true;//作答
var func_v_hb = true;//画笔
var func_v_xp = true;//橡皮
var isOpenCanvas = false;
var plan = window.Electron.readConf().plan;
$(document).ready(function() {

/*	$(".func_v_zj").click(function(){
		
		
		$(this).parent().find(".done").removeClass("done");
		$(".func_v_hb_box").hide();
		$(".func_v_xp_box").hide();
		if($(this).hasClass("none") == true){
			$(this).removeClass("none");
			$(".func_v_1").show();
			if(isOpenCanvas){
				$(".func_v_2").show();
			}else{
				$(".func_v_2").hide();
			}
			window.Electron.ipcRenderer.send("func_v_zj",true);
		}else{
			$(this).addClass("none");
			$(".func_v_1").hide();
			window.Electron.ipcRenderer.send("func_v_zj",false);
		}
	});//隐藏/显示*/
	    
	    if(isOpenCanvas){
				$(".func_l").css("margin-top","0px");
			}else{
				$(".func_l").css("margin-top","80px");
			}
	$(".func_v_zj").click(function(){
		$(".func_v_childbox").hide();
		$(".func_v_tt_box").hide();
		$(this).parent().find(".done").removeClass("done");
		if($(this).hasClass("none") == true){

			$(this).removeClass("none");


			$(".func_v_1").show();
			if(isOpenCanvas){
				$(".func_v_tt_box").show();
				$(".func_v_tt").addClass("done");
				
			}else{
				
				$(".func_v_tt_box").hide();
			}

			if(func_v_hb&&$(".func_v_tt").hasClass("done")){
				window.Electron.ipcRenderer.send("tools_child_hb",func_v_hb);
				func_v_hb = false;
			}
			window.Electron.ipcRenderer.send("func_v_zj",true);
			if(!func_v_zd){
				$(".func_l").css("top","100px");
				if($(".func_v_tt").hasClass("done")){
					$(".func_l").css("margin-left", "0px");
				}else{
					$(".func_l").css("margin-left","55px");
				}
			}
		}else{
			
			$(this).addClass("none");
			$(".func_v_1").hide();
			window.Electron.ipcRenderer.send("func_v_zj",false);
			window.Electron.ipcRenderer.send("tools_child_hb",false);
			func_v_hb = true;
			if(!func_v_zd){
				$(".func_l").css("top","140px");
				$(".func_l").css("margin-left","145px");
			}
		}
	});//隐藏/显示
	$(".func_v_hb").click(function(){
		// alert("画笔")
		window.Electron.ipcRenderer.send("tools_child_hb",func_v_hb);
		if(func_v_hb){
			func_v_hb = false;
		}else{
			func_v_hb = true;
		}
	});//画笔
	
	$(".func_v_zd").click(function(){
	
		window.Electron.ipcRenderer.send("tools_child_zd",func_v_zd);
		if(func_v_zd){
			$(".func_l").css("top","100px");
			func_v_zd = false;
			$(".func_v_tt_box").css("width","auto");
			$(".func_v_tt_box").css("margin-top","-5px");
			$(".func_v_tt_box").css("margin-left","6px");
			$(".func_v_tt_box").css("padding-left","5px");
			$('.func_v_tt_box').append("<style>#func_v_tt_box::after {left: -5px;top: 50%;margin-left: 0;}</style>");
			$(".func_l").css("margin-top","0px");
			if(isOpenCanvas){
				$(".func_l").css("margin-left","0px");
			}else{
				$(".func_l").css("margin-left","55px");
			}
		}else{
			$(".func_l").css("top","25px");
			$(".func_v_tt_box").css("width","65%");
			$(".func_v_tt_box").css("margin-top","10px");
			$('.func_v_tt_box').append("<style>#func_v_tt_box::after {left: 50%; top: 0; margin-left: -5px;}</style>");
			$(".func_v_tt_box").css("margin-left","0px");
			$(".func_v_tt_box").css("padding-left","0px");
			$(".func_l").css("margin-left", "0px");
			if(isOpenCanvas){
				$(".func_l").css("margin-top","0px");
			}else{
				$(".func_l").css("margin-top","80px");
			}
			
			func_v_zd = true;
		}
	});//作答
	$(".func_v_xp").click(function(){
		func_v_hb = true;
		window.Electron.ipcRenderer.send("tools_child_xp",func_v_xp);
		

		/*if(func_v_xp){
			func_v_xp = false;
		}else{
			func_v_xp = true;

		}*/
	});//橡皮

	$(".func_v_tt").click(function(){
		if($(this).hasClass("done") == false){
			$(this).parent().find(".done").removeClass("done");
			$(this).addClass("done");
			$(".func_v_tt").css("background-image","url(../img/close_tt.png)");
			$(".func_v_tt_box").show();
			if(func_v_zd){
				$(".func_l").css("margin-top","0px");	
			}else{
				$(".func_l").css("margin-left", "0px");
			}
			
			window.Electron.ipcRenderer.send("tools_child_openCanvas",true);
			window.Electron.ipcRenderer.send("open_child_tt");

			isOpenCanvas = true;
			

		}else{
			$(".func_v_tt").css("background-image","url(../img/new14.png)");
			$(this).removeClass("done");
			$(".func_v_tt_box").hide();
			if(func_v_zd){
				$(".func_l").css("margin-top","80px");
			}else{
				$(".func_l").css("margin-left", "55px");
			}
			
			window.Electron.ipcRenderer.send("tools_child_openCanvas",false);
			window.Electron.ipcRenderer.send("tools_child_hb",false);
			isOpenCanvas = false;
			window.Electron.ipcRenderer.send("close_child_tt");
		};
		/*if($(".func_v_2").is(":hidden")){
			$(".func_v_2").show();
			$(this).addClass("done");
			window.Electron.ipcRenderer.send("tools_child_openCanvas",true);
			isOpenCanvas = true;
		}else{
			$(this).removeClass("done");
			$(".func_v_2").hide();
			window.Electron.ipcRenderer.send("tools_child_openCanvas",false);
			window.Electron.ipcRenderer.send("tools_child_hb",false);
			isOpenCanvas = false;
			/*window.Electron.ipcRenderer.send("tools_child_xp",false);*/
		/*};*/
	});

	var vagqh = true;
	$("#pip_vga_qh").click(function(){
		window.Electron.ipcRenderer.send("tools_child_pip_vga_max");//vga 最大

	})
	$("#pip_vga_tea").click(function(){
		window.Electron.ipcRenderer.send("tools_child_pip_vga_min");//教师最大

	})
	/*$('#pip_vga_max').click(function(){
		window.Electron.ipcRenderer.send("tools_child_pip_vga_max");
	});
	$('#pip_vga_min').click(function(){
		window.Electron.ipcRenderer.send("tools_child_pip_vga_min");
	});*/
	var vagxs = false;
	$('#pip_vga_no').click(function(){//教师
		// if(fayanren){
		// 	alert("当前发言状态，不能做此更改！");
		// }else{
			window.Electron.ipcRenderer.send("tools_child_pip_vga_no");
		// if(fayanren){
		// 	alert("当前发言状态，不能做此更改！");
		// }else{
			/*if(vagxs){
				window.Electron.ipcRenderer.send("tools_child_pip_vga_no");
				$("#pip_vga_no").css("background-image","url('../img/new13.png')");
				vagxs = false;
			}else{    
				window.Electron.ipcRenderer.send("tools_child_pip_vga_one");
				$("#pip_vga_no").css("background-image","url('../img/vgaYes.png')");
				vagxs = true;
			}*/
		// }

		
	});

	$('#pip_vga_file').click(function(){//课件

		window.Electron.ipcRenderer.send("tools_child_pip_vga_one");
	});

	$('#startRec').click(function(){
		if(startRec){
			window.Electron.ipcRenderer.send("tools_child_startRec");
			startRec = false;
			$("#startRec").removeClass("func_v_lz");
			$("#startRec").addClass("func_v_lz_stop");
		}else{
			window.Electron.ipcRenderer.send("tools_child_stopRec");
			startRec = true;			
			$("#startRec").removeClass("func_v_lz_stop");
			$("#startRec").addClass("func_v_lz");
		}
	});


	$('#clearCanvas').click(function(){
		func_v_hb = true;
		window.Electron.ipcRenderer.send("tools_child_clearCanvas");
	});
});
ipcRenderer.on("moveHide",function(event,flag){
	if(flag){
		//$(".func_v_1").hide();
		//$("#clickThroughElement").show();
	}else{
		//$(".func_v_1").show();		
	}
});


/*ipcRenderer.on("OpenOrCloseCanvas",function(event,flag){
	if(flag){
		if($(".func_v_tt").hasClass("done") == false){
			$(".func_v_tt").click();
		}
	}else{
		if($(".func_v_tt").hasClass("done")){
			$(".func_v_tt").click();
		}
	}
	
});*/

ipcRenderer.on("close_tt",function(event){
	$(".func_v_tt").click();
});
ipcRenderer.on("child_to_tools_change_rec_status",function(event,_recStatus){
	window.Electron.ipcRenderer.send("tools_child_startRec_status",_recStatus);
	if(_recStatus == "start"){
		startRec = false;
		$("#startRec").removeClass("func_v_lz");
		$("#startRec").addClass("func_v_lz_stop");
	}else{
		startRec = true;
		$("#startRec").removeClass("func_v_lz_stop");
		$("#startRec").addClass("func_v_lz");
	}
});

ipcRenderer.on("child_to_tools_whiteboard_status",function(event,flag){
	if(flag){
		$(".func_v_tt").addClass("2on");
		$(".func_v_2").show();
	}else{
		$(".func_v_tt").removeClass("2on");
		$(".func_v_2").hide();
	}
});
ipcRenderer.on('taskBarInfo',function(event,width,height,position){
	window.Electron.log("index_tools.js:taskBarInfo",'taskBarInfo:width='+width+';height='+height+';position='+position);
	//console.log('taskBarInfo:width='+width+';height='+height+';position='+position);
});
ipcRenderer.on('assistOpenOrCloseCanvas',function(event,flag){

		if(flag){
			$(".func_v_tt").parent().find(".done").removeClass("done");
			$(".func_v_tt").addClass("done");
			$(".func_v_tt").css("background-image","url(../img/close_tt.png)");
			$(".func_v_tt_box").show();
			if(func_v_zd){
				$(".func_l").css("margin-top","0px");	
			}else{
				$(".func_l").css("margin-left", "0px");
			}
			window.Electron.ipcRenderer.send("open_child_tt");

			isOpenCanvas = true;

		}else{
			$(".func_v_tt").css("background-image","url(../img/new14.png)");
			$(".func_v_tt").removeClass("done");
			$(".func_v_tt_box").hide();
			if(func_v_zd){
				$(".func_l").css("margin-top","80px");
			}else{
				$(".func_l").css("margin-left", "55px");
			}
			window.Electron.ipcRenderer.send("tools_child_hb",false);
			window.Electron.ipcRenderer.send("close_child_tt");
			isOpenCanvas = false;
			
		};


});	

ipcRenderer.on('openOrCloseCanvas',function(event,flag){

	if(flag){
		if($(".func_v_tt").hasClass("done") == false){
			$(".func_v_tt").trigger('click');
		}
	}else{
		if($(".func_v_tt").hasClass("done")){
			$(".func_v_tt").trigger('click');
		}
	}


});	
function openOrCloseCanvas(flag){
	if(flag){
		if($(".func_v_tt").hasClass("done") == false){
			$(".func_v_tt").trigger('click');
		}
	}else{
		if($(".func_v_tt").hasClass("done")){
			$(".func_v_tt").trigger('click');
		}
	}
}