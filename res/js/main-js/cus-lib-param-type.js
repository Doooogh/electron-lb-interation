const ref = require('ref')

var YXV_Conf = 'void' // `sqlite3` is an "opaque" type, so we don't know its layout   1
, YXV_ConfPtr = ref.refType(YXV_Conf)
, YXV_ConfPtrPtr = ref.refType(YXV_ConfPtr)
, stringPtr = ref.refType('string')

var YXV_Conf_R= 'void' // `sqlite3` is an "opaque" type, so we don't know its layout 1
, YXV_ConfPtr_R = ref.refType(YXV_Conf_R)
, YXV_ConfPtrPtr_R = ref.refType(YXV_ConfPtr_R)

let confHandlePtr = ref.alloc(YXV_ConfPtrPtr)



var paramType={
	YXV_Conf:YXV_Conf,
	YXV_ConfPtr:YXV_ConfPtr,
	YXV_ConfPtrPtr:YXV_ConfPtrPtr,
	stringPtr:stringPtr,
	YXV_Conf_R:YXV_Conf_R,
	YXV_ConfPtr_R:YXV_ConfPtr_R,
	YXV_ConfPtrPtr_R:YXV_ConfPtrPtr_R,
	confHandlePtr:confHandlePtr

}
module.exports=paramType



/*
module.exports.YXV_Conf='void'
module.exports.YXV_ConfPtr=ref.refType(YXV_Conf)
module.exports.YXV_ConfPtrPtr=ref.refType(YXV_ConfPtr)
module.exports.stringPtr=ref.refType('string')

module.exports.YXV_Conf_R='void'
module.exports.YXV_ConfPtr_R=ref.refType(YXV_Conf_R)
module.exports.YXV_ConfPtrPtr_R=ref.refType(YXV_ConfPtr_R)
module.exports.confHandlePtr=ref.alloc(YXV_ConfPtrPtr)
module.exports.confHandle=confHandlePtr.deref()
module.exports.confHandlePtr_R=ref.alloc(YXV_ConfPtrPtr_R)
module.exports.confHandle_R*/
