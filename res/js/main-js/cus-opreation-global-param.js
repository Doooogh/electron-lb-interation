/**
 * 对全局变量的操作方法
 * @type {{}}
 */
/*global.g_streamArr = new Array();

global.currentVideo;
global.currentAideo;
// global.myAudioStreamindex;

global.videoStr;
global.audioStr;
global.audioKey;
global.videoKey;*/

var cusGlobal={
    g_streamArrSet:(index,obj)=> {
        var temArr = global.g_streamArr;
        let temLength = temArr.length;
            if (temLength == 0) {
                index == 0
            } else if(index > temLength){
                index = temLength;
            }
        temArr[index]=obj;
        global.g_streamArr=temArr;
    },
    g_streamArrGet:(index)=>{
        if(index){
            return global.g_streamArr[index];
        }
        return  global.g_streamArr;
    },



}
module.exports = cusGlobal;