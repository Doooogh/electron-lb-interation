
var fayanren;
var isOpenBlack = false;
function bottom_init(){
	$(".icon_VGAS").click(function(){
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
	$(".icon_VGAB").click(function(){
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
	$(".icon_VGAN").click(function(){
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
	$(".icon_VGA0").click(function(){
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

/*	$(".icon_VGAT").click(function(){
		var sn ;
		for(var i = 0;i< peer_conn_list.length ; i++){
			if(peer_conn_list[i].client_name == '辅助屏'){
				sn = peer_conn_list[i].client_sn;
			}
		}
		if(sn){
			if (drawingDisabled) {
				sendToPeer("chat_private", JSON.stringify({ "client_sn" : sn, "msg" : 'canvas_open' }));
			} else {
				sendToPeer("chat_private", JSON.stringify({ "client_sn" : sn, "msg" : 'canvas_close' }));
			}
		}
	})*/

	$(".icon_setup").click(function(){		
		if(fayanren){
			//alert("当前发言状态，不能做此操作！");
			remote.dialog.showMessageBox({
		            type:'info',
		            title: '提示',
		            message: '当前发言状态，不能做此更改！',
		            buttons:['ok']
		    }); 			
		}else{
			window.Electron.ipcRenderer.send("setting");
		}
		
	})
	
	$(".icon_setup1").click(function(){
		if (!_public_canvas_opened) {
			ppt_name = '/wba';
			ppt_page = 0;
			changeCanvas();

			renderWhiteboard(3, -1);

			$(".icon_setup1").attr('title', '关闭画板');
			_public_canvas_opened = true;
		} else {

			$(".icon_setup1").attr('title', '打开画板');

			ppt_name = '/wba';
			ppt_page = 0;
			deleteCanvas();
			_public_canvas_opened = false;
		}
	})
	$(".icon_setup2").click(function(){
		// changeCanvas("_public_canvas");
	})

	$(".icon_lz").click(function(){
		if(window.Electron.remote.getGlobal("filePath"))
		{
			if($(this).hasClass("on") == true){
				$(this).removeClass("on");
				window.Electron.ipcRenderer.send("stopRec");
				$(".icon_lz").html("00:00:00");
				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
			}else{
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
				$(this).addClass("on");
				window.Electron.ipcRenderer.send("startRec",1280,720,mianStrIndex);

				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"start","save":1}));
			};
		}
		else
		{
			window.Electron.ipcRenderer.send("setting");
		}
		
	});
	$(".icon_lz_manager").click(function(){
		if(window.Electron.remote.getGlobal("filePath"))
		{
			if($(this).hasClass("on") == true){
				$(this).removeClass("on");
				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
			}else{
				$(this).addClass("on");
				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"start","save":1}));
			};
		}
		else
		{
			window.Electron.ipcRenderer.send("setting");
		}
		
	});
	$(".icon_unhook").click(function(){
		var pipData = window.Electron.readConf();
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
		Tools.pip_vga_max();
		endHandup();
	});
	$("#changeVideo").click(function(){		//切换学生视频
		var _status = 0;
		//_status 0:学生全景  1:黑板	
		var url = $(".icon_VIEW ").css("background-image");
		if( $(".icon_VIEW ").css("background-image").indexOf("view_0")>-1){
			 $(".icon_VIEW ").css("background-image","url(../img/view_1.png)");
			 _status = 1;
		}else{
			 $(".icon_VIEW ").css("background-image","url(../img/view_0.png)");
			 _status = 0;
		}
		
		
		sendToPeer("broadcast", JSON.stringify({"key":"stuVideoStatus","data":_status,"save":1}));
	});
	$(".icon_VGAT").click(function(){		//推题
		if(!isOpenCanvas){
			$('#blackFilePath').trigger('click');
			//$(".icon_VGAT")("结束推题");
			$(".icon_VGAT").attr("title","结束推题");
		}else{
			isOpenCanvas = false;
			//关闭画板
			deleteCanvas();
			drawingDisabled = true;
			var data = {
				scope:'public',
				from:my_mid,
				to:'',
				path:'',
				plan:window.Electron.readConf().plan
			}
			sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));	
			whiteboard = new Array();
			renderMainWhiteboard(3); 
			$("#blackFilePath").val("");
			$(".icon_VGAT").attr("title","推题");
		}
		
	});
	$("#blackFilePath").change(function(){
         var file = $("#blackFilePath").val();
         if(file!=""){
         var filePath = this.files[0].path;
         var AllImgExt=".jpg|.jpeg|.bmp|.png|";
         var extName = file.substring(file.lastIndexOf(".")).toLowerCase();//（把路径中的所有字母全部转换为小写）        
        if(AllImgExt.indexOf(extName+"|")==-1)        
        {
            ErrMsg="该文件类型不允许上传。请上传 "+AllImgExt+" 类型的文件，当前文件类型为"+extName;
           // alert(ErrMsg);
           	remote.dialog.showMessageBox({
		            type:'info',
		            title: '提示',
		            message: ErrMsg,
		            buttons:['ok']
		    }); 
            return false;
        } else{
           	ppt_name = '/wba';
			ppt_page = 0;
            window.Electron.uploadFile(filePath,function(fileName){
            	isOpenCanvas = true;
		           //给当前父窗口直接发送消息

				var confData = window.Electron.readConf();
	            var filePath = confData.nginx+'/v0/mcu/'+fileName;
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
	            renderMainWhiteboard(3); 
		        if(setTimeoutNum){
					clearTimeout(setTimeoutNum);
				}
			 	Tools.pip_vga_no();
		      });
           
        }
        }
  	});
}

function bottom_recTime(time){
	$(".icon_lz").html(time);
}

function onStuVideoChange(data){
	if(data==1){
		$(".icon_VIEW ").css("background-image","url(../img/view_1.png)");
	}else{
		$(".icon_VIEW ").css("background-image","url(../img/view_0.png)");	
	}
	console.log('onStuVideoChange---:'+data)
}