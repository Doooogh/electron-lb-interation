let currentVideo;
const cusUtils=require('./cus-utils.js')

var cusVideo={
	setCurrentVideo:(_videoStr)=>{
		global.currentVideo = _videoStr;
	},
	getVideoStr : (mainWindow,left,top,width,height,room_id)=> {
		var streamindex = cusUtils.openStream(mainWindow,left,top,width,height);
		// console.log("------openStream----streamindex-------------------------"+streamindex);
		//视频推流，入会
		cusUtils.sendStream(mainWindow,streamindex,room_id);
	},




}

module.exports=cusVideo;