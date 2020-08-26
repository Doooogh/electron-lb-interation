/**
 * 录制
 */
//dll 
const confLib=require('./conf-lib.js')
const confLibParam=require('./cus-lib-param-type.js')
const cusSystem=require('./cus-system.js');
const cusStreamWin=require('./cus-operation-stream-and-win.js');
const cusConst = require('./const.js');
const cusUtils=require('./cus-utils.js')
const cusGlobalParam=require('./cus-opreation-global-param')
const loger = require('../loger.js')
const path = require('path')

var fs = require('fs')

//录制
let global_pip_caller = null;
var global_student_up = null; 
let time_interval;


global.is_upload= false;
global.isSpeaker= false;
global.lessonId;
global.lessonName;
global.teacherId;
global.token;
global.url_param;
global.roomId;
global.isComplex = false;
global.externalDisplay
global.res_index_list;
global.canRec;

//后期更换 
let WIN_MAX_STREAMS = cusConst.WIN_MAX_STREAMS,
	MAX_STREAMS =  cusConst.MAX_STREAMS;

/*let confHandlePtr =confLibParam.confHandlePtr;


let confHandle = confHandlePtr.deref()

let confHandlePtr_R = confLibParam.confHandlePtr_R;

let confHandle_R=confLibParam.confHandle_R;


 */

const cusLibParamAfter=require('./cus-lib-param-type-after')

let confHandle = cusLibParamAfter.confHandle//方法中使用到了
let confHandlePtr_R = cusLibParamAfter.confHandlePtr_R //方法中使用到了


var record={



	//***使用时传入filePath
	startRec:(win,width,height,mianStrIndex,filePath)=>{
		loger.info('startRec');
		global.canRec = confLib.YXV_ConfRCanMix();
		if(!canRec){
			var result = {
				rc:-20,
				msg:'不能进行混合录制'
			};
			loger.info(result);
		}
	
		res_index_list = new Array();
		var retWinIndex1 = new Buffer(4);
		var webContents = win.webContents;
		var date = new Date(Date.now());
		var fileName =date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'-'+date.getHours()+'-'+date.getMinutes()+'-'+date.getSeconds();//Date.now();
		var dirpath = cusUtils.readConf('filePath')+'/'+fileName;
		if(dirpath == ''){
			dirpath = path.join(__dirname,'/temp');
		}
		if (!fs.existsSync(dirpath)) {
	        // fs.mkdirSync(dirpath)
			cusUtils.mkdirsSync(dirpath)
	    } 
		loger.info('startRec:dirpath-'+dirpath);
		var open_result = confLib.YXV_ConfROpen(confHandle,global.canRec,width,height,width*height*3,20,2,48000,128000,confHandlePtr_R);
		loger.info('startRec:YXV_ConfROpen=width-'+width+':height-'+height+':result-'+open_result);
		var is_ok = true;
		if(open_result == 0){
			cusGlobalParam.g_confHandle_R_Set(confHandlePtr_R.deref())
			for (var i = 0; i < MAX_STREAMS; i++) {
				if (cusGlobalParam.g_streamArrGet(i) != null) {
					var addStream_result = confLib.YXV_ConfRAddStream(cusGlobalParam.g_confHandle_R_Get(),i,retWinIndex1);
					loger.info('startRec:YXV_ConfRAddStream=streamindex-'+i+':result-'+addStream_result);
					var winindex = retWinIndex1.readUInt32LE(0);
					res_index_list.push(i+"_"+winindex);
					if(addStream_result != 0 ) is_ok = false;
					// global.g_streamArr[i].rIndex = winindex;
					cusGlobalParam.g_streamArrGet(i).rIndex = winindex;
				}
			}
			confLib.YXV_ConfRSwitchMain(cusGlobalParam.g_confHandle_R_Get(),mianStrIndex);
		}
	
		//生成文件夹但没有录制文件得问题
		// if(is_ok){
			var startRes_result = confLib.YXV_ConfRStartRec(cusGlobalParam.g_confHandle_R_Get(),true,dirpath);
			loger.info('startRec:YXV_ConfRStartRec=dirpath-'+dirpath+':result-'+startRes_result);
		// }
		
		webContents.send('startRec', filePath);
	
	    var starttime = process.uptime()*1000;
	    time_interval = setInterval(function () {
	      var nowtime = process.uptime()*1000;
	      var time = nowtime - starttime;
	      var hour = parseInt(time / 1000 / 60 / 60 % 24) < 10 ? '0'+ parseInt(time / 1000 / 60 / 60 % 24) : parseInt(time / 1000 / 60 / 60 % 24);
	      var minute = parseInt(time / 1000 / 60 % 60) <10 ? '0'+ parseInt(time / 1000 / 60 % 60) : parseInt(time / 1000 / 60 % 60);
	      var seconds = parseInt(time / 1000 % 60) <10 ? '0'+parseInt(time / 1000 % 60):parseInt(time / 1000 % 60);
	      // $('#'+_id).html(hour + ":" + minute + ":" + seconds );
	      webContents.send('recTime', hour + ":" + minute + ":" + seconds );
	    }, 1000)
	
		global.isRec = true;
	},
	
	stopRec:(win)=>{
		loger.info('stopRec');
	
		if (global_pip_caller != null) {
			clearTimeout(global_pip_caller);
			global_pip_caller = null;
		}
		
		var webContents = win.webContents;
		clearInterval(time_interval);
		var stopRecResult = confLib.YXV_ConfRStopRec(cusGlobalParam.g_confHandle_R_Get());
		loger.info('stopRec:YXV_ConfRStopRec=confHandle_R-'+cusGlobalParam.g_confHandle_R_Get()+':result-'+stopRecResult);
		var rCloseResult = confLib.YXV_ConfRClose(cusGlobalParam.g_confHandle_R_Get());
		loger.info('stopRec:YXV_ConfRClose=confHandle_R-'+cusGlobalParam.g_confHandle_R_Get()+':result-'+rCloseResult);
	
		for (var i = 0; i < MAX_STREAMS; i++) {
			if (cusGlobalParam.g_streamArrGet(i)!= null) {
				if (cusGlobalParam.g_streamArrGet(i).refCount == 0) {
					cusStreamWin.avr_reallyRemoveStream(i);
				} else {
					cusGlobalParam.g_streamArrSet(i,-1);
				}
			}
		}
		webContents.send('stopRec', rCloseResult);
		global.isRec = false;
	},
	
	switchPip: (main_stream_index,fyr_stream_index)=>{
		loger.info('switchPip');
		if(!global.isRec)return;
		var param ="",param2="";
		for (var i = 0; i < res_index_list.length; i++) {
			var str = res_index_list[i].split("_");
			if(str[0] == main_stream_index){
				param += '('+str[1]+',0,0,1,1)';
				param2 += '('+str[1]+',0,0,1,1)';
			}
		}
	
		if (global_pip_caller != null) {
			clearTimeout(global_pip_caller);
			global_pip_caller = null;
		}
	
		if (global_student_up == null) {
			global_student_up = readConf('stuUp');
			if (global_student_up == null) global_student_up = 5000;
		}	
	
		var firstPipIsBig = global_student_up > 0;
		for (var i = 0; i < res_index_list.length; i++) {
			var str = res_index_list[i].split("_");
			if(str[0] == fyr_stream_index){
				if (firstPipIsBig) {
					param += ',('+str[1]+',0,0.19,0.62,0.81)';
					param2 += ',('+str[1]+',0.64,0.6,0.99,0.95)';
				} else {
					param += ',('+str[1]+',0.64,0.6,0.99,0.95)';
				}
			}
		}
		setTimeout(function(){
			var switch_result = confLib.YXV_ConfRSwitchPip(cusGlobalParam.g_confHandle_R_Get(),param);
			loger.info('switchPip:YXV_ConfRSwitchPip=param-'+param+':result-'+switch_result);
			if (firstPipIsBig) {
				global_pip_caller = setTimeout(function () {
					switch_result = confLib.YXV_ConfRSwitchPip(cusGlobalParam.g_confHandle_R_Get(),param2);
					loger.info('switchPip:YXV_ConfRSwitchPip_tosmall=param-'+param2+':result-'+switch_result);
				}, global_student_up);
			}
		},200-40);
	
	},
	switchMain: (main_stream_index)=>{
		if(!global.isRec)return;
	
		if (global_pip_caller != null) {
			clearTimeout(global_pip_caller);
			global_pip_caller = null;
		}
		
		for (var i = 0; i < res_index_list.length; i++) {
			var str = res_index_list[i].split("_");
			if(str[0] == main_stream_index){
				
				setTimeout(function(){
					var switch_result = confLib.YXV_ConfRSwitchMain(cusGlobalParam.g_confHandle_R_Get(),str[1]);
					loger.info('switchPip:YXV_ConfRSwitchMain=param-'+str[1]+':result-'+switch_result);
				},200-40);
				break;
			}
		}
	},


}
module.exports=record;