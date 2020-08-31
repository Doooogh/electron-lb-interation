/**
 * 系统操作
 */

const cusConst = require('./const.js')
const fs = require('fs')
const http = require('http')
const config = require('./../../../conf.js')
const cusUtils=require('./cus-utils.js')

var _confPath=cusConst._confPath;

var cusSystem={

	getFlagAndMil:(win)=>{
		console.log("---------flag---------------------------------"+cusUtils.readConf('flag'));
		var webContents = win.webContents;
		console.log(cusUtils.readConf('flag'));
		webContents.send('onGetFlagAndMil', cusUtils.readConf('flag'),cusUtils.readConf('millisecond'));
	},
	
	//改变文件路径
	changeFilePath:(win,_filePath)=>{
		var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
	    data['filePath'] = _filePath;
	    cusUtils.writeConf(win,data);
	    global.filePath = true;
		var webContents = win.webContents;
		webContents.send('changeFilePath', 'ok');
	},
	//添加文件
	fileListAdd : (win,_filePath)=>{
		var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
	    var fileList = data.fileList;
	    var file = {'lessonId':global.lessonId,'path':_filePath,'status':'add','lessonName':global.lessonName};
	    fileList.push(file);
	    data['fileList'] = fileList;
	    cusUtils.writeConf(win,data);
		var webContents = win.webContents;
		webContents.send('changeFilePath', 'ok');
	},
	fileListFinish :(win,fileNo)=>{
		var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
	    var fileList = data.fileList;
	    for(var i=0;i<fileList.length;i++){
	    	if(fileList[i].path.indexOf(fileNo)>=0){
	    		fileList[i].status = 'finish';
	    		break;
	    	}
	    }
	    data['fileList'] = fileList;
	    cusUtils.writeConf(win,data);
	},
	//删除文件
	fileListRemove:(win,fileNo)=>{
		var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
	    var fileList = data.fileList;
	    for(var i=0;i<fileList.length;i++){
	    	if(fileList[i].path.indexOf(fileNo)>=0){
	    		fileList.splice(i, 1); 
	    		break;
	    	}
	    }
	    data['fileList'] = fileList;
	    writeConf(win,data);
	},
	
	//向win 窗口 发送配置文件路径
	getFilePath:(win)=>{
		var dirpath = cusUtils.readConf('filePath');
		if(dirpath == ''){
			dirpath = path.join(__dirname,'/temp');
		}
		var webContents = win.webContents;
		webContents.send('getFilePath', dirpath);
	},
	
	//向win窗口发送 配置配置文件 初始化状态
	initFilePath:(win)=>{
		var isInit = false;
		if(cusUtils.readConf('filePath') != ''){
			isInit = true;
		}
		var webContents = win.webContents;
	
		webContents.send('initFilePath', isInit);
		return isInit;
	},
	
	//创建配置文件
	createConf: (callback,configData)=>{
		  if (!fs.existsSync(_confPath +"/conf.json")) {
		  	if(!fs.existsSync(_confPath)){
				cusUtils.mkdirsSync(_confPath);
		  	}
		  	var data={};
		  	if(undefined==configData){
				data=  cusConst.confDefaultData;
			}else{
				data=  configData;
			}

	        /* var data ={
				"flag": null,
				"millisecond": 200,
				"host":"39.105.40.33",
				"port":"80",
				"nginx":"http://39.105.40.33:8083",
				"mcu":"http://39.105.40.33:8288",
				"rmanager":"http://39.105.40.33:8343",
				"dynamic":"easyhao",
				"userName":"",
				"passWord":"",
				"isRemember":false,
				"pip":0,
	   			"stuUp":0,
	   			"plan":"a",//a 通用型  b 黑板方案 
				"filePath": _confPath,
				"fileList": [],
				"status":"",//zp 主屏 fp 辅助屏
				"hdType":"outer",//默认外网互动，inner 内网  outer 外网
				"in_uType":"teacher",//内网互动时使用，teacher 主讲老师  student  听课学生
				"in_mcu":"http://192.168.155.20:8082",
				"in_rmanager":"http://192.168.155.20:8234",
				"in_roomId":1000,
				"in_clientId":1,
				"in_clientName":"默认教室",
				"in_courseName":"内网互动课",
				"recName":"admin",
				"recPwd":"999999",
				"deviceId":"",//设备ID
				"bitstream":1,
				"nginxFilePath":""
			}
			*/
		   fs.writeFileSync(_confPath+"/conf.json", JSON.stringify(data, null, "   "))
		   	callback()
	       }else{
	       	callback()
	       }
	
	},
	
	screenShotEx:(sendWin,win1,win2)=>{
		var filepath = _confPath+'/temp.png';
		var hwnd1 = null,hwnd2 = null;
		if(win1 != null){
			hwnd1 = win1.getNativeWindowHandle() //获取窗口句柄。
		}
	
		if(win2 != null){
			hwnd2 = win2.getNativeWindowHandle() //获取窗口句柄。
		}
		loger.info("screenShotEx:filepath-"+filepath+";hwnd1-"+hwnd1+";hwnd2-"+hwnd2);
		var screenShotEx_result = confLib.YXV_ConfScreenShotEx(filepath,hwnd1,hwnd2);
		loger.info("screenShotEx:screenShotEx_result-"+screenShotEx_result);
		if(screenShotEx_result == 0){
			sendWin.webContents.send("screenShotEx",filepath);
		}
	},
	YXV_ConfMakeWindowFullScreen:(win)=>{
		var hwnd = null;
		if(win != null){
			hwnd = win.getNativeWindowHandle() //获取窗口句柄。
			var fullScreenResult = confLib.YXV_ConfMakeWindowFullScreen(hwnd);
			loger.info("YXV_ConfMakeWindowFullScreen:fullScreenResult-"+fullScreenResult);
		}
	},
	YXV_ConfGetTaskBarInfo :()=>{
		var retWidth = new Buffer(4);
		var retHieght = new Buffer(4);
		var retPosition = new Buffer(4);
		var GetTaskBarInfoResult = confLib.YXV_ConfGetTaskBarInfo(retWidth,retHieght,retPosition);
		loger.info("YXV_ConfGetTaskBarInfo:GetTaskBarInfoResult-"+GetTaskBarInfoResult);
		if(GetTaskBarInfoResult == 0){
			var width = retWidth.readUInt32LE(0);
			var height = retHieght.readUInt32LE(0);
			var position = retPosition.readUInt32LE(0);
			loger.info('YXV_ConfGetTaskBarInfo:width='+width+';height='+height+';position='+position);
			// callback(width,height,position);
			var result = {};
			result.width = width;
			result.height = height;
			result.position = position;
			return result;
		}
		return null;
	},
	YXV_ConfWriteRegistry :(regStr,key,val)=>{
		loger.info('YXV_ConfWriteRegistry:regStr='+regStr+';key='+key+';val='+val);
		var WriteRegistryResult = confLib.YXV_ConfWriteRegistry(regStr,key,val);
		loger.info("YXV_ConfWriteRegistry:WriteRegistryResult-"+WriteRegistryResult);
	},

	//获取配置信息
	getSetting:(win)=>{
		var webContents = win.webContents;
		var result;
		cusUtils.getAudios();
		cusUtils.getVideos();
		result = {
			code:0,
			msg:"获取设置成功",
			videoKey:global.videoKey,
			audioKey:global.audioKey,
			audioStr:global.audioStr,
			videoStr:global.videoStr,
			fileList:cusUtils.readConf('fileList')
		};
		webContents.send('getSetting', result);
	},

	
	
	
	
}

module.exports=cusSystem;