/**
 * 窗口模块
 */
const loger = require('../loger.js')

const {BrowserWindow}=require('electron');


var win={
	/**
	 * 创建窗口
	 */
	createMsgWindow:(htmlPath,callback)=>{
	    var msg_y = global.externalDisplay.bounds.height
	    let msgWindow = new BrowserWindow({
	        modal: true,//是否遮盖主窗口
	        autoHideMenuBar:true,
	        transparent: true,
	        width:252,
	        height:104,
	        y:msg_y-150,
	        x:x-255,
	        frame:false,
	        show: false,
	        alwaysOnTop:true,
	        webPreferences: {
	          plugins: true,
	          preload: path.join(__dirname, 'res/js', 'preload.js')
	        }
	      })
	    //msgWindow.openDevTools();
	
	    // var viewPath = 'view_complex/html/message.html';
	    var viewPath = htmlPath;  //打开的页面的路径
	    msgWindow.loadURL(url.format({
	      pathname: path.join(__dirname, viewPath),
	      protocol: 'file:',
	      slashes: true
	    }))
	    msgWindow.on('closed', function () {
			if(undefined==callback){
				callback();
			}else{
				msgWindow = null
			}
	    })
	},
	
	/**创建一个错误窗口    
	 * @param {type}  errorMsg  :错误信息，  icoPath :窗口logo    htmlPath:错误页面
	 */
	createErrorWindow:(errorMsg,icoPath,htmlPath)=>{
		if(!errorMsg){
			errorMsg="System Error!";
		}
		if(undefined == icoPath||icoPath==""){
					  icoPath='./res/app.ico';
		}
	  let errorWindow = new BrowserWindow(
	    {
	      title:"ERROR",
	      // icon:path.join(__dirname,'./res/app.ico'),
		
	      icon:path.join(__dirname,icoPath),
	      width: 600, 
	      height: 400,
	      autoHideMenuBar:true,
	      resizable:false
	    })
		
		if(undefined==htmlPath||htmlPath==""){
			htmlPath='view_complex/html/error.html';
		}
	  errorWindow.loadURL(url.format({
	            // pathname: path.join(__dirname, 'view_complex/html/error.html'),
	            pathname: path.join(__dirname, htmlPath),
	            protocol: 'file:',
	            slashes: true
	          })+'?errorMsg='+errorMsg)
	
	  // errorWindow.openDevTools();
	  // Emitted when the window is closed.
	  errorWindow.on('closed', function () {
	    if(mainWindow != null){
	      mainWindow.close()
	    }
	    var allWins = BrowserWindow.getAllWindows();
	    loger.info("allWins:"+allWins);
	    for (var i = 0; i < allWins.length; i++) {
	      loger.info(allWins[i]);
	      if(allWins[i] != mainWindow){
	        allWins[i].close();
	      }
	    }
	    errorWindow = null
	  })
	},
	closeWindow:(winObj)=>{
		if(winObj){
			winObj.close();
		}
	}
	
}

module.exports=win