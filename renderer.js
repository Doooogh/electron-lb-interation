const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const BrowserView = electron.BrowserView
var ref = require('ref')
const ffi = require('ffi')
var UUID = require('uuid');
const config = require('./conf.js')
const loger = require('./res/js/loger.js')
const path = require('path')
var fs = require('fs')
const http = require('http');
const os = require('os');
const urllib = require('url');
const _confPath = os.homedir()+"/"+config.BASE_CONF_PATH;

// -------------------------------归类
//dll 
const confLib=require('./res/js/main-js/conf-lib.js')

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
let time_interval;

/* let YXV_Conf = 'void' // `sqlite3` is an "opaque" type, so we don't know its layout   1
  , YXV_ConfPtr = ref.refType(YXV_Conf)  1
  , YXV_ConfPtrPtr = ref.refType(YXV_ConfPtr)
  , stringPtr = ref.refType('string')  1

let YXV_Conf_R = 'void' // `sqlite3` is an "opaque" type, so we don't know its layout 1
  , YXV_ConfPtr_R = ref.refType(YXV_Conf_R)  1
  , YXV_ConfPtrPtr_R = ref.refType(YXV_ConfPtr_R)

var dllPath =  path.join('AVConfLib.dll')
var confLib = ffi.Library(dllPath, {
    'YXV_ConfFindTitleOffset': ['void', [ 'pointer', 'pointer', 'pointer' ] ],
    'YXV_ConfInit': ['int', [ YXV_ConfPtrPtr ]],
    'YXV_ConfAddStream': ['int', [YXV_ConfPtr, 'int', 'string','int']],//加载视频
    'YXV_ConfRemoveStream': ['void', [YXV_ConfPtr, 'int']], 
    'YXV_ConfAddDisplay': ['int', [YXV_ConfPtr, 'int', 'int', 'int', 'int', 'int', 'int', 'pointer', 'pointer']],
    'YXV_ConfAddDisplay2': ['int', [YXV_ConfPtr, 'int', 'int', 'string', 'pointer', 'pointer']],//string:l,t,r,b(10,0,0,20)(10,2,3,20)
    'YXV_ConfRemoveDisplay': ['void', [YXV_ConfPtr, 'int', 'int']],//streamindex， winindex
	'YXV_ConfExit': ['void', [YXV_ConfPtr]],
	'YXV_ConfGetDevNameListV':['int',['int','string']],//获取视频字符串
	'YXV_ConfGetDevNameListA':['int',['int','string']],//获取音频字符串
	'YXV_ConfAddLocalStream':['int',[YXV_ConfPtr,'int','string','string','int','int']],//加载本地音视频
	'YXV_ConfStartSend':['int',[YXV_ConfPtr,'int','string']],//入会
	'YXV_ConfGetStreamVol':['int',[YXV_ConfPtr,'int','pointer']],//获取音量  streamindex， （返回参数）vol
	'YXV_ConfSetStreamVol':['int',[YXV_ConfPtr,'int','int']],//设置音量  streamindex， vol
	'YXV_ConfSetStreamAEC':['int',[YXV_ConfPtr,'int','int','int']],//回声抑制设置  int参数：1开启，0关闭 
	'YXV_ConfStartRec':['int',[YXV_ConfPtr,'string']],//开始录制  参数filePath
	'YXV_ConfStopRec':['int',[YXV_ConfPtr]],//结束录制
	'YXV_ConfMoveDisplay':['int',[YXV_ConfPtr,'int','int','int', 'int', 'int', 'int']],//移动窗口，参数  streamindex,winIndex,left,top,left+width,top+height
	'YXV_ConfMoveDisplay2':['int',[YXV_ConfPtr,'int','int','string']],//string:l,t,r,b(10,0,0,20)(10,2,3,20)
	'YXV_ConfChangeDisplay':['int',[YXV_ConfPtr,'int','int','int','pointer']],//替换streamindex
	//------------------------------------------------------------------
	//int-1:是否混合(0|1)，
	//int-2:混合结果width
	//int-3:height
	//int-4:码率（w*h*3）
	//int-5:帧率(15~30)
	//int-6：音频通道数（1，单通道   2 立体声）1
	//int-7：音频采样率 （48000）
	//int-8：音频码率（128000）
	'YXV_ConfROpen':['int',[YXV_ConfPtr,'int','int','int', 'int', 'int', 'int', 'int', 'int',YXV_ConfPtrPtr_R]],
	'YXV_ConfRAddStream':['int',[YXV_ConfPtr_R,'int','pointer']],
	'YXV_ConfRRemoveStream':['int',[YXV_ConfPtr_R,'int']],
	'YXV_ConfRStartRec':['int',[YXV_ConfPtr_R,'int','string']],
	'YXV_ConfRStopRec':['int',[YXV_ConfPtr_R]],
	'YXV_ConfRSwitchPip':['int',[YXV_ConfPtr_R,'string']],
	'YXV_ConfRSwitchMain':['int',[YXV_ConfPtr_R,'int']],
	'YXV_ConfRClose':['int',[YXV_ConfPtr_R]],
	'YXV_ConfRCanMix':['int',[]],
	'YXV_ConfScreenShotEx':['int',['string','pointer','pointer']],//path,
	// YXV_ConfScreenShotEx(const yuint8_t* filename, YXC_Window* window1, YXC_Window* window2);
	'YXV_ConfMakeWindowFullScreen':['int',['pointer']],
	'YXV_ConfGetTaskBarInfo':['int',['pointer', 'pointer','pointer']],
	'YXV_ConfWriteRegistry':['int',['string','string','string']]
}); 

let confHandlePtr = ref.alloc(YXV_ConfPtrPtr)
confLib.YXV_ConfInit(confHandlePtr)
let confHandle = confHandlePtr.deref()

let confHandlePtr_R = ref.alloc(YXV_ConfPtrPtr_R)
let confHandle_R;
*/


const streamArray = []; 
var url;
let videoStr;
let audioStr;
let videoKey;
let audioKey;
let interval_int;
let myAudioStreamindex;
let mainStreamindex;
let mainWinindex;
let currentVideo;
let currentAideo;
let filePath;
let windowSeq=0;
let WIN_MAX_STREAMS=16,MAX_STREAMS=100;




exports.mainStreamindex = function(){
	return mainStreamindex;
}
exports.mainWinindex =function(){
	return mainWinindex;
} 

exports.setCurrentVideo = function(_videoStr){
	currentVideo = _videoStr;
}

exports.setCurrentAideo = function(_aideoStr){
	currentAideo = _aideoStr;
}

var g_streamArr = new Array();

/* videoStream: struct
  url -> streamURL
  index -> streamIndex
  refCount -> refCount
  rIndex -> recorder index */

function avr_findIdleStreamIndex()
{
	for (var i = 0; i < MAX_STREAMS; ++i) {
		if (g_streamArr[i] == null) {
			return i;
		}
	}

	return -1;
}

function avr_reallyRemoveStream(streamIndex) {
	var stream = g_streamArr[streamIndex];
	if (stream != null && stream.refCount == 0 && stream.rIndex == -1) {
		confLib.YXV_ConfRemoveStream(confHandle, streamIndex);
		loger.info('avr_reallyRemoveStream:' + streamIndex);
		g_streamArr[streamIndex] = null;
	}
}

function avr_RemoveStreamAndWindow(streamIndex, winIndex) {
	var stream = g_streamArr[streamIndex];

	if (stream != null)
	{
		confLib.YXV_ConfRemoveDisplay(confHandle, streamIndex, winIndex);
		var refCount = stream.refCount;
		--stream.refCount;
		if (stream.refCount == 0 && stream.rIndex == -1)  /* the only stream reference, remove stream if too much. */
		{
			setTimeout(function() {
				avr_reallyRemoveStream(streamIndex);
			}, 5000); /* Really remove stream when don't use in 5 seconds, prevent student bug. */
			loger.info('avr_removeStream:' + streamIndex);
		}		
	}
}

function readConf(param) {
    var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
    return data[param];
}

function avr_FindOrAddStream(url) {
	if (url == null) url = "";
	for (var i = 0; i < MAX_STREAMS; ++i) {
		if (g_streamArr[i] != null && g_streamArr[i].url == url) {
			++g_streamArr[i].refCount;
			loger.info('hookWindow:avr_FindOrAddStream ' + url + ' return existing-' + i);
			return i;
		}
	}

	var newIndex = avr_findIdleStreamIndex();
	loger.info("g_streamArr newIndex"+newIndex);
	var srInfo = {};
	srInfo.url = url;
	srInfo.refCount = 1;
	srInfo.rIndex = -1;
	srInfo.index = newIndex; 
	g_streamArr[newIndex] = srInfo;

    var delayMS = readConf("millisecond");
    if (delayMS == null) delayMS = 200;
	var addStreamResult = confLib.YXV_ConfAddStream(confHandle, srInfo.index, url, delayMS);
	loger.info('hookWindow:YXV_ConfAddStream=streamindex-'+srInfo.index+':result-'+addStreamResult+':url-'+url+':delay-'+delayMS);

	return srInfo.index;
}

/* videoWindow: struct
  parent -> parent window;
  wnd -> electron window;
  l -> current l;
  t -> current t;
  r -> current r;
  b -> current b;
  streamIndex[16] -> current stream index;
  isCanvas -> is using canvas;
  vol -> current vol;
  winIndex[16] -> display index;
  windowId -> window unique id;
  refCount -> refCount;
 */

 function avr_removeWindowByIndex(vwl, index, exited) {
	var vwInfo = vwl[index];
	
	var wsCount = vwInfo.streamIndex.length;
	for (var j = 0; j < wsCount; ++j)
	{
		if (vwInfo.streamIndex[j] != -1)
		{
			avr_RemoveStreamAndWindow(vwInfo.streamIndex[j], vwInfo.winIndex[j]);
		}
		vwInfo.streamIndex[j] = -1;
		vwInfo.winIndex[j] = -1;
	}

	if (!exited) {
		vwInfo.wnd.hide();
		vwInfo.using = false;

		loger.info('avr_removeWindowByIndex:windowHide-'+index);
		//setTimeout(function () {
		//	avr_realDestroyWindow()
		//}, 5000);		
	} else {
		vwInfo.wnd.destroy();
		vwl.splice(index, 1);

		loger.info('avr_removeWindowByIndex:windowDestroy-'+index);
	}
 }

function avr_removeWindow(vwl, windowId, closeWindow) {
	loger.info('avr_removeWindow:windowId-'+windowId);
	for (var i = 0; i < vwl.length; ++i)
	{
		var vwInfo = vwl[i];
		if (vwInfo.windowId == windowId) /* window already exists, */
		{
			loger.info('avr_removeWindow:index-'+i+',refCount:'+vwInfo.refCount);
			--vwInfo.refCount;
			if (vwInfo.refCount == 0)
			{
				avr_removeWindowByIndex(vwl, i, closeWindow);
			}

			var streams_str = 'avr_streams:';
			for (var x = 0; x < MAX_STREAMS; ++x)
			{
				if (g_streamArr[x] != null) streams_str += 'stream' + x + ":" + JSON.stringify(g_streamArr[x]);
			}
			loger.info(streams_str);
			break;			
		}
	}
}

function avr_findWindow(vwl, windowId) {
	for (var i = 0; i < vwl.length; ++i)
	{
		var vwInfo = vwl[i];
		if (vwInfo.windowId == windowId) /* window already exists, */
		{
			return vwInfo;
		}
	}

	return null;
}

function avr_findRealBounds(mainWindow, l, t, w, h) {
	var bounds = mainWindow.getBounds();

	var scale = global.externalDisplay.scaleFactor;
	var newBounds = { "x":l + bounds.x*scale, "y": t + bounds.y*scale, "width": w, "height": h };

	let hwnd = mainWindow.getNativeWindowHandle() //获取窗口句柄。

	var isMax = mainWindow.isMaximized();
	//if (!isMax)
	//{
	var retX = new Buffer(4), retY = new Buffer(4);
	confLib.YXV_ConfFindTitleOffset(hwnd, retX, retY);

	var xOff = retX.readInt32LE(0), yOff = retY.readInt32LE(0);
	newBounds.x -= xOff*scale;
	newBounds.y -= yOff*scale;
	if (isMax)
	{
		newBounds.x -= xOff*scale;
		newBounds.y -= yOff*scale;		
	}

	newBounds.x = parseInt(Math.round(newBounds.x));
	newBounds.y = parseInt(Math.round(newBounds.y));
	loger.info("avr_findRealBounds:" + JSON.stringify(newBounds)+ ',xOff='+xOff+',yOff='+yOff);
	return newBounds;
}

function avr_addWindow(mainWindow, l, t, w, h, windowId) {
	var newVW = {};
	// var sdf = pipJson.ltrb.split(",");
	var bounds = avr_findRealBounds(mainWindow, l, t, w, h);

	var videoWindow = new BrowserWindow(
      {
        title:"childVideoWindow",
        focusable:false,
        frame:true,
        autoHideMenuBar:true,
        resizable:false,
        moveable:false, 
        closable:false,
		minimizable:false,
		maximizable:false,
        parent:mainWindow,
        modal:false,
        transparent:false, 
        backgroundColor:"#000000", 
        webPreferences: {
           plugins: true,
           preload: path.join(__dirname, 'res/js', 'preload.js'),
        }, 
        show:false
      });

	var url2 = urllib.format({
      pathname: path.join(__dirname, 'view_complex/html/video.html'),
      protocol: 'file:',
      slashes: true
    });
	videoWindow.setBounds(bounds);
	videoWindow.on('ready-to-show', function () {
		videoWindow.show();
	});
    videoWindow.loadURL(url2 + "?windowId=" + windowId);
    // videoWindow.openDevTools();
    newVW.wnd = videoWindow;
    newVW.parent = mainWindow;
    newVW.l = l;
    newVW.t = t;
    newVW.w = w;
    newVW.h = h;

    newVW.streamIndex = Array();
    newVW.winIndex = Array();

    for (var i = 0; i < WIN_MAX_STREAMS; ++i) {
    	newVW.streamIndex[i] = -1;
    	newVW.winIndex[i] = -1;
    }
    newVW.refCount = 1;
    newVW.windowId = windowId;
    newVW.using = true;
    newVW.isCanvas = false;

    return newVW;
}


//11111111111
exports.moveChildWindows = function(mainBounds, vwl)
{
	for (var i = 0; i < vwl.length; ++i)
	{
		var videoWindow = vwl[i];
		var newBounds = {};
		newBounds.x = mainBounds.x + videoWindow.l;
		newBounds.y = mainBounds.y + videoWindow.t;
		newBounds.width = videoWindow.w;
		newBounds.height = videoWindow.h;
		if(videoWindow.wnd.isDestroyed()){
			videoWindow.wnd.setBounds(newBounds);
		}
	}
}

exports.hookWindow = function (mainWindow,vwl,ltwhArrays,urls,snList,noVolList,clickWindowId)
{
	if(!urls[0]) return;
   	loger.info('hookWindow:ltwhArrays='+ltwhArrays+';urls='+urls+';snList='+snList+';noVolList='+noVolList + ";windowId"+clickWindowId);
	var pipJson = initPips(ltwhArrays);
	loger.info("hookWindow:pipJson="+JSON.stringify(pipJson));

	var streamIndexArray = new Array();

	if (clickWindowId == null)
	{
		clickWindowId = "0";
	}

	var ltrbInfo = pipJson.ltrbInfo;
	var vwNew = avr_findWindow(vwl, clickWindowId);
	if (vwNew != null)
	{
		loger.info("Hook window already exists!using-"+vwNew.using + "windowId"+clickWindowId);
		if (vwNew.using) {
			return;	
		}
		vwNew.windowId = clickWindowId;
		var bounds = mainWindow.getBounds();

		var newBounds = avr_findRealBounds(mainWindow, ltrbInfo[0], ltrbInfo[1], ltrbInfo[2], ltrbInfo[3]);
		vwNew.wnd.setBounds(newBounds);
		vwNew.wnd.show();
		vwNew.using = true;
		vwNew.refCount = 1;
	}
	else
	{
		loger.info("Create window, id=" + clickWindowId);
		vwNew = avr_addWindow(mainWindow, ltrbInfo[0], ltrbInfo[1], ltrbInfo[2], ltrbInfo[3], clickWindowId);
	}
	//avr_removeWindow(vwl, windowId);

	var vwIndex0 = vwl.length * 16;
	var winIndexList = Array();
    vwl[vwl.length] = vwNew;

	let hwnd = vwNew.wnd.getNativeWindowHandle() //获取窗口句柄。

	var pips = pipJson.pips;
	for (var i = 0; i < pips.length; i++) {
		streamIndexArray[i+1] = avr_FindOrAddStream(urls[i+1]);
		vwNew.streamIndex[i+1] = streamIndexArray[1];

		var retWinIndex1 = new Buffer(4);
		var pip_result = confLib.YXV_ConfAddDisplay2(confHandle, vwNew.streamIndex[i+1], 0, pipJson.pips[i], hwnd, retWinIndex1);
	 	loger.info('hookWindow:pip_result=streamindex-'+vwNew.streamIndex[i+1]+':ltrb-'+pipJson.pips[i]+':hwnd-'+hwnd+':result-'+pip_result);
		vwNew.winIndex[i+1] = retWinIndex1.readUInt32LE(0);
		winIndexList[i + 1] = "" + clickWindowId + "|" + vwNew.winIndex[i+1];

		var vol = noVolList ? (noVolList[i+1] ? noVolList[i+1] : 0) : 0;
		confLib.YXV_ConfSetStreamVol(confHandle, vwNew.streamIndex[i+1], vol);
		++vwNew.refCount;
	}
	
	streamIndexArray[0] = avr_FindOrAddStream(urls[0]);
	vwNew.streamIndex[0] = streamIndexArray[0];

	var retWinIndex1 = new Buffer(4);
	var addDisplay2Result = confLib.YXV_ConfAddDisplay2(confHandle, vwNew.streamIndex[0], 0, pipJson.ltrb, hwnd, retWinIndex1);
	loger.info('hookWindow:YXV_ConfAddDisplay2=streamindex-'+vwNew.streamIndex[0]+':ltrb-'+pipJson.ltrb+':hwnd-'+hwnd+':result-'+addDisplay2Result);
	
	vwNew.winIndex[0] = retWinIndex1.readUInt32LE(0);
	winIndexList[0] = "" + clickWindowId + "|" + vwNew.winIndex[0];

	var vol = noVolList? noVolList[0] ? noVolList[0] : 0 : 0;
	confLib.YXV_ConfSetStreamVol(confHandle, vwNew.streamIndex[0], vol);

	var webContents = mainWindow.webContents;
	webContents.send('onhook', snList, streamIndexArray, winIndexList);
	//loger.info('hookWindow:YXV_ConfSetStreamVol='+streamindexList[i]+':vol-'+vol+':result-'+setStramVolResult);


	// loger.info("hookWindow:hwnd="+hwnd.readUInt32LE(0));
	// var streamindexList = new Array();
	// for (var i = 0; i < urls.length; i++) {
	// 	var streamindex =  getStreamIndex();
	// 	var addStreamResult = confLib.YXV_ConfAddStream(confHandle, streamindex,urls[i], 200);
	// 	streamindexList.push(streamindex);
	// 	loger.info('hookWindow:YXV_ConfAddStream=streamindex-'+streamindex+':result-'+addStreamResult);
	// }
	
	// for (var i = 0; i < streamindexList.length; i++) {
	// 	var vol = noVolList? noVolList[i] ? noVolList[i] : 0 : 0;
	// 	var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,streamindexList[i],vol);
	// 	loger.info('hookWindow:YXV_ConfSetStreamVol='+streamindexList[i]+':vol-'+vol+':result-'+setStramVolResult);
	// }
	// var sdf = pipJson.ltrb.split(",");
	// var addDisplay2Result = confLib.YXV_ConfAddDisplay2(confHandle, streamindexList[0], 0,pipJson.ltrb, hwnd, retWinIndex1);
	// loger.info('hookWindow:YXV_ConfAddDisplay2=streamindex-'+streamindexList[0]+':ltrb-'+pipJson.ltrb+':hwnd-'+hwnd+':result-'+addDisplay2Result);
	// var webContents = mainWindow.webContents;
	// var winindex = retWinIndex1.readUInt32LE(0);
	// winIndexList.push(winindex);
	// var pips = pipJson.pips;
	// loger.info("streamindexList="+streamindexList);
	// for (var i = 0; i < pips.length; i++) {
	// 	var pip_result = confLib.YXV_ConfAddDisplay2(confHandle, streamindexList[i+1], 0,pips[i], hwnd, retWinIndex1);
	// 	var winindex_pip = retWinIndex1.readUInt32LE(0);
	// 	winIndexList.push(winindex_pip);
	// }
}

exports.moveWindow = function (mainWindow,vwl,ltwhArrays,streamindexList,winindexList,noVolList)
{
	var pipJson = initPips(ltwhArrays);
	//设置音量为0
	for (var i = 0; i < streamindexList.length; i++) {
		var vol = noVolList? noVolList[i] ? noVolList[i] : 0 : 0;
		var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,streamindexList[i],vol);
		loger.info('moveWindow:setStramVolResult=streamindex-'+streamindexList[i]+':vol-'+vol+':result-'+setStramVolResult);
	}

   	loger.info('moveWindow:ltwhArrays='+ltwhArrays+';winindexList='+winindexList+';streamindexList='+streamindexList);
	var pipJson = initPips(ltwhArrays);

	var winArr = [];
	if (winindexList[0] != null) winArr = winindexList[0].split("|");
	if (winArr.length <= 1) return;

	var windowId = winArr[0], winSeq = parseInt(winArr[1]);
	loger.info("moveWindow:pipJson="+JSON.stringify(pipJson)+",windowId="+windowId);
	

	var vwInfo = avr_findWindow(vwl, windowId);
	var ltrb = pipJson.ltrb.split(',');
	if (vwInfo == null) return;
	for (var i = 0; i < vwl.length; ++i)
	{
		if (vwl[i].windowId == windowId) /* window already exists, */
		{
			vwl[i].l = ltrb[0];
			vwl[i].t = ltrb[1];
			vwl[i].w = ltrb[2];
			vwl[i].h = ltrb[3];
		}
	}

	var bounds = avr_findRealBounds(mainWindow, pipJson.ltrbInfo[0], pipJson.ltrbInfo[1], pipJson.ltrbInfo[2], pipJson.ltrbInfo[3]);

	vwInfo.wnd.setBounds(bounds);
	
	var moveDisplay2Result = confLib.YXV_ConfMoveDisplay2(confHandle, streamindexList[0], winSeq,pipJson.ltrb);
	loger.info('moveWindow:YXV_ConfMoveDisplay2=streamindex-'+streamindexList[0]+':winindex-'+winSeq+':lerb-'+pipJson.ltrb+':result-'+moveDisplay2Result);
	var pips = pipJson.pips;
	for (var i = 0; i < pips.length; i++) {
		winArr = new Array();
		if (winindexList[i+1] != null) winArr = winindexList[i+1].split("|");
		if (winArr.length >= 2)
		{
			winSeq = parseInt(winArr[1]);
			var pip_result = confLib.YXV_ConfMoveDisplay2(confHandle, streamindexList[i+1], winSeq, pips[i]);
			loger.info('moveWindow:YXV_ConfMoveDisplay2=streamindex-'+streamindexList[i+1]+':winindex-'+winSeq+':lerb-'+pips[i]+':result-'+pip_result);
		}
	}
	var webContents = mainWindow.webContents;
	webContents.send('moveWindow');
}

exports.changeVolWindow = function (thisWindow,streamindexList,volList)
{
	loger.info('changeVolWindow:streamindexList='+streamindexList+':volList-'+volList);
	for (var i = 0; i < streamindexList.length; ++i) {
		loger.info('changeVolWindow:streamindexList='+streamindexList[i]+':volList-'+volList[i]);
		var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,streamindexList[i],volList[i]);
		loger.info('changeVolWindow-setStramVolResult=streamindex-'+streamindexList[i]+':vol:result-'+setStramVolResult);
	}
}


exports.replaceStream = function (thisWindow,vwl,divList,streamindexList,winindexList,volList,newUrls)
{
	loger.info('replaceStream:init=divList-'+divList+';streamindex-'+streamindexList+':winIndex-'+winindexList+':volList-'+volList+':newUrls-'+newUrls);
	
	for (var i = 0; i < MAX_STREAMS; ++i) {
		if (g_streamArr[i] != null) {
			var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,i,0);
			loger.info('replaceStream-MAX_STREAMS:setStramVolResult=streamindex-'+g_streamArr[i]+':vol-0:result-'+setStramVolResult);
		}
	}

	var div_stream_winIndex = new Array();
	var result = {};
	var flag = true;
	for (var i = 0; i < divList.length; i++) {

		

		var winArr = [];
		if (winindexList[i] != null) winArr = winindexList[i].split("|");
		var windowId = winArr[0], winSeq = parseInt(winArr[1]);
		var new_stream_index = -1;
		var changeDisResult = '';
		var winIndex = '';
		var vwInfo = avr_findWindow(vwl, windowId);
		if(newUrls[i] == ''){
			if(streamindexList[i] && streamindexList[i] != ''){
				// avr_removeWindow(vwl, windowId, false);
				/*vwInfo.wnd.hide()*/
				confLib.YXV_ConfRemoveDisplay(confHandle, streamindexList[i], winSeq);
			}
		}else{
			
			if(!vwInfo.wnd.isVisible()){
				/*vwInfo.wnd.show();*/
				vwInfo.refCount = 1;
			}
			new_stream_index = avr_FindOrAddStream(newUrls[i]);
			loger.info('winArr:'+winArr)
			var retWinIndex1 = new Buffer(4);
			loger.info('----winSeq-------------:'+winSeq);
			if(!winSeq){
				loger.info('-----------------');
				var hwnd = vwInfo.wnd.getNativeWindowHandle() //获取窗口句柄。
				var ltrb = '';
				var bounds = vwInfo.wnd.getBounds();
				loger.info(bounds);
				ltrb = '0,0,'+bounds.width+','+bounds.height;
				vwInfo.streamIndex[0] = new_stream_index;
				var addDisplay2Result = confLib.YXV_ConfAddDisplay2(confHandle, vwInfo.streamIndex[0], 0, ltrb, hwnd, retWinIndex1);
				loger.info('replaceStream:YXV_ConfAddDisplay2=streamindex-'+vwInfo.streamIndex[0]+':ltrb-'+ltrb+':hwnd-'+hwnd+':result-'+addDisplay2Result);
				vwInfo.winIndex[0] = retWinIndex1.readUInt32LE(0);
				winIndex = retWinIndex1.readUInt32LE(0);
			}else{
				changeDisResult = confLib.YXV_ConfChangeDisplay(confHandle, streamindexList[i],winSeq,new_stream_index,retWinIndex1);
				winIndex = retWinIndex1.readUInt32LE(0);
				loger.info('replaceStream:changeDisResult-:'+changeDisResult+';streamindex-:'+streamindexList[i]+';windowId-:'+windowId+';winSeq-:'+winSeq+';new_stream_index-:'+new_stream_index);
			}
		}
		if(new_stream_index >= 0){
			var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,new_stream_index,volList[i]);
			loger.info('replaceStream:setStramVolResult=streamindex-'+new_stream_index+':vol-'+volList[i]+':result-'+setStramVolResult);
		}
		new_stream_index = new_stream_index == -1 ? '': new_stream_index;
		div_stream_winIndex.push(divList[i]+'_'+new_stream_index+'_'+windowId+'|'+winIndex+'_'+changeDisResult);
	}
	result.dsw = div_stream_winIndex;
	var webContents = thisWindow.webContents;
	webContents.send('onReplaceStream',result);
}

/*exports.moveMainWindow = function (mainWindow,ltwhArrays)
{
	if(mainStreamindex && mainWinindex){
		var pipJson = initPips(ltwhArrays);
		let hwnd = mainWindow.getNativeWindowHandle() //获取窗口句柄。
		var moveDisplay2Result = confLib.YXV_ConfMoveDisplay2(confHandle, streamindex, winindex,pipJson.ltrb);
		loger.info('moveMainWindow:YXV_ConfMoveDisplay2=streamindex-'+streamindex+':winindex-'+winindex+':lerb-'+pipJson.ltrb+':result-'+moveDisplay2Result);
		var pips = pipJson.pips;
		for (var i = 0; i < pips.length; i++) {
			var pip_result = confLib.YXV_ConfMoveDisplay2(confHandle, streamindex, winindex,pips[i]);
			loger.info('moveMainWindow:YXV_ConfMoveDisplay2=streamindex-'+streamindex+':winindex-'+winindex+':lerb-'+pips[i]+':result-'+pip_result);
		}
	}
}

exports.copyWindow = function (mainWindow,ltwhArrays,streamindex,winindex)
{
	var pipJson = initPips(ltwhArrays);
	if(mainStreamindex && mainWinindex){
		var removeDisplayResult = confLib.YXV_ConfRemoveDisplay(confHandle, mainStreamindex, mainWinindex);
		loger.info('copyWindow:YXV_ConfRemoveDisplay=mainStreamindex-'+mainStreamindex+':mainWinindex-'+mainWinindex+':result-'+removeDisplayResult);
	}
	
	let hwnd = mainWindow.getNativeWindowHandle() //获取窗口句柄。
	var retWinIndex1 = new Buffer(4);
	var addDisplay2Result = confLib.YXV_ConfAddDisplay2(confHandle, streamindex, 0,pipJson.ltrb, hwnd, retWinIndex1);
	loger.info('copyWindow:YXV_ConfAddDisplay2=streamindex-'+streamindex+':ltrb-'+pipJson.ltrb+':result-'+addDisplay2Result);
	var pips = pipJson.pips;
	for (var i = 0; i < pips.length; i++) {
		var pip_result = confLib.YXV_ConfAddDisplay2(confHandle, streamindex, 0,pips[i], hwnd, retWinIndex1);
		loger.info('copyWindow:YXV_ConfAddDisplay2=streamindex-'+streamindex+':ltrb-'+pips[i]+':result-'+pip_result);
	}
	mainStreamindex = streamindex ;
	mainWinindex = retWinIndex1.readUInt32LE(0);
	var webContents = mainWindow.webContents;
	webContents.send('copyWindow');
}

exports.uncopyWindow = function (mainWindow,streamindex,winindex)
{
	if(mainStreamindex && mainWinindex){
		var removeDisplayResult = confLib.YXV_ConfRemoveDisplay(confHandle, mainStreamindex, mainWinindex);
		loger.info('uncopyWindow:YXV_ConfRemoveDisplay=mainStreamindex-'+mainStreamindex+':mainWinindex-'+mainWinindex+':result-'+removeDisplayResult);
	}
	var webContents = mainWindow.webContents;
	webContents.send('uncopyWindow');
}
*/

exports.removeWindow = function (mainWindow,vwl,sn,streamindex,winindex,closeWindow)
{
	loger.info("removeWindow:winindex="+winindex);

	var winArr = winindex.split("|");
	if (winArr.length < 2) return;

	var windowId = winArr[0], winSeq = parseInt(winArr[1]);
	avr_removeWindow(vwl, windowId, closeWindow);

	var webContents = mainWindow.webContents;
	webContents.send('removehook', sn, streamindex);
}

exports.removeAllWindow = function (mainWindow, vwl)
{
	loger.info("removeAllWindow");
	var length = vwl.length;
	for (var i = 0; i < vwl.length; ++i) {
		avr_removeWindowByIndex(vwl, i, true);
		--i;
	}
	mainWindow.webContents.send('removehooks', null,null);
}

/*exports.removeAllWinAndMain = function (mainWindow,streamindexs,mainWinindexs)
{
	for(var i=0;i<streamindexs.length;i++){
		var moveDisplayResult = confLib.YXV_ConfMoveDisplay(confHandle, streamindexs[i], mainWinindexs[i],0,0,1,1);
		loger.info('removeAllWinAndMain:YXV_ConfMoveDisplay=streamindex-'+streamindexs[i]+':winindex-'+mainWinindexs[i]+':result-'+moveDisplayResult);
	}
	if(mainStreamindex && mainWinindex){
		var moveDisplayResult = confLib.YXV_ConfMoveDisplay(confHandle, mainStreamindex, mainWinindex,0,0,0,0);
		loger.info('removeAllWinAndMain:YXV_ConfMoveDisplay=streamindex-'+mainStreamindex+':winindex-'+mainWinindex+':result-'+moveDisplayResult);
	}
	// var webContents = mainWindow.webContents;
	// webContents.send('removeAllWinAndMain');
}*/


exports.getVideoStr = function (mainWindow,left,top,width,height,room_id)
{
	var streamindex = openStream(mainWindow,left,top,width,height);
	// console.log("------openStream----streamindex-------------------------"+streamindex);
	//视频推流，入会
	sendStream(mainWindow,streamindex,room_id);
}

function openStream(mainWindow,left,top,width,height){
	var webContents = mainWindow.webContents;

	var videoUris = getVideos();
	var audioUris = getAudios();
	
	// console.log("audioUris----:"+audioUris);
	if(videoUris.size == 0){
		result = {
			code:-1,
			type:"stream",
			msg:"请插入视频设备！"
		};
		webContents.send('video', result);
		return ;
	}

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
	var retWinIndex3 = new Buffer(4);
	let hwnd = mainWindow.getNativeWindowHandle() //获取窗口句柄。
	
	var streamindex = getStreamIndex();
	if(currentVideo) {
		videoKey = currentVideo;
	} else {
		videoUris.forEach(function (item, key, mapObj) {
		    videoKey = key;
		    return;
		});
	}
	if(currentAideo){
		audioKey = currentAideo;
	}else{
		audioUris.forEach(function (item, key, mapObj) {
		    audioKey = key;
		    return;
		});
	}
	var x = confLib.YXV_ConfAddLocalStream(confHandle,streamindex, videoKey,audioKey,0,0);
	console.log("---------x-------------------=="+x)
	if(x != 0){
		result = {
			code:-1,
			x:x,
			type:"openStream",
			msg:"打开摄像头失败"
		};
		webContents.send('video', result);
		return ;
	}
	// console.log("left:"+left+"-top:"+top+"-left+width:"+(left+width)+"-top+height:"+(top+height));
	confLib.YXV_ConfAddDisplay(confHandle, streamindex, 1,left,top,left+width,top+height, hwnd, retWinIndex3);
	// console.log("--------open------------:" + retWinIndex3.readUInt32LE(0));
	result = {
		code:0,
		type:"openStream",
		msg:"打开摄像头成功",
		streamindex:streamindex,
		winindex:retWinIndex3.readUInt32LE(0)
	};
	webContents.send('video', result);
	return streamindex;
}

function getVideos(){
	console.log("-----------------------getVideos--------------------");
	var retWinIndex1 = new Buffer(2000);
	confLib.YXV_ConfGetDevNameListV(2000, retWinIndex1);
	var v_resultStr = retWinIndex1.toString();
	videoStr = v_resultStr;
	var v_results = v_resultStr.split("|");
	var videsMap =  new Map();
	if(v_results.length > 0){
		for(var i = 1;i<v_results.length-1;i=i+2){
			videsMap.set(v_results[i],v_results[i+1]);
		}
	}
	return videsMap;
}

function getAudios(){
	var retWinIndex2 = new Buffer(2000);
	confLib.YXV_ConfGetDevNameListA(2000, retWinIndex2);
	// console.log("Buffer2 val:" + retWinIndex2.toString("utf8"));
	var a_resultStr = retWinIndex2.toString();
	audioStr = a_resultStr;
	var a_results = a_resultStr.split("|");
	var audiosMap =  new Map();
	if(a_results.length > 1){
		for(var i = 1;i<a_results.length-1;i=i+2){
			audiosMap.set(a_results[i],a_results[i+1]);
		}
	}
	return audiosMap;
}

function sendStream(mainWindow,streamindex,room_id){
	var webContents = mainWindow.webContents;
	var uuid =  UUID.v1();  
	// console.log("uuid--------------------"+uuid+"--------random="+Math.floor(Math.random() * 999999));
	if(!url){
		url = config.RTMP_SERVER+room_id+"_"+uuid;
	}
	// console.log("url===="+url);
	var l = confLib.YXV_ConfStartSend(confHandle,streamindex,url);
	// console.log("--------------l--------------=="+l);
	if(l != 0){
		result = {
			code:-1,
			type:"sendStream",
			msg:"视频推流失败"
		};
		webContents.send('video', result);
	}else{
		result = {
			code:0,
			type:"sendStream",
			msg:"视频推流成功",
			url:url,
			streamindex:streamindex,
		};
		// console.log("result----------"+result.url);
		webContents.send('video', result);
	}
	// console.log("l="+l+"----stmp:"+config.RTMP_SERVER+room_id+"_"+uuid);

}

exports.getSetting = function(win){
	var webContents = win.webContents;
	var result;
	getAudios();
	getVideos();
	result = {
		code:0,
		msg:"获取设置成功",
		videoKey:videoKey,
		audioKey:audioKey,
		audioStr:audioStr,
		videoStr:videoStr,
		fileList:readConf('fileList')
	};
	webContents.send('getSetting', result);
}

exports.setAce = function(win,flag){
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

exports.openAudio = function(win){
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

}


exports.closeAudio = function (win,streamindex)
{
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
		var strIndex = g_streamArr[i];
		if(strIndex != null){
			strIndex = null;
			break;
		}
	}
	clearInterval(interval_int);
}

//---------------------录制----------------------------
exports.startRec =function(win,width,height,mianStrIndex){
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
	var dirpath = readConf('filePath')+'/'+fileName;
	if(dirpath == ''){
		dirpath = path.join(__dirname,'/temp');
	}
	if (!fs.existsSync(dirpath)) {
        // fs.mkdirSync(dirpath)
        mkdirsSync(dirpath)
    } 
	loger.info('startRec:dirpath-'+dirpath);
	var open_result = confLib.YXV_ConfROpen(confHandle,global.canRec,width,height,width*height*3,20,2,48000,128000,confHandlePtr_R);
	loger.info('startRec:YXV_ConfROpen=width-'+width+':height-'+height+':result-'+open_result);
	var is_ok = true;
	if(open_result == 0){
		confHandle_R = confHandlePtr_R.deref();

		for (var i = 0; i < MAX_STREAMS; i++) {
			if (g_streamArr[i] != null) {
				var addStream_result = confLib.YXV_ConfRAddStream(confHandle_R,i,retWinIndex1);
				loger.info('startRec:YXV_ConfRAddStream=streamindex-'+i+':result-'+addStream_result);
				var winindex = retWinIndex1.readUInt32LE(0);
				res_index_list.push(i+"_"+winindex);
				if(addStream_result != 0 ) is_ok = false;
				g_streamArr[i].rIndex = winindex;
			}
		}
		confLib.YXV_ConfRSwitchMain(confHandle_R,mianStrIndex);
	}

	//生成文件夹但没有录制文件得问题
	// if(is_ok){
		var startRes_result = confLib.YXV_ConfRStartRec(confHandle_R,true,dirpath);
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
}

let global_pip_caller = null;
var global_student_up = null; 
exports.stopRec =function(win){
	loger.info('stopRec');

	if (global_pip_caller != null) {
		clearTimeout(global_pip_caller);
		global_pip_caller = null;
	}
	
	var webContents = win.webContents;
	clearInterval(time_interval);
	var stopRecResult = confLib.YXV_ConfRStopRec(confHandle_R);
	loger.info('stopRec:YXV_ConfRStopRec=confHandle_R-'+confHandle_R+':result-'+stopRecResult);
	var rCloseResult = confLib.YXV_ConfRClose(confHandle_R);
	loger.info('stopRec:YXV_ConfRClose=confHandle_R-'+confHandle_R+':result-'+rCloseResult);

	for (var i = 0; i < MAX_STREAMS; i++) {
		if (g_streamArr[i] != null) {
			if (g_streamArr[i].refCount == 0) {
				avr_reallyRemoveStream(i);
			} else {
				g_streamArr[i].rIndex = -1;				
			}
		}
	}
	webContents.send('stopRec', rCloseResult);
	global.isRec = false;
}

exports.switchPip = function (main_stream_index,fyr_stream_index){
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
		var switch_result = confLib.YXV_ConfRSwitchPip(confHandle_R,param);
		loger.info('switchPip:YXV_ConfRSwitchPip=param-'+param+':result-'+switch_result);
		if (firstPipIsBig) {
			global_pip_caller = setTimeout(function () {
				switch_result = confLib.YXV_ConfRSwitchPip(confHandle_R,param2);
				loger.info('switchPip:YXV_ConfRSwitchPip_tosmall=param-'+param2+':result-'+switch_result);
			}, global_student_up);
		}
	},200-40);

}

exports.switchMain = function (main_stream_index){
	if(!global.isRec)return;

	if (global_pip_caller != null) {
		clearTimeout(global_pip_caller);
		global_pip_caller = null;
	}
	
	for (var i = 0; i < res_index_list.length; i++) {
		var str = res_index_list[i].split("_");
		if(str[0] == main_stream_index){
			
			setTimeout(function(){
				var switch_result = confLib.YXV_ConfRSwitchMain(confHandle_R,str[1]);
				loger.info('switchPip:YXV_ConfRSwitchMain=param-'+str[1]+':result-'+switch_result);
			},200-40);
			break;
		}
	}
}


exports.uploadFile =function(win,_filePath,type,fileNo){
	global.is_upload = true;//
	var webContents = win.webContents;
	webContents.send('uploadFile',_filePath);
	if(!_filePath){
		_filePath = filePath;
	}
	fs.exists(_filePath,function(exists){
		if(!exists){
			global.is_upload = false;//
			webContents.send('uploadFile',exists);
		}else{
			var fileName = _filePath.substring(_filePath.lastIndexOf('\\')+1);
			var boundaryKey = Math.random().toString(16); //随机数，目的是防止上传文件中出现分隔符导致服务器无法正确识别文件起始位置
			console.log(boundaryKey);
			var _path = "";
			if(type == "fileUpload"){
				_path = config.FILE_UPLOAD+"?fileName=lessonFile&"+global.url_param;
			}else{
				_path = config.LESSON_UPLOAD+'?fileName=lessonFile&lessonId='+global.lessonId+'&teacherId='+global.teacherId+'&tken='+global.token;
			}
			 var options = {
		    		host: config.HOST,
		    		port: config.PORT,
		    		path: _path,
		    		method: 'POST'
			    };
		   
		    var reqHttps = http.request(options, function(resHttps) {
		    	console.log("statusCode: ", resHttps.statusCode);
		    	console.log("headers: ", resHttps.headers);
		    	var json=''; 
		    	resHttps.on('data', function(data) {
					console.log("body:"+data);
					json+=data;  
					 webContents.send('uploadFile', json);
				});
		     
		    });
		    var payload = '--' + boundaryKey + '\r\n'
		    + 'Content-Type: video/mpeg4\r\n' 
		    + 'Content-Disposition: form-data; name="lessonFile"; filename="'+fileName+'"\r\n'
		    + 'Content-Transfer-Encoding: binary\r\n\r\n';
		    console.log(payload.length);
		    var enddata  = '\r\n--' + boundaryKey + '--';
		    console.log('enddata:'+enddata.length);
		    reqHttps.setHeader('Content-Type', 'multipart/form-data; boundary='+boundaryKey+'');

		    
		    reqHttps.write(payload);
		    
		    var fileStream = fs.createReadStream(_filePath, { bufferSize: 4 * 1024 });
		    fileStream.pipe(reqHttps, {end: false});

		    var stat = fs.statSync(_filePath);
			var totalSize = stat.size;
			var passedLength = 0;
			var lastSize = 0;
			var startTime = Date.now();
			var fs_interval;
		    fileStream.on('data', function (chunk) {
			     passedLength += chunk.length;
			});
			fs_interval = setInterval(function show() {
				  var percent = Math.ceil((passedLength / totalSize) * 100);
				  var size = Math.ceil(passedLength / 1000);
				  var diff = size - lastSize;
				  lastSize = size;
				  var _result = {
				  	"status":"uploadding",
				  	"totleSize":Math.ceil(totalSize/1000000),
				  	"percent":percent,
				  	"completeSize":size/1000,
				  	"speed":Math.ceil(diff),
				  	"timeForUsed":(Date.now()-startTime)/1000,
				  	"fileNo":fileNo
				  }
				  webContents.send('uploadFile',_result);
				}, 1000);

		    fileStream.on('end', function() {
		    	reqHttps.end(enddata); 
		    	webContents.send('uploadFile', 'file upload finished!');
		    	global.is_upload = false;
		    	var endTime = Date.now();
		    	var _result = {
				  	"status":"uploaded",
				  	"totleSize":Math.ceil(totalSize/1000000),
				  	"completeSize":Math.ceil(totalSize/1000000),
				  	"timeForUsed":(endTime - startTime) / 1000,
				  	"fileNo":fileNo
				  }
				webContents.send('uploadFile',_result);
		    	if(fs_interval){
		    		clearInterval(fs_interval);
		    	}
		    });
		    
		    reqHttps.on('error', function(e) {
		    	webContents.send('uploadFile', e);
		    	console.error("error:"+e);
		    	global.is_upload = false;
		    	if(fs_interval){
		    		clearInterval(fs_interval);
		    	}
		    });
		}
	})
}


exports.getFlagAndMil = function(win){
	console.log("---------flag-----"+readConf('flag'));
	var webContents = win.webContents;
	webContents.send('onGetFlagAndMil', readConf('flag'),readConf('millisecond'));
}

function setFlagAndMil(win,flag,millisecond){
	writeConffm(win,flag,millisecond);
	var webContents = win.webContents;
	webContents.send('onSetFlagAndMil', 'ok');
}

function writeConf(win,data) {
    fs.writeFile(_confPath+ "/conf.json", JSON.stringify(data, null, "   "), function(err, data) {
    	if(win !=null)
    	{
			var webContents = win.webContents;
	    	var _result;
	    	if(err){
	    		_result ={
	    			'status':'error',
	    			'msg':err
	    		}
	    	}else{
				_result ={
	    			'status':'ok',
	    			'msg':''
	    		}
	    	}
			webContents.send('writeConf',_result);
    	}
    	
    })
}

function writeConffm(win,flag,millisecond) {
    var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
    data['flag'] = parseInt(flag);
    data['millisecond'] = parseInt(millisecond);
    writeConf(win,data);
}

exports.changeFilePath = function(win,_filePath){
	var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
    data['filePath'] = _filePath;
    writeConf(win,data);
    global.filePath = true;
	var webContents = win.webContents;
	webContents.send('changeFilePath', 'ok');
}

exports.fileListAdd = function(win,_filePath){
	var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
    var fileList = data.fileList;
    var file = {'lessonId':global.lessonId,'path':_filePath,'status':'add','lessonName':global.lessonName};
    fileList.push(file);
    data['fileList'] = fileList;
    writeConf(win,data);
	var webContents = win.webContents;
	webContents.send('changeFilePath', 'ok');
}

exports.fileListFinish = function(win,fileNo){
	var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
    var fileList = data.fileList;
    for(var i=0;i<fileList.length;i++){
    	if(fileList[i].path.indexOf(fileNo)>=0){
    		fileList[i].status = 'finish';
    		break;
    	}
    }
    data['fileList'] = fileList;
    writeConf(win,data);
}

exports.fileListRemove = function(win,fileNo){
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
}

exports.getFilePath = function(win){
	var dirpath = readConf('filePath');
	if(dirpath == ''){
		dirpath = path.join(__dirname,'/temp');
	}
	var webContents = win.webContents;
	webContents.send('getFilePath', dirpath);
}

exports.initFilePath = function(win){
	var isInit = false;
	if(readConf('filePath') != ''){
		isInit = true;
	}
	var webContents = win.webContents;

	webContents.send('initFilePath', isInit);
	return isInit;
}

exports.createConf = function(callback)
{
	  if (!fs.existsSync(_confPath +"/conf.json")) {
	  	if(!fs.existsSync(_confPath)){
			mkdirsSync(_confPath);
	  	}
         var data ={
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
		
	   fs.writeFileSync(_confPath+"/conf.json", JSON.stringify(data, null, "   "))
	   	callback()
       }else{
       	callback()
       }

}

function initPips(ltwhArrays){
	var scale = global.externalDisplay.scaleFactor;
	loger.info("scale:"+scale);
	var ltrb = '';
	var pips = Array();
	var ltrbInfo = Array();

	if (ltwhArrays.length > WIN_MAX_STREAMS * 4)
	{
		ltwhArrays.splice(WIN_MAX_STREAMS * 4, ltwhArrays.length - WIN_MAX_STREAMS * 4);
	}

	for (var i = 0; i < ltwhArrays.length; i+=4) {
		ltwhArrays[i+2] = Math.round(ltwhArrays[i+2]*scale);
		ltwhArrays[i+3] = Math.round(ltwhArrays[i+3]*scale);
		ltwhArrays[i] = Math.round(ltwhArrays[i]*scale);
		ltwhArrays[i+1] = Math.round(ltwhArrays[i+1]*scale);
	}

	ltrbInfo[0] = ltwhArrays[0];
	ltrbInfo[1] = ltwhArrays[1];
	ltrbInfo[2] = ltwhArrays[2];
	ltrbInfo[3] = ltwhArrays[3];
	for (var i = 0; i < 4; ++i)
	{
		ltrbInfo[i] = parseInt(ltrbInfo[i]);
	}

	for (var i = 0; i < ltwhArrays.length; i+=4) {
		var l = (ltwhArrays[i]);
		var t = (ltwhArrays[i+1]);
		if (i < 4) {
			l -= ltrbInfo[0];
			t -= ltrbInfo[1];
		}
		var r = ltwhArrays[i+2]+l;
		var b = ltwhArrays[i+3]+t;
		if(i == 0){
			ltrb += l+','+t+','+r+','+b;
		}else{
			ltrb += '('+l+','+t+','+r+','+b+')';
			pips.push(l+','+t+','+r+','+b);
		}
	}


	var pipJson = {
		ltrb : ltrb,
		pips : pips, 
		ltrbInfo : ltrbInfo
	};
	return pipJson;
}

function mkdirsSync(dirpath, mode) { 
    try
    {
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function (dirname) {  //这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
                if (pathtmp) {
                    pathtmp = path.join(pathtmp, dirname);
                }
                else {
                    pathtmp = dirname;
                }
                if (!fs.existsSync(pathtmp)) {
                    if (!fs.mkdirSync(pathtmp, mode)) {
                        return false;
                    }
                }
            });
        }
        return true; 
    }catch(e)
    {
		loger.info("create director fail! path=" + dirpath +" errorMsg:" + e);
        return false;
    }
}


exports.screenShotEx = function (sendWin,win1,win2){
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
}

exports.YXV_ConfMakeWindowFullScreen = function(win){
	var hwnd = null;
	if(win != null){
		hwnd = win.getNativeWindowHandle() //获取窗口句柄。
		var fullScreenResult = confLib.YXV_ConfMakeWindowFullScreen(hwnd);
		loger.info("YXV_ConfMakeWindowFullScreen:fullScreenResult-"+fullScreenResult);
	}
}

exports.YXV_ConfGetTaskBarInfo = function(){
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
}

exports.YXV_ConfWriteRegistry = function(regStr,key,val){
	loger.info('YXV_ConfWriteRegistry:regStr='+regStr+';key='+key+';val='+val);
	var WriteRegistryResult = confLib.YXV_ConfWriteRegistry(regStr,key,val);
	loger.info("YXV_ConfWriteRegistry:WriteRegistryResult-"+WriteRegistryResult);
}

