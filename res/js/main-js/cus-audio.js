let currentAideo;
const cusUtils=require('./cus-utils.js')
const cusConst = require('./const.js');
const cusGlobalParam=require('./cus-opreation-global-param')
//后期更换
let WIN_MAX_STREAMS = cusConst.WIN_MAX_STREAMS,
	MAX_STREAMS =  cusConst.MAX_STREAMS;
let myAudioStreamindex;
let interval_int;


var cusAudio={
	setCurrentAideo :(_aideoStr)=>{
		global.currentAideo = _aideoStr;
	},
	//打开音频
	openAudio: (win)=>{
		if(!myAudioStreamindex){
			var webContents = win.webContents;
			console.log("-----------------------openAudio--------------------");
			var audioUris = cusUtils.getAudios();

			if(audioUris.length == 0){
				result = {
					code:-1,
					type:"stream",
					msg:"请插入音频设备！"
				};
				webContents.send('video', result);
				return ;
			}

			var result;
			//找不到定义 getStreamIndex()
			var streamindex = getStreamIndex();
			var thisAudioKey;
			audioUris.forEach(function (item, key, mapObj) {
				thisAudioKey = key;
				return;
			});
			var x = confLib.YXV_ConfAddLocalStream(confHandle,streamindex, '',thisAudioKey,0,0);
			if(x != 0){
				result = {
					code:-1,
					type:"openAudio",
					msg:"打开音频失败"
				};
				webContents.send('video', result);
				return ;
			}else{
				result = {
					code:0,
					type:"openAudio",
					streamindex:streamindex,
					msg:"打开音频成功"
				};
				webContents.send('video', result);
			}

			myAudioStreamindex = streamindex;
		}


		interval_int = setInterval(function(){
			// console.log("---------------------------setInterval-----------111---------------------------");
			var audioStr = new Buffer(4);
			var x = confLib.YXV_ConfGetStreamVol(confHandle,myAudioStreamindex,audioStr);
			// console.log("---------------------------setInterval-------------222-------------------------");
			var audioNum = audioStr.readUInt32LE(0);
			result = {
				code:0,
				type:"getStreamVol",
				msg:"获取音量成功",
				audioNum:audioNum
			};
			if(win != null){
				console.log("-----------------------webContents-------------------------:"+webContents)
				webContents.send('video', result);
			}else{
				return;
			}

		},20)

		// console.log("------------------openAudio---------------------------:"+streamindex)

	},
	//关闭音频
	closeAudio :(win,streamindex)=> {
		if(streamindex == null){
			if(myAudioStreamindex){
				streamindex = myAudioStreamindex;
			}else{
				console.log("222222222222222222222222222222222222222222222222")
				return;
			}

		}
		console.log("------------------closeAudio---------------------------:"+streamindex)
		// confLib.YXV_ConfRemoveStream(confHandle,streamindex)
		for (var i = 0; i < MAX_STREAMS; i++) {
			var strIndex = cusGlobalParam.g_streamArrGet(i);
			if(strIndex != null){
				strIndex = null;
				break;
			}
		}
		clearInterval(interval_int);
	},
	setAce:(win,flag)=>{
		console.log("-----------------------setAce--------------------");
		if(!myAudioStreamindex){
			var webContents = win.webContents;
			console.log("-----------------------openAudio--------------------");
			var audioUris = getAudios();

			if(audioUris.length == 0){
				result = {
					code:-1,
					type:"stream",
					msg:"请插入音频设备！"
				};
				webContents.send('video', result);
				return ;
			}

			var result;
			var streamindex = getStreamIndex();
			var thisAudioKey;
			audioUris.forEach(function (item, key, mapObj) {
				thisAudioKey = key;
				return;
			});
			var x = confLib.YXV_ConfAddLocalStream(confHandle,streamindex, '',thisAudioKey,0,0);
			if(x != 0){
				result = {
					code:-1,
					type:"openAudio",
					msg:"打开音频失败"
				};
				webContents.send('video', result);
				return ;
			}else{
				result = {
					code:0,
					type:"openAudio",
					streamindex:streamindex,
					msg:"打开音频成功"
				};
				webContents.send('video', result);
			}

			myAudioStreamindex = streamindex;
		}
		var aceInt = confLib.YXV_ConfSetStreamAEC(confHandle,myAudioStreamindex, flag);
		console.log("-----------aceInt------"+aceInt);
	}

}
module.exports=cusAudio;