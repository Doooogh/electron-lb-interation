const http = require('http');
const loger = require('../loger.js')
const cusWin=require('./open-window.js')
var err=0;  //错误次数 
var cusHttp={
		
	//封装 请求 
	 httpRetryCallback:(_url,_callback)=>{
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
	
	             cusWin.createErrorWindow();
	             return;
	          }
	          err++;
	          loger.info("---------------http    error--------------------");
	          loger.info(e);
	          loger.info("eee~~~~"+e.code);
	          if( e.code === 'ECONNRESET'){
	            cusHttp.httpRetryCallback(_url,_callback);
	          }
	        }); 
	},
}
module.exports=cusHttp;