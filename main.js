const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window
const BrowserWindow = electron.BrowserWindow
const BrowserView = electron.BrowserView

const path = require('path')
const url = require('url')
const http = require('http'); 
const https = require('https'); 
const os = require('os');  
const fs = require('fs')
const md5 = require('md5-node')

const ipcMain = electron.ipcMain
const renderer = require('./renderer.js')
const config = require('./conf.js')
const loger = require('./res/js/loger.js')
const version = require('./versionInfo.json')

const request = require('request');
const globalShortcut = require('electron').globalShortcut;
const confPath = os.homedir()+'/'+config.BASE_CONF_PATH+'/conf.json';

const _confPath = os.homedir()+"/"+config.BASE_CONF_PATH;
const {Notification}=electron;
const Menu = electron.Menu;
const Tray = electron.Tray;
const StreamDownload = require('./StreamDownload.js')
let isError = false;
let errorMsg = "";
let isFullScreen = false;
let isMessage = false;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow,errorWindow,settingWindow,toolsWindow,toolsChildWindow,msgWindow,childWindow,initWindow,initSetWindow,canvasWindow,fayanrenWindow,progressWindow,innerCsWindow;

let g_videoWindowList = Array();
let x,y=100;
//mcu 或者 rmanager 服务状态是否可用
let serverStatus=true;
var confData;
const ping = require('node-http-ping');

process.on('uncaughtException', function (err) { 
//打印出错误 
loger.info('------------------err:------------------'+err.stack);
//打印出错误的调用栈方便调试 
 loger.info('=========err.stack:=========='+err.stack);
 loger.info('=========系统异常=========='); 
 app.quit();
 //createErrorWindow();
});
//客户端单实例运行
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // 当另一个实例运行的时候，这里将会被调用，我们需要激活应用的窗口
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  return true;
});

// 这个实例是多余的实例，需要退出
if (shouldQuit) {
  app.quit();
  return;
}

function createWindow (processParam) {

  loger.info("createWindow:"+processParam);

  httpRetryCallback("http://"+global.host+":"+global.port+config.LESSON_INFO+"?lessonId="+getParam("lessonId",processParam)+"&tk="+getParam("token",processParam),(data)=>{
      global.roomId = data.data.course.courseId+getParam("lessonId",processParam);
      processParam += "&roomId="+roomId;
      global.lessonName = data.data.lessonName;
      var viewPath = "";
      global.lessonModel = data.data;
      global.coursesUserList = data.data.course.coursesUser;
      global.role = data.data.role;
      if(getParam("id",processParam) == data.data.course.teacherId || getParam("id",processParam) == data.data.course.rmanagerUserId){
          global.isSpeaker = true;
          global.lessonId = getParam("lessonId",processParam);
          global.teacherId = getParam("id",processParam);
          global.token = getParam("token",processParam);
          global.processParam = processParam;
          global.classroomSize = false;
          
          if(data.data.lessonType == 0){//多屏
             
              if(data.data.course.coursesUser.length > 5)
              {
                global.classroomSize = true;
              }
              
              mainWindow = new BrowserWindow(
              {
                title:data.data.lessonName,
                icon:path.join(__dirname,'./res/app.ico'),
                width: 1600, 
                height: 900,
                transparent: true,
                autoHideMenuBar:true,
                frame:false,
                useContentSize:false,
                alwaysOnTop:false,
                skipTaskbar:true,
                show:false,
                webPreferences: {
                  plugins: true,
                  preload: path.join(__dirname, 'res/js', 'preload.js')
                }
              })

              viewPath = 'res/html/choose.html';
              // viewPath='view_complex/html/assist.html';
              global.isComplex = true;
              mainWindow.center();
               // mainWindow.openDevTools();
          }else{

              viewPath = 'view/html/teacher.html';
          }
      }else{
          if(data.data.lessonType == 0){//多屏
            var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
            var _path = "view_complex";

              viewPath = _path+'/html/student.html';
              global.isComplex = true;
               mainWindow = new BrowserWindow(
                {
                  title:data.data.lessonName,
                  icon:path.join(__dirname,'./res/app.ico'),
                  width: 1700, 
                  height: 900,
                  autoHideMenuBar:true,
                  frame:false,
                  minimizable:false,
                  maximizable:false,
                  show:true,
                  skipTaskbar:true,
                  webPreferences: {
                    plugins: true,
                    preload: path.join(__dirname, 'res/js', 'preload.js')
                  }
                })
          }else{
              viewPath = 'view/html/student.html';
          }
      }

      if(!mainWindow){
         mainWindow = new BrowserWindow(
          {
            title:data.data.lessonName,
            icon:path.join(__dirname,'./res/app.ico'),
            width: 1200, 
            height: 720,
            autoHideMenuBar:true,
            skipTaskbar:true,
            show:false,
            webPreferences: {
              plugins: true,
              preload: path.join(__dirname, 'res/js', 'preload.js')
            }
          })
      }

      //设置窗口不可以随便改变大小，但是可以全屏、最小化
      mainWindow.setResizable(false);

      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, viewPath),
        protocol: 'file:',
        slashes: true
      })+"?"+processParam)
      //mainWindow.openDevTools();
      mainWindow.on('ready-to-show', function () {
        mainWindow.show();
      });

      mainWindow.on('move', function() {
         loger.info('mainWindow:move:');
         renderer.moveChildWindows(mainWindow.getBounds(), g_videoWindowList);
      })
      mainWindow.on('resize',function(){
            console.log("-----------------resize---------------------");
            var webContents = mainWindow.webContents;
            webContents.send('resize', 'pong');
        })

      //mainWindow.openDevTools();
       global.mainBounds = mainWindow.getBounds();
      // Emitted when the window is closed.
      mainWindow.on('close',function(event){
        //关闭客户端要停止录制视频，停止上传视频文件
        
        if(!global.is_stop){
           event.preventDefault();
           mainWindow.send('stopLive');
           return;
        }
        
        if(global.isSpeaker){
          if(global.is_upload){
            event.preventDefault();
            var _result = {'is_upload':true,'isRec':false}
            mainWindow.send('closeWin',_result);
          }else if(global.isRec){
            event.preventDefault();
            var _result = {'is_upload':false,'isRec':true}
            mainWindow.send('closeWin',_result);
          }
        }
        renderer.removeAllWindow(mainWindow,g_videoWindowList);
        var allWins = BrowserWindow.getAllWindows();
        loger.info("allWins:"+allWins);
        for (var i = 0; i < allWins.length; i++) {
          loger.info(allWins[i]);
          if(allWins[i] != mainWindow){
            allWins[i].close();
          }
        }
        mainWindow.send('closePrintscreen');
        //app.quit();
      })
      mainWindow.on('closed', function () {
        mainWindow = null;
       
      })

      mainWindow.once('ready-to-show', () => {
        mainWindow.show()
      })

      initTrayIcon();

      if(isError){
        createErrorWindow();
      }
      //createMsgWindow();
      global.filePath = renderer.initFilePath(mainWindow);
  });
}

function init(){
	
//设置当前登录状态为false
 global.isSuccessLogin=false;					
  loger.info("init");  
  var processParam = "";
  var _lessonId,_token;
    //processParam="id=16&lessonId=110&token=ymtlw9coj2zfbuiaaznuyonqr2lfav";
  for(var i = 0;i<process.argv.length;i++){
      if(process.argv[i].indexOf("lbinteractionclient://") >= 0){
          processParam += process.argv[i].substring(("lbinteractionclient://").length,process.argv[i].length-1);
      }
  }

   confData = JSON.parse(fs.readFileSync(confPath).toString());
  loger.info("init-processParam:"+processParam);  
  loger.info("init-confData:"+confData);
  global.host = confData.host;
  global.port = confData.port;
  global.nginx = confData.nginx;
  global.mcu = confData.mcu;
  global.rmanager  = confData.rmanager;
  global.rtmp = confData.nginx.substr(0,confData.nginx.indexOf(':'))+'/mp4';
  global.hdType = confData.hdType;
  var mcuIpAddress=confData.mcu;
  var rmanagerIpAddress=confData.rmanager;
	getServerStatus(mcuIpAddress,rmanagerIpAddress);
  if(confData.hdType == 'inner'){
      initInnerHd(confData);
  }else{
    if(processParam == "" ){
      var userName = confData.userName;
      var passWord = confData.passWord;
      var dynamic = confData.dynamic;
	  
	 
	  
	  loger.info(mcuIpAddress);
	  loger.info(rmanagerIpAddress);
	  loger.info("__________________________");
	  //异步调用
	  createUserLoginWindow();
	  
	}else{
	loger.info('---------------002---------------');
	  createWindow(processParam);	
	}
		
	
		
    }/* else{
     
    } */
  
}


function userLogin(){
	
    var userName = confData.userName;
      var passWord = confData.passWord;
      var dynamic = confData.dynamic;
	  loger.info("________________________________________________________")
	  loger.info(userName+"_________"+passWord);
	if(userName&&passWord){
		httpRetryCallback("http://"+confData.host+":"+confData.port+config.USER_LOGIN+"?username="+userName+"&password="+passWord+"&dynamic="+dynamic,(data)=>{
			loger.info(userName+"_________"+passWord);
			loger.info("login status++++++++++++++____________________________");
			loger.info(data.rc);
			   if(data.rc == 0){
			      var token = data.token;
			      var userId = data.userId;
			      loger.info("http://"+confData.host+":"+confData.port+config.FIND_LESSON+"?token="+token)
			       http.get("http://"+confData.host+":"+confData.port+config.FIND_LESSON+"?token="+token,function(req,res){  
			            var json='';  
			            req.on('data',function(child_data){  
			                json+=child_data;  
			            });  
			            req.on('end',function(){  
			              loger.info("init-findLesson:"+json);
			              var child_data = JSON.parse(json);
			                if(child_data.rc == 0){
			                  if(child_data.hasOwnProperty('lesson')){
			                    var lessonId = child_data.lesson.lessonId;
			                    processParam = 'id='+userId+'&lessonId='+lessonId+'&token='+token;
			                    createWindow(processParam);
			                    if(initWindow!=null){
			                      initWindow.close();
			                    }
								global.isSuccessLogin=true;
			                  }else{
			                    errorMsg = "no_course";
			                    createErrorWindow()
			                  }
			                }
			            }); 
			       });
			    }
			  })
		
	}
	/* if(!global.isSuccessLogin){
		createUserLoginWindow();
	} */
}

function createUserLoginWindow(){
	initWindow = new BrowserWindow({
	  width: 500,
	  height: 325,
	  autoHideMenuBar:true,
	  resizable:false,
	  titleBarStyle:'customButtonsOnHover',
	  icon:'./res/img/app.ico',
	  webPreferences: {
	    plugins: true,
	    preload: path.join(__dirname, 'res/js', 'preload.js'),
	  }
	})
	
	
	var viewPath = "view_complex/html/login.html";
	initWindow.loadURL(url.format({
	  pathname: path.join(__dirname, viewPath),
	  protocol: 'file:',
	  slashes: true
	}))
	
	initWindow.on('closed', function () {
	  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
	  if(conf.userName==""){
	    initWindow = null;
	    var allWins = BrowserWindow.getAllWindows();
	    loger.info("allWins:"+allWins);
	    for (var i = 0; i < allWins.length; i++) {
	      loger.info(allWins[i]);
	      if(allWins[i] != mainWindow){
	        allWins[i].close();
	      }
	    }
	  }else{
	    initWindow = null;
	  }
	}) 
/* 	//不论 网络是否正常都打开login窗口
		var webContents = initWindow.webContents;
		webContents.send('serverStatus',serverStatus); */
	
}

function getServerStatus(mcuIpAddress,rmanagerIpAddress){
	setInterval(function(){
		pingInternet(mcuIpAddress,function(res){
			global.mcuServerStatus = res;
		});
		pingInternet(rmanagerIpAddress,function(res){
			global.rmanagerServerStatus = res;
		});
		/* loger.info("_____"+global.isSuccessLogin);
		loger.info("___________________________________________________ panduan");
		loger.info(global.isSuccessLogin&&(!global.mcuServerStatus||!global.rmanagerServerStatus));
		loger.info(global.mcuServerStatus);
		loger.info(global.rmanagerServerStatus);
		loger.info(global.isSuccessLogin);
		loger.info("___________________________________________________ panduan end"); */
		
		if(global.isSuccessLogin&&(!global.mcuServerStatus||!global.rmanagerServerStatus)){
			// 实例化不会进行通知
			let notification = new Notification({
			  // 通知的标题, 将在通知窗口的顶部显示
			  title: 'Boss',
			  // 通知的副标题, 显示在标题下面 macOS
			  subtitle: '重要消息',
			  // 通知的正文文本, 将显示在标题或副标题下面
			  body: '@所有人 放假！！！',
			  // false有声音，true没声音
			  silent: false,
			  // 通知的超时持续时间 'default' or 'never'
			  timeoutType: 'default',
			})
		}
		
	},2000);
}

/**
 * @param {Object} ipAddress 判断该地址状态是否是可连接的
 */
function pingInternet(ipAddress,callback){
	var index=ipAddress.lastIndexOf(":");
	var host=ipAddress.substring(0,index);
	var port=ipAddress.substring(index+1);
	// loger.info("host:"+host+"_____post:"+port);
	// Using http by default
	ping(host,port).then(()=>{
			callback(true);
		})
	  .catch(() =>  {
		 callback(false);
	})
}

function createErrorWindow(){
  errorWindow = new BrowserWindow(
    {
      title:"ERROR",
      icon:path.join(__dirname,'./res/app.ico'),
      width: 600, 
      height: 400,
      autoHideMenuBar:true,
      resizable:false
    })
  errorWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'view_complex/html/error.html'),
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
}

function createSettingWindow(){
  var viewPath = "";
  if(global.isComplex){
      settingWindow = new BrowserWindow(
      {
        title:"设置",
        icon:path.join(__dirname,'./res/app.ico'),
        width: 700, 
        height: 500, 
        transparent:true,
        frame:false,
        autoHideMenuBar:true,
        resizable:false,
        parent:mainWindow,
        modal:true,
        webPreferences: {
          plugins: true,
          preload: path.join(__dirname, 'res/js', 'preload.js')
        }
      })

      var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
       var  _path = "view_complex";
    /*  switch(conf.plan){
        case "b":
          //黑板方案
          _path = "view_black";
          break;
        default :
          //默认通用方案
     
          break;
      }*/
      viewPath = _path+'/html/setting.html';
  }else{
      settingWindow = new BrowserWindow(
      {
        title:"设置",
        icon:path.join(__dirname,'./res/app.ico'),
        width: 800, 
        height: 400,
        autoHideMenuBar:true,
        resizable:false,
        parent:mainWindow,
        webPreferences: {
          plugins: true,
          preload: path.join(__dirname, 'res/js', 'preload.js')
        }
      })
      viewPath = 'view/html/setting.html';
  }
  settingWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    }))

  // settingWindow.openDevTools();
  // Emitted when the window is closed.
  settingWindow.on('closed', function () {
    settingWindow = null;
    renderer.closeAudio(settingWindow,null);
    var webContents = mainWindow.webContents;
    webContents.send('settingClose');
  })
}


function createCanvasWindow(){
  var viewPath = "";
  canvasWindow
  canvasWindow = new BrowserWindow(
  {
    title:"推题设置",
    icon:path.join(__dirname,'./res/app.ico'),
    width: 800, 
    height: 180,
    transparent:true,
    frame:false,
    autoHideMenuBar:true,
    resizable:false,
    parent:mainWindow,
    modal:true,
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, 'res/js', 'preload.js')
    }
  })
  viewPath = 'view_black/html/canvas.html';
  
  canvasWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    }))
  canvasWindow.on('closed', function () {
    canvasWindow = null;
  })
}
function createFayanrenVideo(name,videoPath){
  fayanrenWindow = new BrowserWindow({
        title:name,
        icon:path.join(__dirname,'./res/app.ico'),
        width: x, 
        height: y,
        transparent:true,
        frame:false,
        autoHideMenuBar:true,
        resizable:false,
        // maximizable:true,
        fullscreen:true,
        show:false,
        /*parent:mainWindow,*/
        alwaysOnTop:true,
        modal:true,
        webPreferences: {
          plugins: true,
          preload: path.join(__dirname, 'res/js', 'preload.js')
        }
      });
  viewPath = 'view_black/html/fayanrenVideo.html';
  fayanrenWindow.on('ready-to-show', function () {
    fayanrenWindow.show();
  });
  fayanrenWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    })+"?url="+videoPath+"&name="+name);
  fayanrenWindow.on('closed', function () {
    fayanrenWindow = null; 
  })
}
function createToolsWindow(){
      createToolsChildWindow();
      globalShortcut.unregister('esc');
    global.tools_x = x - 200;
    global.tools_y = (y-650)/2;
    toolsWindow = new BrowserWindow({
        title:'toolsWindow',
        parent:toolsChildWindow,
        autoHideMenuBar:true,
        transparent: true,
        width:120,
        height:850,
        resizable:false,
        y:global.tools_y,
        x:global.tools_x,
        frame:false,
       /* show:false,*/
        skipTaskbar:true,
        alwaysOnTop:true,
        webPreferences: {
          plugins: true,
          preload: path.join(__dirname, 'res/js', 'preload.js')
        }
      })

/*  toolsWindow.once('ready-to-show', () => {
      toolsWindow.show()
    })*/
    // var viewPath = 'view_complex/html/index.html';
    var viewPath = 'view_complex/html/tools.html';
    toolsWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    }))
     //toolsWindow.openDevTools();
    toolsWindow.on('closed', function () {
      if(mainWindow != null){
        mainWindow.close()
      }
      if(toolsChildWindow != null){
        toolsChildWindow.close();
      }
      toolsWindow = null
    })
    global.moveEnable = true;

    getTaskBarInfo(toolsChildWindow);


}

function createToolsChildWindow(){
  globalShortcut.unregister('esc');
    toolsChildWindow = new BrowserWindow({
        title:'toolsChildWindow',
        autoHideMenuBar:true,
        transparent: true,
        width:x*0.6,
        height:y*0.6,
        resizable:false,
        y:0,
        x:0,
        minWidth :9,
         kiosk:true,
        frame:false,
        alwaysOnTop:true,
        skipTaskbar:true,
        /*show:false,*/
        webPreferences: {
          plugins: true,
          preload: path.join(__dirname, 'res/js', 'preload.js')
        }
      })

/*    toolsChildWindow.once('ready-to-show', () => {
      toolsChildWindow.show()
    })*/
    var viewPath = 'view_complex/html/tools_child.html';
    var taskBarInfoResult = renderer.YXV_ConfGetTaskBarInfo();
    toolsChildWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    }))
     //toolsChildWindow.openDevTools();
    toolsChildWindow.on('closed', function () {
      toolsChildWindow = null
    })
}

function createMsgWindow(){
    var msg_y = global.externalDisplay.bounds.height
    msgWindow = new BrowserWindow({
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

    var viewPath = 'view_complex/html/message.html';
    msgWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    }))
    msgWindow.on('closed', function () {
      msgWindow = null
    })
}

function createChildWindow(){
    childWindow = new BrowserWindow({
        parent:mainWindow, 
        autoHideMenuBar:true,
        transparent: true,
        width:252,
        height:104,
        y:msg_y-150,
        x:x-255,
        frame:false,
        show: false,
        alwaysOnTop:false,
        webPreferences: {
          plugins: true,
          preload: path.join(__dirname, 'res/js', 'preload.js')
        }
      })
    // childWindow.openDevTools();

    var viewPath = 'view_complex/html/time.html';
    childWindow.loadURL(url.format({
      pathname: path.join(__dirname, viewPath),
      protocol: 'file:',
      slashes: true
    }))
    childWindow.on('closed', function () {
      childWindow = null
    })
}
function createAbout(_path,_width,_height,_title,version,_param){
    settingWindow = new BrowserWindow({
    title:_title,
    modal: true, 
    width: _width,
    height: _height,
    autoHideMenuBar:true,
    minimizable :false,
    maximizable :false,
    show:false,
    icon:'./res/app.ico',
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, 'res/js', 'preload.js'),
    }
  });
    settingWindow.once('ready-to-show', () => {
      settingWindow.show()
    })
  var viewPath = 'res/html/'+_path+'.html';

  settingWindow.loadURL(url.format({
    pathname: path.join(__dirname, viewPath),
    protocol: 'file:',
    slashes: true
  })+'?version='+version)

  // initSetWindow.openDevTools();
  // Emitted when the window is closed.
  settingWindow.on('closed', function () {
    initSetWindow = null
  })
}
function createInitSetWindow(_path,_width,_height,_title,_param){
   initSetWindow = new BrowserWindow(
    {
      parent:mainWindow,
      title:_title,
      icon:path.join(__dirname,'./res/app.ico'),
      frame:false,
      width: _width, 
      height: _height,
      autoHideMenuBar:true,
      transparent:true,
       parent:mainWindow,
        modal:true,
      resizable:false,
      webPreferences: {
        plugins: true,
        preload: path.join(__dirname, 'res/js', 'preload.js')
      }
    })



  initSetWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'view_complex/html/'+_path+'.html'),
            protocol: 'file:',
            slashes: true
          })+'?'+_param)

  // initSetWindow.openDevTools();
  // Emitted when the window is closed.
  initSetWindow.on('closed', function () {
    initSetWindow = null
  })
}

function getParam(name,paramStr) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r =paramStr.match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}


//跟据uType 配置判断当前是主讲教室还是听课教室

function initInnerHd(_cjson){
  var viewPath = '';
 // console.log(_cjson);
  if(_cjson.in_uType == 'teacher'){//辅助屏
   /* viewPath = 'view_complex/html/assist.html';*/viewPath = 'res/html/choose.html';
  }else if(_cjson.in_uType == 'student') {//学生
    viewPath = 'view_complex/html/student.html';
  }
  global.bitstream = _cjson.bitstream;
  global.roomId = _cjson.in_roomId;
  var param = "roomId="+roomId;
  global.courseName = _cjson.in_courseName;
  global.in_clientName = _cjson.in_clientName;
  global.mcu = _cjson.in_mcu;
  global.in_clientId = _cjson.in_clientId;
  global.rmanager  = _cjson.in_rmanager;
  global.recName = _cjson.recName;
  global.recPwd = _cjson.recPwd;
  global.deviceId = _cjson.deviceId;
  var lessonModel ={
    "role":_cjson.in_uType
  }
  global.lessonModel=lessonModel;
  mainWindow = new BrowserWindow(
  {
    title:global.courseName,
    icon:path.join(__dirname,'./res/app.ico'),
    width: 1700, 
    height: 900,
    autoHideMenuBar:true,
    frame:false,
    minimizable:false,
    maximizable:false,
    show:true,
    skipTaskbar:true,
    transparent: true,
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, 'res/js', 'preload.js')
    }
  })

  //设置窗口不可以随便改变大小，但是可以全屏、最小化
  mainWindow.setResizable(false);

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, viewPath),
    protocol: 'file:',
    slashes: true
  })+"?"+param)
  // mainWindow.openDevTools();
  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
  });
  global.isComplex = true;
  mainWindow.center();
  mainWindow.on('move', function() {
     loger.info('mainWindow:move:');
     // loger.info(g_videoWindowList);
     renderer.moveChildWindows(mainWindow.getBounds(), g_videoWindowList);
  })
 /* mainWindow.on("restore", function(event){
    if(event){
      
    }
  });*/
  mainWindow.on('resize',function(){
        console.log("-----------------resize---------------------");
        var webContents = mainWindow.webContents;
        webContents.send('resize', 'pong');
    })

  //mainWindow.openDevTools();
   global.mainBounds = mainWindow.getBounds();
  // Emitted when the window is closed.
  mainWindow.on('close',function(event){
    //关闭客户端要停止录制视频，停止上传视频文件
    if(!global.is_stop){
       event.preventDefault();
       mainWindow.send('stopLive');
       return;
    }

    if(global.isSpeaker){
      if(global.is_upload){
        event.preventDefault();
        var _result = {'is_upload':true,'isRec':false}
        mainWindow.send('closeWin',_result);
      }else if(global.isRec){
        event.preventDefault();
        var _result = {'is_upload':false,'isRec':true}
        mainWindow.send('closeWin',_result);
      }
    }

    renderer.removeAllWindow(mainWindow,g_videoWindowList);
    var allWins = BrowserWindow.getAllWindows();
    loger.info("allWins:"+allWins);
    for (var i = 0; i < allWins.length; i++) {
      loger.info(allWins[i]);
      if(allWins[i] != mainWindow){
        allWins[i].close();
      }
    }
  })
  mainWindow.on('closed', function () {
    mainWindow = null;
   
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  initTrayIcon();

  if(isError){
    createErrorWindow();
  }
  //createMsgWindow();
  global.filePath = renderer.initFilePath(mainWindow);
}


function initTrayIcon() {
         
    const tray = new Tray(path.join(__dirname,'./res/app.ico'));
    var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
     var p = false;
     if(conf.plan=="a"){
        p = true;
     }
    const trayContextMenu = Menu.buildFromTemplate([
        {
            label: '打开',
            click: () => {
                if(toolsWindow){
                  toolsWindow.show();
                }else{
                  mainWindow.show();
                }
            }
        }, {
            id:2,
            label: '开机自启',
            type:'checkbox',
            checked:conf.autoOpen,
            click: (menuItem, browserWindow, event) => {
              var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
              var data = JSON.parse(fs.readFileSync(confPath).toString());
              var params = ['autoOpen'];
              var datas;
              if(conf.autoOpen){
                  var regStr = '\\HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
                  var key = 'interation';
                  var val = '';
                  renderer.YXV_ConfWriteRegistry(regStr,key,val);
                  menuItem.checked = false;
                  datas=[false];
                }else{
                  var regStr = '\\HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
                  var key = 'interation';
                  var val = app.getPath('exe');
                  renderer.YXV_ConfWriteRegistry(regStr,key,val);
                  menuItem.checked = true;
                  datas=[true];
                }
                  for (var i = 0; i < params.length; i++) {
                  data[params[i]] = datas[i]
                  }
                  fs.writeFileSync(confPath, JSON.stringify(data, null, "   "));
            }
        }, {
            id:5,
            label: '白板模式',
            type:'checkbox',
            checked:p,
            click: (menuItem, browserWindow, event) => {
              var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
              var data = JSON.parse(fs.readFileSync(confPath).toString());
              var params = ['plan'];
              var datas;
              if(conf.plan=="a"){
                  datas=["b"];
                  for (var i = 0; i < params.length; i++) {
                  data[params[i]] = datas[i]
                  }
                  fs.writeFileSync(confPath, JSON.stringify(data, null, "  "));
                  menuItem.checked = false;
                }else{
                   datas=["a"];
                  for (var i = 0; i < params.length; i++) {
                  data[params[i]] = datas[i]
                  }
                  fs.writeFileSync(confPath, JSON.stringify(data, null, "  "));
                   menuItem.checked = true;
                }

                 
            }
        },{
            label: '版本信息',
            click: () => {
               createAbout("about",400,280,"版本信息",version.version);
            }
        }, {
            label: '检查更新',
            click: () => {
               versionUpdate(1);
            }
        },{
            label: '注销',
            click: () => {
               cancellation();
            }
        },/*{
            label: '参数设置',
            click: () => {
                innerCsWindow = new BrowserWindow({
                  width: 500,
                  height: 520,
                  autoHideMenuBar:true,
                  resizable:false,
                  titleBarStyle:'customButtonsOnHover',
                  icon:'./res/img/app.ico',
                  webPreferences: {
                    plugins: true,
                    preload: path.join(__dirname, 'res/js', 'preload.js'),
                  }
                })
                
                var viewPath = "view_complex/html/innerCs.html";
                innerCsWindow.loadURL(url.format({
                  pathname: path.join(__dirname, viewPath),
                  protocol: 'file:',
                  slashes: true
                }))

                innerCsWindow.on('closed', function () {
                 
                    innerCsWindow = null;
                  
                })  
            }
        },*/ {
            label: '退出',
            click: () => {
                mainWindow.close();
                if(msgWindow) msgWindow.close();
            }
        }
    ]);
    tray.setToolTip('互动客户端');

    tray.on('click', () => {
        if(toolsWindow){
          toolsWindow.show();
        }else{
          mainWindow.show();
        }
    });
    tray.on('right-click', () => {
        tray.popUpContextMenu(trayContextMenu);
    });
   if(conf.hdType!="inner"){
	   	setTimeout(function(){
	      versionUpdate();
	    },3000);
   } 
     
} 

app.disableHardwareAcceleration();
app.on('ready', function(event){
  let displays = electron.screen.getAllDisplays();
  loger.info('-----electron.screen-----')
  loger.info(electron.screen);
  global.externalDisplay = displays.find((display) => {
    return display.bounds.width !== 0 || display.bounds.height !== 0
  })
  if (global.externalDisplay) {
     x = global.externalDisplay.bounds.width
     y = global.externalDisplay.bounds.height
  }

  renderer.createConf(function(){
    init();
  });
  globalShortcut.register('esc', function() {
    if(mainWindow){
       var webContents = mainWindow.webContents;
      webContents.send("escWindow");
      //mainWindow.setFullScreen(false);
    }
  })

  globalShortcut.register('ctrl+shift+t', function() {
    mainWindow.openDevTools();
  })
  //创建消息窗口
  createMsgWindow();

  loger.info('externalDisplay.scaleFactor:'+global.externalDisplay.scaleFactor)
  electron.screen.on('display-metrics-changed',function(event,display,changedMetrics){
      loger.info('-----display-metrics-changed-----')
      var allWins = BrowserWindow.getAllWindows();
      setTimeout(function(){
        for (var i = 0; i < allWins.length; i++) {
          allWins[i].webContents.send("display-metrics-changed");
        }
      },800)
  })
})


function getTaskBarInfo(win){
  setInterval(function(){
    var taskBarInfoResult = renderer.YXV_ConfGetTaskBarInfo();
    var width = taskBarInfoResult.width;
    var height = taskBarInfoResult.height;
    var position = taskBarInfoResult.position;
    win.webContents.send("taskBarInfo",width,height,position);
  },500)
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {

  if (mainWindow === null) {
    createWindow()
  }
})

//监听登录时 验证mcu
/* ipcMain.on('pingInternet',function(event,mcu,rmanager){
	if(mcu&&rmanager){
		var mcuStuatus=pingInternet(mcu);
		var rmanagerStuatus=	pingInternet(rmanager);
		if(mcuStuatus&&rmanagerStuatus){
			
		}
	}
	renderer.pingInternet(false);
	
	
  // renderer.hookWindow(initSetWindow,g_videoWindowList,ltwhArrays,urls,snList,noVolList,windowId);
}); */

ipcMain.on('hookWindow',function(event,ltwhArrays,urls,snList,noVolList,windowId){
  renderer.hookWindow(mainWindow,g_videoWindowList,ltwhArrays,urls,snList,noVolList,windowId);
});

ipcMain.on('moveWindow',function(event,ltwhArrays,streamindexList,winindexList,noVolList){
// /*  var ltwhArrays = new Array();
//  ltwhArrays.push(left,top,width,height);*/
   renderer.moveWindow(mainWindow,g_videoWindowList,ltwhArrays,streamindexList,winindexList,noVolList);
});

ipcMain.on('changeVolWindow',function(event,streamindexList,noVolList){
  renderer.changeVolWindow(mainWindow,streamindexList,noVolList);
});

ipcMain.on('manege_hookWindow',function(event,ltwhArrays,urls,snList,noVolList,windowId){
  renderer.hookWindow(initSetWindow,g_videoWindowList,ltwhArrays,urls,snList,noVolList,windowId);
});

ipcMain.on('manege_moveWindow',function(event,ltwhArrays,streamindexList,winindexList,noVolList){
/*  var ltwhArrays = new Array();
  ltwhArrays.push(left,top,width,height);*/
   renderer.moveWindow(initSetWindow,g_videoWindowList,ltwhArrays,streamindexList,winindexList,noVolList);
});

ipcMain.on('removeWindow',function(event,sn,streamindex,winindex){
  renderer.removeWindow(mainWindow,g_videoWindowList,sn,streamindex,winindex);
});
ipcMain.on('manege_removeWindows',function(event,sns,streamindexs,mainWinindexs){
  for (var i = 0; i < streamindexs.length; i++) {
    renderer.removeWindow(initSetWindow,g_videoWindowList,sns[i],streamindexs[i],mainWinindexs[i],true);
  }
});
ipcMain.on('removeAllWindow',function(event){
  renderer.removeAllWindow(mainWindow,g_videoWindowList);
});

ipcMain.on('replaceStream',function(event,divList,streamindexList,winindexList,noVolList,newUrls){
  renderer.replaceStream(mainWindow,g_videoWindowList,divList,streamindexList,winindexList,noVolList,newUrls);
});

ipcMain.on('fullScreen',function(event){
  isFullScreen = mainWindow.isFullScreen();
  mainWindow.setFullScreen(!isFullScreen);
  var webContents = mainWindow.webContents;
  webContents.send('fullScreen',!isFullScreen);
  if(!isFullScreen){
    var ret = globalShortcut.register('esc', function() {
      console.log('esc is pressed');
      var streamindex = renderer.mainStreamindex();
      var winIndex = renderer.mainWinindex();
      webContents.send('fullScreen',false,streamindex,winIndex);
      isFullScreen = false;
      mainWindow.setFullScreen(isFullScreen);
      globalShortcut.unregister('esc');
     
    })
  }

})

ipcMain.on('getVideoStr',function(event,left,top,width,height,room_id){
  renderer.getVideoStr(mainWindow,left,top,width,height,room_id);
})

ipcMain.on('canvas',function(event){
  createCanvasWindow();
})

ipcMain.on('setting',function(event){
  createSettingWindow();
})
ipcMain.on('getSetting',function(event){
  renderer.getSetting(settingWindow);
})

ipcMain.on('setAce',function(event,s_index,flag,millisecond){
  renderer.setAce(settingWindow,s_index,flag,millisecond);
})

ipcMain.on('openAudio',function(event){
  renderer.openAudio(settingWindow);
})

ipcMain.on('closeAudio',function(event,streamindex){
  renderer.closeAudio(settingWindow,streamindex);
})

ipcMain.on('process',function(event){
  var webContents = mainWindow.webContents;
  webContents.send('process', process);
})

ipcMain.on('setCurrentVideo',function(event,_videoStr){
  renderer.setCurrentVideo(_videoStr);
})

ipcMain.on('setCurrentAideo',function(event,_aideoStr){
  renderer.setCurrentAideo(_aideoStr);
})

ipcMain.on('startRec',function(event,width,height,mianStrIndex){

  loger.info("========streamindex========="+mianStrIndex);
  renderer.startRec(mainWindow,width,height,mianStrIndex);
})

ipcMain.on('stopRec',function(){
  renderer.stopRec(mainWindow);
})
ipcMain.on('errorWin',function(){
  console.log("r================error================");
  global.is_stop = true;
  mainWindow.close();
  //app.quit();
})
ipcMain.on('uploadFile',function(event,_filePath){
  renderer.uploadFile(mainWindow,_filePath);
})

ipcMain.on('getFlagAndMil',function(){
  renderer.getFlagAndMil(settingWindow);
})

ipcMain.on('changeFilePath',function(event,_filePath){
  if(settingWindow){
      renderer.changeFilePath(settingWindow,_filePath);
   }else{
      renderer.changeFilePath(mainWindow,_filePath);
   }
})

ipcMain.on('getFilePath',function(event){
  renderer.getFilePath(settingWindow);
})

ipcMain.on('closeWinAndStopUpload',function(event){
  global.is_upload = false;
  mainWindow.close();
})

ipcMain.on('closeWinAndStopRec',function(event){
  renderer.stopRec(mainWindow);
  mainWindow.close();
})

ipcMain.on('initFilePath',function(event){
  renderer.initFilePath(mainWindow);
})

ipcMain.on('fileListAdd',function(event,_filePath){
  renderer.fileListAdd(mainWindow,_filePath);
})

ipcMain.on('fileListFinish',function(event,fileNo){
  renderer.fileListFinish(settingWindow,fileNo);
})

ipcMain.on('fileListRemove',function(event,fileNo){
  renderer.fileListRemove(settingWindow,fileNo);
})

ipcMain.on('stopLive',function(event){
  global.is_stop = true;
  mainWindow.close();
})

ipcMain.on('complex_index',function(event){
    mainWindow.hide();
    createToolsWindow();
})

ipcMain.on('openMsg',(event,msg,time)=>openMsgWithMsgAndTime(event,msg,time))
//打开窗口通知  param：{msg:窗口中的信息，  time：显示时间 ，过后自动关闭}
function openMsgWithMsgAndTime(event,msg,time){
	if(!isMessage){
	    msgWindow.webContents.send('onMsg',msg);
	    msgWindow.show();
	    isMessage = true;
	    time = time == null ? 5000:time;
	    setTimeout(function(){
	      msgWindow.webContents.send('onMsg','');
	      isMessage = false;
	    },time);
	}else{
	   msgWindow.webContents.send('onMsg',msg);
	}
}

ipcMain.on('closeMsg',function(event){
  msgWindow.hide();
  isMessage = false;
})


ipcMain.on('switchPip',function(event,main_stream_index,fyr_stream_index,isPip){
  if(isPip){
    renderer.switchPip(main_stream_index,fyr_stream_index);
  }else{
    renderer.switchMain(main_stream_index);
  }
})

ipcMain.on('saveConf', (event,param) => {
  loger.info("saveConf:"+param);
    var data = JSON.parse(fs.readFileSync(confPath).toString());
      data.host = param.host;
      data.port = param.port;
      data.nginx = param.nginx;
      data.mcu = param.mcu;
      data.userName = param.userName;
      data.rmanager = param.rmanager;
      data.passWord = md5(param.passWord+data.dynamic);
    fs.writeFileSync(confPath, JSON.stringify(data, null, "   "))
})

ipcMain.on('saveInnerCs', (event,param) => {
  loger.info("saveInnerCs:"+param);
    var data = JSON.parse(fs.readFileSync(confPath).toString());
      data.in_clientId = param.in_clientId;
      data.in_clientName = param.in_clientName;
      data.in_courseName = param.in_courseName;
      data.in_roomId = param.in_roomId;
      data.in_mcu = param.in_mcu;
      data.in_rmanager = param.in_rmanager;
      data.deviceId = param.deviceId;
      data.recName = param.recName;
      data.recPwd = param.recPwd;
      data.in_uType = param.in_uType;
      data.bitstream = param.bitstream;
      data.nginx = param.nginx;
      data.nginxFilePath = param.nginxFilePath;
    fs.writeFileSync(confPath, JSON.stringify(data, null, "   "))
     innerCsWindow.close();
})

ipcMain.on('userLogin',function(event){
  userLogin();
})

ipcMain.on('initWin',function(event){
  init();
})

ipcMain.on('openSetting',function(event,_path,_width,_height,_title,param){
  createInitSetWindow(_path,_width,_height,_title,param);
})

ipcMain.on('tools_child_hb',function(event,flag){
  loger.info("tools_child_hb:"+flag);
  toolsChildWindow.webContents.send("tools_child_hb",flag);
})

ipcMain.on('tools_child_zd',function(event,flag){
  /*loger.info("tools_child_zd:"+flag);
  toolsChildWindow.webContents.send("tools_child_zd",flag);*/
  var bounds = toolsWindow.getBounds();
  var winX = bounds.x,winY = bounds.y,winW = bounds.width,winH = bounds.height;
  //flag : true 横向 false 纵向
  if(flag){
      winX = (x - 600)/2;
      winY = y - 250;
      winW = 720;
      winH = 200;
  }else{
      winX = x - 200;
      winY = (y - 650)/2;
      winW = 120;
      winH = 800;
  }
  bounds.x = winX;
  bounds.y = winY;
  bounds.width = winW;
  bounds.height = winH;
  toolsWindow.setBounds(bounds);
  toolsChildWindow.webContents.send("tools_child_zd",flag);
})

ipcMain.on('tools_child_xp',function(event,flag){
  loger.info("tools_child_xp:"+flag);
  toolsChildWindow.webContents.send("tools_child_xp",flag);
});

ipcMain.on('func_v_zj',function(event,flag){
  loger.info("func_v_zj:"+flag);
  toolsChildWindow.webContents.send("func_v_zj",flag);
});


ipcMain.on('tools_child_pip_vga_max',function(event){
  toolsChildWindow.webContents.send("tools_child_pip_vga_max");
});

ipcMain.on('tools_child_pip_vga_min',function(event){
  toolsChildWindow.webContents.send("tools_child_pip_vga_min");
});

ipcMain.on('tools_child_pip_vga_no',function(event){
  toolsChildWindow.webContents.send("tools_child_pip_vga_no");
});

ipcMain.on('tools_child_pip_vga_one',function(event){
  toolsChildWindow.webContents.send("tools_child_pip_vga_one");
});

ipcMain.on('tools_child_startRec',function(event){
  toolsChildWindow.webContents.send("tools_child_startRec");
});

ipcMain.on('tools_child_stopRec',function(event){
  toolsChildWindow.webContents.send("tools_child_stopRec");
});

ipcMain.on('tools_child_startRec_status',function(event,status){
  toolsChildWindow.webContents.send("tools_child_startRec_status",status);
});
ipcMain.on('tools_child_openCanvas',function(event,isOpen){
  toolsChildWindow.webContents.send("tools_child_openCanvas",isOpen);
});

ipcMain.on('tools_child_clearCanvas',function(event){
  toolsChildWindow.webContents.send("tools_child_clearCanvas");
});
ipcMain.on('open_child_tt',function(event){
  toolsChildWindow.webContents.send("open_child_tt");
});
ipcMain.on('close_child_tt',function(event){
  toolsChildWindow.webContents.send("close_child_tt");
});
ipcMain.on('close_tt',function(event){
  toolsWindow.webContents.send("close_tt");
});
ipcMain.on('screenShotEx',function(event){
  renderer.screenShotEx(toolsChildWindow,toolsWindow,toolsChildWindow);
});

ipcMain.on('child_to_tools_change_rec_status',function(event,recStatus){
   toolsWindow.webContents.send("child_to_tools_change_rec_status",recStatus);
});

ipcMain.on('child_to_tools_whiteboard_status',function(event,status){
   toolsWindow.webContents.send("child_to_tools_whiteboard_status",status);
});
ipcMain.on('fayanrenVideo',function(event,name,videoPath){
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
    if(conf.stuMaxVideo){
      if(fayanrenWindow!=null){//换视频
      //fayanrenWindow.webContents.send("replaceFayanrenVideo",name,videoPath);
      fayanrenWindow.webContents.send("closeFayanrenWindow");
      setTimeout(function(){
          createFayanrenVideo(name,videoPath);
      },1000);
    }else{
      createFayanrenVideo(name,videoPath);
    }
    }

    
});
ipcMain.on('fayanren_removeWindows',function(event,sns,streamindexs,mainWinindexs){
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
  if(conf.stuMaxVideo){
  for (var i = 0; i < streamindexs.length; i++) {
      if(fayanrenWindow!=null){
        renderer.removeWindow(fayanrenWindow,g_videoWindowList,sns[i],streamindexs[i],mainWinindexs[i],true);
      }
    }
  }
});
ipcMain.on('close_fyrWindow',function(event){
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
  if(conf.stuMaxVideo){
  if(fayanrenWindow != null){
    fayanrenWindow.webContents.send("closeFayanrenWindow");
  }
  }
});

ipcMain.on('fyrhookWindow',function(event,ltwhArrays,urls,snList,noVolList,windowId){
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
  if(conf.stuMaxVideo){
    if(fayanrenWindow!=null){
       renderer.hookWindow(fayanrenWindow,g_videoWindowList,ltwhArrays,urls,snList,noVolList,windowId);
    }
 
  }
});
ipcMain.on('replaceFayanrenStream',function(event,divList,streamindexList,winindexList,noVolList,newUrls){
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
  if(conf.stuMaxVideo){
    if(fayanrenWindow!=null){
    renderer.replaceStream(fayanrenWindow,g_videoWindowList,divList,streamindexList,winindexList,noVolList,newUrls);
    }
  }
});

ipcMain.on('winfullscreen',function(){
  renderer.YXV_ConfMakeWindowFullScreen(toolsChildWindow);
});

ipcMain.on('getTaskBarInfo',function(){
  renderer.YXV_ConfGetTaskBarInfo(function(width,height,position){
    loger.info('getTaskBarInfo:width='+width+';height='+height+';position='+position);
  });
});

ipcMain.on('writeRegistry',function(event,regStr,key,val){
  renderer.YXV_ConfWriteRegistry(regStr,key,val);
});

ipcMain.on('setWindowFull',function(){
  renderer.YXV_ConfMakeWindowFullScreen(mainWindow);
});
//检查版本号 是否更新
const versionUpdate = function(v) {
  const exec = require('child_process').exec;
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
  var readStream = request(conf.nginx+"/v0/version.json");
  var _filePath = _confPath+'\\version.json';
  var writeStream = fs.createWriteStream(_filePath);
  readStream.pipe(writeStream);
  writeStream.on('finish', function() {
    loger.info("autoUpdate:文件下载完成。");
     // 子进程名称
    let workerProcess;
    var cmdStr = '"'+_filePath+'"';
    try {
       data  = JSON.parse(fs.readFileSync(_confPath + "/version.json").toString());
    }
      catch(err){
      if(v==1){
        electron.dialog.showMessageBox({
          type:'info',
          title: '提示框',
          message: '当前为最新版本!',
          buttons:['ok']
        }); 
        return;
      }else{
        return;
      }
    }
    var  flag =  Version( version.version,data.version);
    if(flag){
      electron.dialog.showMessageBox({
        type:'info',
        title: '提示框',
        message: '发现新版本,是否更新!',
        buttons:['ok','cancel']
      },(index) => {
        if ( index == 0 ) {
           autoUpdate();
        } 
      });

    }else{
      if(v==1){
        electron.dialog.showMessageBox({
          type:'info',
          title: '提示框',
          message: '当前为最新版本!',
          buttons:['ok']
        }); 
      }

    }
  });
};

function createProgress(){
    progressWindow = new BrowserWindow({
    title:"下载中",
    modal: true, 
    width: 500,
    height: 150,
    autoHideMenuBar:true,
    minimizable :false,
    maximizable :false,
    show:false,
    icon:'./res/app.ico',
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, 'res/js', 'preload.js'),
    }
  });
    progressWindow.once('ready-to-show', () => {
      progressWindow.show()
    })
  var viewPath = 'res/html/progress.html';

  progressWindow.loadURL(url.format({
    pathname: path.join(__dirname, viewPath),
    protocol: 'file:',
    slashes: true
  }))
  progressWindow.on('closed', function () {
    progressWindow = null
  })

}
//注销
const cancellation = function(){
  let confData = JSON.parse(fs.readFileSync(confPath).toString()); 
    confData.userName = "";
    confData.passWord = "";
    fs.writeFileSync(confPath, JSON.stringify(confData, null, "   "))
    /*var allWins = BrowserWindow.getAllWindows();
            
    for (var i = 0; i < allWins.length; i++) {
      allWins[i].close();
    }*/
    app.quit();
}
//更新版本
const autoUpdate = function() {
  const exec = require('child_process').exec; 
  var conf = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
  var downloadFile = conf.nginx+"/v0/lb_interation.exe";
  var fileName = "lb_interation.exe";
  var _filePath = _confPath+'\\'+fileName;
  createProgress();
// 调用下载
StreamDownload.downloadFile(downloadFile, _confPath,fileName, function(arg, percentage){
  if (arg === "progress")
    { 
       if(progressWindow!=null){
        progressWindow.webContents.send("percentage",percentage);
       }
    }
    else if (arg === "finished")
    {   
        var cmdStr = '"'+_filePath+'"';
        // 通知完成
        loger.info("download end");
        if(progressWindow!=null){
            progressWindow.webContents.send("percentage",100);
           setTimeout(function(){
            progressWindow.close();
            let workerProcess;
            workerProcess = exec(cmdStr, function(data){
             app.quit();
            });
          },3000) 
        }


    }
})

}
ipcMain.on('assistOpenOrCloseCanvas',function(event,flag){
  toolsWindow.webContents.send("assistOpenOrCloseCanvas",flag);
});

ipcMain.on('openOrCloseCanvas',function(event,flag){
  toolsWindow.webContents.send("openOrCloseCanvas",flag);
});

function Version(curV,reqV){//  curV项目当前版本 ,reqV最新版本号
          var arr1=curV.split('.');
          var arr2=reqV.split('.');
          //将两个版本号拆成数字 
          var minL= Math.min(arr1.length,arr2.length);  
          var pos=0;        //当前比较位
          var diff=0;        //当前为位比较是否相等
          //逐个比较如果当前位相等则继续比较下一位
          while(pos<minL){
              diff=parseInt(arr1[pos])-parseInt(arr2[pos]);  
              if(diff!=0){  
                break;  
              } 
              pos++;                  
          }
          
          if (diff>0) {
              return false;
          }else if (diff==0) {
              return false;
          }else{
              return true;
          }
 }


var err=0;
function httpRetryCallback(_url,_callback){
    const req = http.get(_url,function(req){  
        var json='';  
        req.on('data',function(data){  
            json+=data;  
        });  
        req.on('end',function(){  
          try {
            var data = JSON.parse(json);
            loger.info("httpRetryCallback:");
            loger.info(data)
            loger.info('------end---------')
            _callback(data);
          } catch(e) {
            console.log(e);
          }
        });  
        //req
    }).on("error",function(e){
          if(err==3){
             errorMsg = "SystemError";
             loger.info('=========系统异常=========='); 

             createErrorWindow();
             return;
          }
          err++;
          loger.info("---------------http    error--------------------");
          loger.info(e);
          loger.info("eee~~~~"+e.code);
          if( e.code === 'ECONNRESET'){
            httpRetryCallback(_url,_callback);
          }
        }); 
}