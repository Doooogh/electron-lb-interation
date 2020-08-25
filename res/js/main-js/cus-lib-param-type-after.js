const ref = require('ref')
const cusParamType=require('cus-lib-param-type')

let confHandlePtr=cusParamType.confHandlePtr


let confHandle = confHandlePtr.deref()

let confHandlePtr_R = ref.alloc(cusParamType.YXV_ConfPtrPtr_R)
let confHandle_R;  //全局变量

var cusParamTypeAfter={
    confHandle:confHandle,
    confHandlePtr_R:confHandlePtr_R,
}
module.exports=cusParamTypeAfter;