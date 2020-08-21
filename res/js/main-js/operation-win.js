const {ipcMain} =  require('electron')

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

var operationWin={
	/**
	 * 移动窗口位置 
	 * @param {
		mainBounds :原来窗口位置信息 
		vwl:移动的参数{
			l：x轴移动的距离
			t:y轴
			w:重新设置窗口的宽度
			h:重新设置窗口的高度
		}		
	 }  
	 */
	moveChildWindows:(mainBounds, vwl)=>{
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
	},
	initPips:(ltwhArrays)=>{
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
	
	hookWindow: (mainWindow,vwl,ltwhArrays,urls,snList,noVolList,clickWindowId)=>{
		
			if(!urls[0]) return;
		   	loger.info('hookWindow:ltwhArrays='+ltwhArrays+';urls='+urls+';snList='+snList+';noVolList='+noVolList + ";windowId"+clickWindowId);
			var pipJson = operationWin.initPips(ltwhArrays);
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
	}
}
module.exports=operationWin;
