/**
 * 常量
 */
const os = require('os');
const config = require('./../../../conf.js')
var cusConst={
	//配置文件路径
	_confPath:os.homedir()+"/"+config.BASE_CONF_PATH,
	WIN_MAX_STREAMS: 16,
	MAX_STREAMS :100,
	confDefaultData:{
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
			"filePath": os.homedir()+"/"+config.BASE_CONF_PATH,
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
			"nginxFilePath":"",
			"lastModified":""
	}
	
}
module.exports=cusConst;