const confLib=require('./conf-lib.js')
const loger = require('../loger.js')
const libParamType=require('./cus-lib-param-type.js')
//后期更换 
const WIN_MAX_STREAMS=16,
	  MAX_STREAMS=100;
	  
let mainStreamindex;
var g_streamArr = new Array();

var cusStreamWin={
	mainStreamindex:()=>{
		return mainStreamindex;
	},
	
	avr_FindOrAddStream:(url)=> {
		if (url == null) url = "";
		for (var i = 0; i < MAX_STREAMS; ++i) {
			if (g_streamArr[i] != null && g_streamArr[i].url == url) {
				++g_streamArr[i].refCount;
				loger.info('hookWindow:avr_FindOrAddStream ' + url + ' return existing-' + i);
				return i;
			}
		}
	
		var newIndex = cusStreamWin.avr_findIdleStreamIndex();
		loger.info("g_streamArr newIndex"+newIndex);
		var srInfo = {};
		srInfo.url = url;
		srInfo.refCount = 1;
		srInfo.rIndex = -1;
		srInfo.index = newIndex; 
		g_streamArr[newIndex] = srInfo;
	
	    var delayMS = readConf("millisecond");
	    if (delayMS == null) delayMS = 200;
		var addStreamResult = confLib.YXV_ConfAddStream(libParamType.confHandle, srInfo.index, url, delayMS);
		loger.info('hookWindow:YXV_ConfAddStream=streamindex-'+srInfo.index+':result-'+addStreamResult+':url-'+url+':delay-'+delayMS);
	
		return srInfo.index;
	},
	
	avr_findIdleStreamIndex:()=>{
		for (var i = 0; i < MAX_STREAMS; ++i) {
			if (g_streamArr[i] == null) {
				return i;
			}
		}
	
		return -1;
	},
	avr_reallyRemoveStream:(streamIndex)=> {
		var stream = g_streamArr[streamIndex];
		if (stream != null && stream.refCount == 0 && stream.rIndex == -1) {
			confLib.YXV_ConfRemoveStream(confHandle, streamIndex);
			loger.info('avr_reallyRemoveStream:' + streamIndex);
			g_streamArr[streamIndex] = null;
		}
	},
	avr_RemoveStreamAndWindow:(streamIndex, winIndex)=> {
		var stream = g_streamArr[streamIndex];
	
		if (stream != null)
		{
			confLib.YXV_ConfRemoveDisplay(confHandle, streamIndex, winIndex);
			var refCount = stream.refCount;
			--stream.refCount;
			if (stream.refCount == 0 && stream.rIndex == -1)  /* the only stream reference, remove stream if too much. */
			{
				setTimeout(function() {
					cusStreamWin.avr_reallyRemoveStream(streamIndex);
				}, 5000); /* Really remove stream when don't use in 5 seconds, prevent student bug. */
				loger.info('avr_removeStream:' + streamIndex);
			}		
		}
	},
	
	replaceStream :(thisWindow,vwl,divList,streamindexList,winindexList,volList,newUrls)=>{
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
			var vwInfo = cusStreamWin.avr_findWindow(vwl, windowId);
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
				new_stream_index = cusStreamWin.avr_FindOrAddStream(newUrls[i]);
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
	},
	
	
	
	//win opreation-------------------------------------------------
	avr_removeWindowByIndex:(vwl, index, exited)=> {
		var vwInfo = vwl[index];
		
		var wsCount = vwInfo.streamIndex.length;
		for (var j = 0; j < wsCount; ++j)
		{
			if (vwInfo.streamIndex[j] != -1)
			{
				cusStreamWin.avr_RemoveStreamAndWindow(vwInfo.streamIndex[j], vwInfo.winIndex[j]);
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
	},
	avr_removeWindow:(vwl, windowId, closeWindow)=> {
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
					cusStreamWin.avr_removeWindowByIndex(vwl, i, closeWindow);
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
	},
	avr_findWindow:(vwl, windowId) =>{
		for (var i = 0; i < vwl.length; ++i)
		{
			var vwInfo = vwl[i];
			if (vwInfo.windowId == windowId) /* window already exists, */
			{
				return vwInfo;
			}
		}
	
		return null;
	},
	avr_findRealBounds:(mainWindow, l, t, w, h) =>{
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
	},
	 avr_addWindow:(mainWindow, l, t, w, h, windowId)=> {
		var newVW = {};
		// var sdf = pipJson.ltrb.split(",");
		var bounds = cusStreamWin.avr_findRealBounds(mainWindow, l, t, w, h);
	
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
	},
	
	initPips(ltwhArrays){
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
	},
	hookWindow:(mainWindow,vwl,ltwhArrays,urls,snList,noVolList,clickWindowId)=>{
		if(!urls[0]) return;
	   	loger.info('hookWindow:ltwhArrays='+ltwhArrays+';urls='+urls+';snList='+snList+';noVolList='+noVolList + ";windowId"+clickWindowId);
		var pipJson = cusStreamWin.initPips(ltwhArrays);
		loger.info("hookWindow:pipJson="+JSON.stringify(pipJson));
	
		var streamIndexArray = new Array();
	
		if (clickWindowId == null)
		{
			clickWindowId = "0";
		}
	
		var ltrbInfo = pipJson.ltrbInfo;
		var vwNew = cusStreamWin.avr_findWindow(vwl, clickWindowId);
		if (vwNew != null)
		{
			loger.info("Hook window already exists!using-"+vwNew.using + "windowId"+clickWindowId);
			if (vwNew.using) {
				return;	
			}
			vwNew.windowId = clickWindowId;
			var bounds = mainWindow.getBounds();
	
			var newBounds = cusStreamWin.avr_findRealBounds(mainWindow, ltrbInfo[0], ltrbInfo[1], ltrbInfo[2], ltrbInfo[3]);
			vwNew.wnd.setBounds(newBounds);
			vwNew.wnd.show();
			vwNew.using = true;
			vwNew.refCount = 1;
		}
		else
		{
			loger.info("Create window, id=" + clickWindowId);
			vwNew = cusStreamWin.avr_addWindow(mainWindow, ltrbInfo[0], ltrbInfo[1], ltrbInfo[2], ltrbInfo[3], clickWindowId);
		}
		//avr_removeWindow(vwl, windowId);
	
		var vwIndex0 = vwl.length * 16;
		var winIndexList = Array();
	    vwl[vwl.length] = vwNew;
	
		let hwnd = vwNew.wnd.getNativeWindowHandle() //获取窗口句柄。
	
		var pips = pipJson.pips;
		for (var i = 0; i < pips.length; i++) {
			streamIndexArray[i+1] = cusStreamWin.avr_FindOrAddStream(urls[i+1]);
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
		
		streamIndexArray[0] = cusStreamWin.avr_FindOrAddStream(urls[0]);
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
	},
	moveWindow: (mainWindow,vwl,ltwhArrays,streamindexList,winindexList,noVolList)=>{
		var pipJson = cusStreamWin.initPips(ltwhArrays);
		//设置音量为0
		for (var i = 0; i < streamindexList.length; i++) {
			var vol = noVolList? noVolList[i] ? noVolList[i] : 0 : 0;
			var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,streamindexList[i],vol);
			loger.info('moveWindow:setStramVolResult=streamindex-'+streamindexList[i]+':vol-'+vol+':result-'+setStramVolResult);
		}
	
	   	loger.info('moveWindow:ltwhArrays='+ltwhArrays+';winindexList='+winindexList+';streamindexList='+streamindexList);
		var pipJson = cusStreamWin.initPips(ltwhArrays);
	
		var winArr = [];
		if (winindexList[0] != null) winArr = winindexList[0].split("|");
		if (winArr.length <= 1) return;
	
		var windowId = winArr[0], winSeq = parseInt(winArr[1]);
		loger.info("moveWindow:pipJson="+JSON.stringify(pipJson)+",windowId="+windowId);
		
	
		var vwInfo = cusStreamWin.avr_findWindow(vwl, windowId);
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
	
		var bounds = cusStreamWin.avr_findRealBounds(mainWindow, pipJson.ltrbInfo[0], pipJson.ltrbInfo[1], pipJson.ltrbInfo[2], pipJson.ltrbInfo[3]);
	
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
	},
	changeVolWindow:(thisWindow,streamindexList,volList)=>{
		loger.info('changeVolWindow:streamindexList='+streamindexList+':volList-'+volList);
		for (var i = 0; i < streamindexList.length; ++i) {
			loger.info('changeVolWindow:streamindexList='+streamindexList[i]+':volList-'+volList[i]);
			var setStramVolResult = confLib.YXV_ConfSetStreamVol(confHandle,streamindexList[i],volList[i]);
			loger.info('changeVolWindow-setStramVolResult=streamindex-'+streamindexList[i]+':vol:result-'+setStramVolResult);
		}
	}
	
	
	
	
	
	
	
	
	
}
module.exports=cusStreamWin;