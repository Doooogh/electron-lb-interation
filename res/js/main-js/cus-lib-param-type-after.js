const ref = require('ref')
const cusParamType=require('./cus-lib-param-type.js')
const confLib=require('./conf-lib.js')

/*let confHandlePtr=cusParamType.confHandlePtr

let confHandle = confHandlePtr.deref()

let confHandlePtr_R = ref.alloc(cusParamType.YXV_ConfPtrPtr_R)
let confHandle_R;  //全局变量*/


let confHandlePtr = ref.alloc(cusParamType.YXV_ConfPtrPtr)
confLib.YXV_ConfInit(confHandlePtr)
let confHandle = confHandlePtr.deref()  //方法中使用到了
let confHandlePtr_R = ref.alloc(cusParamType.YXV_ConfPtrPtr_R)//方法中使用到了


var cusParamTypeAfter={
    confHandle:confHandle,
    confHandlePtr_R:confHandlePtr_R,
}
module.exports=cusParamTypeAfter;