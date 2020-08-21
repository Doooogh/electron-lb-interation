const path = require('path')
const ffi = require('ffi')
const paramType=require('./cus-lib-param-type.js')

var confLib = ffi.Library(dllPath, {
    'YXV_ConfFindTitleOffset': ['void', [ 'pointer', 'pointer', 'pointer' ] ],
    'YXV_ConfInit': ['int', [ paramType.YXV_ConfPtrPtr ]],
    'YXV_ConfAddStream': ['int', [paramType.YXV_ConfPtr, 'int', 'string','int']],//加载视频
    'YXV_ConfRemoveStream': ['void', [paramType.YXV_ConfPtr, 'int']], 
    'YXV_ConfAddDisplay': ['int', [paramType.YXV_ConfPtr, 'int', 'int', 'int', 'int', 'int', 'int', 'pointer', 'pointer']],
    'YXV_ConfAddDisplay2': ['int', [paramType.YXV_ConfPtr, 'int', 'int', 'string', 'pointer', 'pointer']],//string:l,t,r,b(10,0,0,20)(10,2,3,20)
    'YXV_ConfRemoveDisplay': ['void', [paramType.YXV_ConfPtr, 'int', 'int']],//streamindex， winindex
	'YXV_ConfExit': ['void', [paramType.YXV_ConfPtr]],
	'YXV_ConfGetDevNameListV':['int',['int','string']],//获取视频字符串
	'YXV_ConfGetDevNameListA':['int',['int','string']],//获取音频字符串
	'YXV_ConfAddLocalStream':['int',[paramType.YXV_ConfPtr,'int','string','string','int','int']],//加载本地音视频
	'YXV_ConfStartSend':['int',[paramType.YXV_ConfPtr,'int','string']],//入会
	'YXV_ConfGetStreamVol':['int',[paramType.YXV_ConfPtr,'int','pointer']],//获取音量  streamindex， （返回参数）vol
	'YXV_ConfSetStreamVol':['int',[paramType.YXV_ConfPtr,'int','int']],//设置音量  streamindex， vol
	'YXV_ConfSetStreamAEC':['int',[paramType.YXV_ConfPtr,'int','int','int']],//回声抑制设置  int参数：1开启，0关闭 
	'YXV_ConfStartRec':['int',[paramType.YXV_ConfPtr,'string']],//开始录制  参数filePath
	'YXV_ConfStopRec':['int',[paramType.YXV_ConfPtr]],//结束录制
	'YXV_ConfMoveDisplay':['int',[paramType.YXV_ConfPtr,'int','int','int', 'int', 'int', 'int']],//移动窗口，参数  streamindex,winIndex,left,top,left+width,top+height
	'YXV_ConfMoveDisplay2':['int',[paramType.YXV_ConfPtr,'int','int','string']],//string:l,t,r,b(10,0,0,20)(10,2,3,20)
	'YXV_ConfChangeDisplay':['int',[paramType.YXV_ConfPtr,'int','int','int','pointer']],//替换streamindex
	//------------------------------------------------------------------
	//int-1:是否混合(0|1)，
	//int-2:混合结果width
	//int-3:height
	//int-4:码率（w*h*3）
	//int-5:帧率(15~30)
	//int-6：音频通道数（1，单通道   2 立体声）1
	//int-7：音频采样率 （48000）
	//int-8：音频码率（128000）
	'YXV_ConfROpen':['int',[paramType.YXV_ConfPtr,'int','int','int', 'int', 'int', 'int', 'int', 'int',paramType.YXV_ConfPtrPtr_R]],
	'YXV_ConfRAddStream':['int',[paramType.YXV_ConfPtr_R,'int','pointer']],
	'YXV_ConfRRemoveStream':['int',[paramType.YXV_ConfPtr_R,'int']],
	'YXV_ConfRStartRec':['int',[paramType.YXV_ConfPtr_R,'int','string']],
	'YXV_ConfRStopRec':['int',[paramType.YXV_ConfPtr_R]],
	'YXV_ConfRSwitchPip':['int',[paramType.YXV_ConfPtr_R,'string']],
	'YXV_ConfRSwitchMain':['int',[paramType.YXV_ConfPtr_R,'int']],
	'YXV_ConfRClose':['int',[paramType.YXV_ConfPtr_R]],
	'YXV_ConfRCanMix':['int',[]],
	'YXV_ConfScreenShotEx':['int',['string','pointer','pointer']],//path,
	// YXV_ConfScreenShotEx(const yuint8_t* filename, YXC_Window* window1, YXC_Window* window2);
	'YXV_ConfMakeWindowFullScreen':['int',['pointer']],
	'YXV_ConfGetTaskBarInfo':['int',['pointer', 'pointer','pointer']],
	'YXV_ConfWriteRegistry':['int',['string','string','string']]
});
module.exports=confLib;