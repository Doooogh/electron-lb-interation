
var fayanren;
var isOpenBlack = false;
function bottom_init(){
	$(".icon_setup").click(function(){		
		window.Electron.ipcRenderer.send("setting");
	})
	$(".icon_VGAT").click(function(){		//推题
		// window.Electron.ipcRenderer.send("canvas");
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
				path:''
			}
			sendToPeer("broadcast", JSON.stringify({"key":"bc_share_doc","data":data,"save":1}));	
			whiteboard = new Array();
			renderMainWhiteboard(3); 
			$("#blackFilePath").val("");
			$(".icon_VGAT").attr("title","推题");
		}
		
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
	})



	$("#blackFilePath").change(function(){
         var file = $("#blackFilePath").val();
         if(file!=""){
         var filePath = this.files[0].path;
         var AllImgExt=".jpg|.jpeg|.bmp|.png|";
         var extName = file.substring(file.lastIndexOf(".")).toLowerCase();//（把路径中的所有字母全部转换为小写）        
        if(AllImgExt.indexOf(extName+"|")==-1)        
        {
            ErrMsg="该文件类型不允许上传。请上传 "+AllImgExt+" 类型的文件，当前文件类型为"+extName;
            //alert(ErrMsg);
			remote.dialog.showMessageBox({
	            type:'info',
	            title: '提示',
	            message: ErrMsg,
	            buttons:['ok']
          	});            
            return false;
        } else{
           
            window.Electron.uploadFile(filePath,function(fileName){
            	isOpenCanvas = true;
		           //给当前父窗口直接发送消息
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
        }
        }
  	});

	$(".icon_lz").click(function(){
		if(window.Electron.remote.getGlobal("filePath"))
		{
			if($(this).hasClass("on") == true){
				$(this).removeClass("on");
				window.Electron.ipcRenderer.send("stopRec");
				$(".icon_lz").html("00:00:00");
				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
			}else{
				$(this).addClass("on");
				window.Electron.ipcRenderer.send("startRec",1280,720);
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
				//window.Electron.ipcRenderer.send("stopRec");
				//$(".icon_lz").html("00:00:00");
				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"stop","save":1}));
			}else{
				$(this).addClass("on");
				//window.Electron.ipcRenderer.send("startRec",1280,720);
				sendToPeer("broadcast", JSON.stringify({"key":"recStatus","data":"start","save":1}));
			};
		}
		else
		{
			window.Electron.ipcRenderer.send("setting");
		}
		
	});
	$(".icon_unhook").click(function(){
		endHandup();
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