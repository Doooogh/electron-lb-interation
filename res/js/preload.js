var ipcRenderer = require('electron').ipcRenderer
var remote = require('electron').remote
const {shell} = require('electron')
const { clipboard } = require('electron')
const desktopCapturer = require('electron').desktopCapturer;
var http = require('http')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process');
const config = require('../../conf.js')
const loger = require('./loger.js')

const iconv = require('iconv-lite');
const os = require('os');
const url = require('url')
var UUID = require('uuid');
const confPath = os.homedir()+'/'+config.BASE_CONF_PATH+'/conf.json';

const platform = {
  OSX: process.platform === 'darwin',
  Windows: process.platform === 'win32'
}
var appInfo


const _confPath = os.homedir()+"/"+config.BASE_CONF_PATH;

try {
  appInfo = remote.require('../../package.json')
} catch (err) {
  appInfo = null
}

window.Electron = {
  ipcRenderer: ipcRenderer,
  appInfo: appInfo,
  remote:remote,
  config:config,
  callback:'',
  bounds:{},
  isFull:false,
  dirname:__dirname,
  show:function(msg,title,type){
    if(!title) title = config.about.title;
    if(type && type == 'confirm'){
      confirm(msg,title)
    }else{
      alert(msg,title);
    }
  },
  log:function(title,msg){
    var log_str = '';
    if (typeof msg == 'string') {
        log_str = msg;
    }else{
      log_str = JSON.stringify(msg);
    }
    loger.info(title+":"+log_str);
  },
  saveConf:function(param){
      ipcRenderer.send("saveConf",param);
  },
/*  userLogin:function(winObj,param){
      ipcRenderer.send("userLogin",winObj,param);
  }, */
  saveInnerCs:function(param){
      ipcRenderer.send("saveInnerCs",param);
  },
  copyText:function(text){
    clipboard.writeText(text)
  },
  readConf:function(){
    var data = JSON.parse(fs.readFileSync(confPath).toString());
    return data;
  },
  writeConf:function(params,datas){
    var data = JSON.parse(fs.readFileSync(confPath).toString());
    for (var i = 0; i < params.length; i++) {
      data[params[i]] = datas[i]
    }
    fs.writeFileSync(confPath, JSON.stringify(data, null, "   "))
  },
  initWin:function(){
    ipcRenderer.send("initWin");
  },
  openSetting:function(_path,_width,_height,_title,param){
    ipcRenderer.send('openSetting',_path,_width,_height,_title,param);

  },
  closeCurrWin:function(){
    remote.getCurrentWindow().close();
  },
  setAppStart:function(){
    var regStr = '\\HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
    var key = 'interation';
    var val = remote.app.getPath('exe');
    ipcRenderer.send('writeRegistry',regStr,key,val);
  },
  cancelAppStart:function(){
    var regStr = '\\HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
    var key = 'interation';
    var val = '';
    ipcRenderer.send('writeRegistry',regStr,key,val);
  },
  openMessage:function(msg){
    ipcRenderer.send('openMessage',msg);
    
  },
  screenshot:function(callback){
    window.Electron.callback = callback;
    ipcRenderer.send('screenShotEx');
  },
  decodeBuff:function(imgString){
      var stringn = imgString;
      var acode = "a".charCodeAt();
      var result = Buffer.alloc(stringn.length / 2);
      for (var i = 0; i < stringn.length / 2; ++i)
      {
        var a = stringn.charCodeAt(i*2) - acode, b = stringn.charCodeAt(i*2+1) - acode;
        var val = (a << 4) + b;
        result[i] = val;
      }
     return result.toString('base64');
  },
  uploadFile:function(filePath,callback){
    if(typeof callback === "function"){
      window.Electron.callback = callback;
    }
    var data = JSON.parse(fs.readFileSync(confPath).toString());
    if(data.hdType=="inner"){
    fs.readFile(filePath,function(err,originBuffer){
    fs.writeFile(_confPath+"/img.png",originBuffer,function(err){      //生成图片2(把buffer写入到图片文件)
        if (err) {
            console.log(err)
        }
    });
    var uuid = UUID.v1();  
    var fileName = uuid+'.png';
    var base64Img = originBuffer.toString("base64");                //base64 图片编码
    var decodeImg = new Buffer(base64Img,"base64")                  //new Buffer(string, encoding)
    fs.writeFile(data.nginxFilePath+"\\resource\\resourceTranscoder\\play\\root\\mcu\\"+fileName,decodeImg,function(err){        // 生成图片3(把base64位图片编码写入到图片文件)
        if (err) {
            console.log(err)
        }
      setTimeout(function(){
        if(typeof window.Electron.callback === "function" ){
          window.Electron.callback(fileName);
        }
        loger.info("fileName:"+fileName)
      },500);
    })

  })
    }else{
    var _path = config.FILE_UPLOAD+"?fileName=lessonFile&"+global.url_param;
    var options = {
        host: data.host,
        port: data.port,
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
        console.log(json);
      });
     
    });
    var uuid = UUID.v1();  
    var fileName = uuid+'.png';
    var boundaryKey = Math.random().toString(16); 
    var payload = '--' + boundaryKey + '\r\n'
    + 'Content-Type: video/mpeg4\r\n' 
    + 'Content-Disposition: form-data; name="fileupload"; filename="'+fileName+'"\r\n'
    + 'Content-Transfer-Encoding: binary\r\n\r\n';
    console.log(payload.length);
    var enddata  = '\r\n--' + boundaryKey + '--';
    console.log('enddata:'+enddata.length);
    reqHttps.setHeader('Content-Type', 'multipart/form-data; boundary='+boundaryKey+'');

    
    reqHttps.write(payload);
    
    var fileStream = fs.createReadStream(filePath, { bufferSize: 4 * 1024 });
    fileStream.pipe(reqHttps, {end: false});
    var passedLength = 0;
    fileStream.on('data', function (chunk) {
         passedLength += chunk.length;
    });

    fileStream.on('end', function() {
      reqHttps.end(enddata); 
      console.log('fileStream end!');
      setTimeout(function(){
        // callback(fileName)
        if(typeof window.Electron.callback === "function" ){
          window.Electron.callback(fileName);
        }
        loger.info("fileName:"+fileName)
      },500);
    });
    
    reqHttps.on('error', function(e) {
      console.log('uploadFile', e);
    });
  }
  },
  setWindowFull:function(){
    try{
      var bounds = window.Electron.remote.getCurrentWindow().getBounds();
      window.Electron.bounds = bounds;
      ipcRenderer.send("setWindowFull");
      // window.Electron.remote.getCurrentWindow().setFullScreen(true)
      window.Electron.isFull = true;
    }catch(err){
      
    }
  },
  setWindowOldSize:function(){
    try
   {
      var bounds = window.Electron.remote.getCurrentWindow().getBounds();
      var _bounds = window.Electron.bounds;
      bounds.x = _bounds.x;
      bounds.y = _bounds.y;
      bounds.width = _bounds.width;
      bounds.height = _bounds.height;
      window.Electron.remote.getCurrentWindow().setBounds(bounds);
   }
  catch(err)
   {

   }
    
  },
 checkServerStatus:function(callback){
	  setInterval(function(){
		  if(remote.getGlobal('mcuServerStatus') && remote.getGlobal('rmanagerServerStatus')){
		  		  callback(true)
		  }else{
		  		  callback(false)
		  }
		
	  },2000)
	  
  },
  
 
}

window.Electron.ipcRenderer.on('screenShotEx',function(event,filePath){
    window.Electron.uploadFile(filePath);
})