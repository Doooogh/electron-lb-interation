const config = require('../../conf.js')
const os = require('os');  
const log4js = require('log4js');
const _confPath = os.homedir()+"/"+config.BASE_CONF_PATH;
const logPath = _confPath + '/log/lb_interation';

log4js.configure({
  appenders: {
    out: { type: 'stdout' },//设置是否在控制台打印日志
    info: { type: 'dateFile', filename: logPath,"alwaysIncludePattern": true,"pattern": "-yyyy-MM-dd.log"}
  },
  categories: {
    default: { appenders: [ 'out', 'info' ], level: 'info' }//去掉'out'。控制台不打印日志
  }
});
const fileLogger = log4js.getLogger('info');
exports.info = function(msg){
	fileLogger.info(msg)
}