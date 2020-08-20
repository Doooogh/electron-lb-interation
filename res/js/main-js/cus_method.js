const ping = require('node-http-ping');

const { ipcMain } = require('electron')



var cusNet={
	pingInternet:(ipAddress,callback)=>{
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
	},
	getServerStatus:(mcuIpAddress,rmanagerIpAddress,callback)=>{
		let num=0;
		setInterval(function(){
			cusNet.pingInternet(mcuIpAddress,function(res){
				global.mcuServerStatus = res;
				
			});
			cusNet.pingInternet(rmanagerIpAddress,function(res){
				global.rmanagerServerStatus = res;
			});
			
			callback();
			/* if(!global.mcuServerStatus&&global.rmanagerServerStatus){
				
				if(num%10==0){   //每过二十秒弹出一次
					openMsgWithMsgAndTime(null,"系统网络错误",2000);
				}
				num++;
			} */
			
		},2000);
	}
}

module.exports=cusNet

