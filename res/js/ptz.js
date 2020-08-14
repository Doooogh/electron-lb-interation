var PTZ = {
	speed:50,
	speed2:50,
	camera:null,
	//向左连续移动
	left:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		} 
		Tools.ptz.action = "left";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向右连续移动
	right:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "right";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向上连续移动
	up:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "up";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向下连续移动
	down:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "down";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向左上连续移动
	leftup:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "leftup";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Tools.ptz.speed2 = PTZ.speed2;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向右上连续移动
	rightup:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "rightup";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Tools.ptz.speed2 = PTZ.speed2;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向左下连续移动
	leftdown:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "leftdown";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Tools.ptz.speed2 = PTZ.speed2;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//向右下连续移动
	rightdown:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "rightdown";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Tools.ptz.speed2 = PTZ.speed2;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//镜头连续拉近
	near:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "zoom";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = PTZ.speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//镜头连续拉远
	far:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "zoom";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = -PTZ.speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//停止以上的云台转动
	stop:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "stop";
		Tools.ptz.camera = PTZ.camera;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//设置当前位置为预置位
	setPreset:function(managerAddr,token,preset){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "setPreset";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.preset = preset;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//调用预置位
	callPreset:function(managerAddr,token,preset){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "callPreset";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.preset = preset;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//回到R预置位
	home:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "home";
		Tools.ptz.camera = PTZ.camera;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//设置当前预置位为R预置位
	setHome:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "setHome";
		Tools.ptz.camera = PTZ.camera;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//聚焦
	focus:function(managerAddr,token,speed){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "focus";
		Tools.ptz.camera = PTZ.camera;
		Tools.ptz.speed = speed;
		Server.ptz(managerAddr,token,Tools.ptz);
	},
	//停止聚焦
	stopFocus:function(managerAddr,token){
		if(PTZ.camera == null) {
			window.Electron.show("不能操作云台！");
			return;
		}
		Tools.ptz.action = "stopFocus";
		Tools.ptz.camera = PTZ.camera;
		Server.ptz(managerAddr,token,Tools.ptz);
	}
}