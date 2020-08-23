/**
 * 常量
 */
/**
 *常量
 */
const os = require('os');
const config = require('./../../../conf.js')

var cusConst={
	//配置文件路径
	_confPath:os.homedir()+"/"+config.BASE_CONF_PATH,
	WIN_MAX_STREAMS: 16,
	MAX_STREAMS :100,
	
}
module.exports=cusConst;