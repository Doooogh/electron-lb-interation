var Voice = {
	interval:null,
	changeSeq:-1,
	srtId:-1,
	time:10000,
	start:null,
	INIT:'课堂助手',
	VGA_NO:'VGA_NO',//无VGA
	VGA_ONLY:'VGA_ONLY',//无VGA
	VGA_MAX:'VGA_MAX',//VGA最大
	VGA_MIN:'VGA_MIN',//VGA最小
	REC_START:'REC_START',//开始录制
	REC_STOP:'REC_STOP',//结束录制
	CANVAS_START:'CANVAS_START',//开始推题
	CANVAS_STOP:'CANVAS_STOP',//结束推题
	STAGE_ON:'STAGE_ON',//上台发言
	STAGE_OFF:'STAGE_OFF',//结束发言
	ANALYSIS_ARRAY:[
		['显示教师,显示授课,不显示课件,不显示讲义','VGA_NO'],
		['显示课件,显示讲义,不显示教师,不显示授课','VGA_ONLY'],
		['课件大教师小,讲义大教师小,讲义大授课小,课件大授课小','VGA_MAX'],
		['课件小教师大,讲义小教师大,讲义小授课大,课件小授课大','VGA_MIN'],
		['开始录制,打开录制,录制开启','REC_START'],
		['结束录制,关闭录制,录制停止','REC_STOP'],
		['进入推题,打开推题,进入答题,打开答题,进入白板,打开白板','CANVAS_START'],
		['结束推题,完成推题,关闭推题,结束答题,完成答题,关闭答题,结束白板,完成白板,关闭白板','CANVAS_STOP'],
		['回答,作答,上台','STAGE_ON'],
		['结束回答,结束发言,结束作答','STAGE_OFF']
	],
	startConvert:function(classroomId,token,callback){
		Voice.interval = setInterval(function(){
			Server.waitDeviceData(classroomId,token,Voice.changeSeq,function(_result){
				if(_result.deviceData.length > 0){
					var result = selectMaxSeq(_result.deviceData);
					Voice.changeSeq = result.changeSeq;
					console.log('result.data-----'+result.data);
					if(!Voice.start){
						if(result.data.indexOf(Voice.INIT) >= 0){
							Voice.start = result.end;
							console.log('-----------Voice.start---------------')
							window.Electron.ipcRenderer.send('openMsg','在呢！');
						}
					}else{
						if(result.data.trim() == '') return;
						
						if(result.start - Voice.start <= Voice.time){
							console.log('-----------Voice.ing---------------')
							var r = analysis(result);
							if(r && r.rc == 0) {
								callback(r);
								Voice.start = null;
							};
						}else{
							console.log('-----------Voice.end---------------')
							window.Electron.ipcRenderer.send('openMsg','拜拜！');
							window.Electron.ipcRenderer.send('closeMsg');
							Voice.start = null;
						}
					}
				}
			});
		},1000)
	},
	stopConvert:function(){
		clearInterval(Voice.interval);
		changeSeq = null;
	}
}

function selectMaxSeq(_result){
	var result = {};
	if(Voice.changeSeq == -1){
		result = _result[_result.length-1];
		Voice.srtId = result.srtId;
	}else{
		for(var i=0;i<_result.length;i++){
			if(Voice.srtId == -1){
				Voice.srtId = _result[0].srtId;
			}
			if(Voice.srtId == _result[i].srtId && _result[i].completed  == 1){
				//app.voiceMsgAll =  app.voiceMsgAll + _result[i].data;
				Voice.srtId++;
			}
		}
		result = _result[_result.length-1];

	}
	// app.completed = Voice.srtId + ':' + result.completed;
	return result;
}

function analysis(_result){
	var result = {
		rc:-1,
		tag:null,
		msg:null
	}
	for(var i = 0;i<Voice.ANALYSIS_ARRAY.length;i++){
		var alist = Voice.ANALYSIS_ARRAY[i][0].split(',');
		for (var j = 0;j<alist.length;j++) {
			if(_result.data.indexOf(alist[j]) >= 0){
				result.rc = 0;
				result.tag = Voice.ANALYSIS_ARRAY[i][1];
				result.msg = _result.data;
				return result;
			}
		}
	}
}