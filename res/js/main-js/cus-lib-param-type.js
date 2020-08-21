const ref = require('ref')



let YXV_Conf = 'void' // `sqlite3` is an "opaque" type, so we don't know its layout   1
, YXV_ConfPtr = ref.refType(YXV_Conf)  
, YXV_ConfPtrPtr = ref.refType(YXV_ConfPtr)
, stringPtr = ref.refType('string')  

let YXV_Conf_R = 'void' // `sqlite3` is an "opaque" type, so we don't know its layout 1
, YXV_ConfPtr_R = ref.refType(YXV_Conf_R)  
, YXV_ConfPtrPtr_R = ref.refType(YXV_ConfPtr_R)


let confHandlePtr = ref.alloc(YXV_ConfPtrPtr)
confLib.YXV_ConfInit(confHandlePtr)
let confHandle = confHandlePtr.deref()

let confHandlePtr_R = ref.alloc(YXV_ConfPtrPtr_R)
let confHandle_R;

var paramType={
	YXV_Conf:YXV_Conf,
	YXV_ConfPtr:YXV_ConfPtr,
	YXV_ConfPtrPtr:YXV_ConfPtrPtr,
	stringPtr:stringPtr,
	YXV_Conf_R:YXV_Conf_R,
	YXV_ConfPtr_R:YXV_ConfPtr_R,
	YXV_ConfPtrPtr_R:YXV_ConfPtrPtr_R,
	
	confHandlePtr:confHandlePtr,
	confLib:confLib,
	confHandle:confHandle,
	confHandlePtr_R:confHandlePtr_R,
	confHandle_R:confHandle_R,
}
module.exports=paramType