/**
 * 工具类
 */

const cusConst = require('./const.js');
const confLibParam = require('./cus-lib-param-type')
const loger = require('./../loger.js')
const confLib=require('./conf-lib.js')

const cusGlobalParam=require('./cus-opreation-global-param')

let confHandle = confLibParam.confHandle;

var fs = require('fs')

let WIN_MAX_STREAMS = cusConst.WIN_MAX_STREAMS,
    MAX_STREAMS =  cusConst.MAX_STREAMS;
var streamUrl;
var cusUtils = {

    //读取配置文件
    readConf: (param) => {
        var data = JSON.parse(fs.readFileSync(cusConst._confPath + "/conf.json").toString());
        if(undefined==param||null==param){
            return data;
        }
        return data[param];
    },

    //上传文件
    uploadFile: (win, _filePath, type, fileNo) => {
        global.is_upload = true;//
        var webContents = win.webContents;
        webContents.send('uploadFile', _filePath);
        if (!_filePath) {
            _filePath = filePath;
        }
        fs.exists(_filePath, function (exists) {
            if (!exists) {
                global.is_upload = false;//
                webContents.send('uploadFile', exists);
            } else {
                var fileName = _filePath.substring(_filePath.lastIndexOf('\\') + 1);
                var boundaryKey = Math.random().toString(16); //随机数，目的是防止上传文件中出现分隔符导致服务器无法正确识别文件起始位置
                console.log(boundaryKey);
                var _path = "";
                if (type == "fileUpload") {
                    _path = config.FILE_UPLOAD + "?fileName=lessonFile&" + global.url_param;
                } else {
                    _path = config.LESSON_UPLOAD + '?fileName=lessonFile&lessonId=' + global.lessonId + '&teacherId=' + global.teacherId + '&tken=' + global.token;
                }
                var options = {
                    host: config.HOST,
                    port: config.PORT,
                    path: _path,
                    method: 'POST'
                };

                var reqHttps = http.request(options, function (resHttps) {
                    console.log("statusCode: ", resHttps.statusCode);
                    console.log("headers: ", resHttps.headers);
                    var json = '';
                    resHttps.on('data', function (data) {
                        console.log("body:" + data);
                        json += data;
                        webContents.send('uploadFile', json);
                    });

                });
                var payload = '--' + boundaryKey + '\r\n'
                    + 'Content-Type: video/mpeg4\r\n'
                    + 'Content-Disposition: form-data; name="lessonFile"; filename="' + fileName + '"\r\n'
                    + 'Content-Transfer-Encoding: binary\r\n\r\n';
                console.log(payload.length);
                var enddata = '\r\n--' + boundaryKey + '--';
                console.log('enddata:' + enddata.length);
                reqHttps.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundaryKey + '');


                reqHttps.write(payload);

                var fileStream = fs.createReadStream(_filePath, {bufferSize: 4 * 1024});
                fileStream.pipe(reqHttps, {end: false});

                var stat = fs.statSync(_filePath);
                var totalSize = stat.size;
                var passedLength = 0;
                var lastSize = 0;
                var startTime = Date.now();
                var fs_interval;
                fileStream.on('data', function (chunk) {
                    passedLength += chunk.length;
                });
                fs_interval = setInterval(function show() {
                    var percent = Math.ceil((passedLength / totalSize) * 100);
                    var size = Math.ceil(passedLength / 1000);
                    var diff = size - lastSize;
                    lastSize = size;
                    var _result = {
                        "status": "uploadding",
                        "totleSize": Math.ceil(totalSize / 1000000),
                        "percent": percent,
                        "completeSize": size / 1000,
                        "speed": Math.ceil(diff),
                        "timeForUsed": (Date.now() - startTime) / 1000,
                        "fileNo": fileNo
                    }
                    webContents.send('uploadFile', _result);
                }, 1000);

                fileStream.on('end', function () {
                    reqHttps.end(enddata);
                    webContents.send('uploadFile', 'file upload finished!');
                    global.is_upload = false;
                    var endTime = Date.now();
                    var _result = {
                        "status": "uploaded",
                        "totleSize": Math.ceil(totalSize / 1000000),
                        "completeSize": Math.ceil(totalSize / 1000000),
                        "timeForUsed": (endTime - startTime) / 1000,
                        "fileNo": fileNo
                    }
                    webContents.send('uploadFile', _result);
                    if (fs_interval) {
                        clearInterval(fs_interval);
                    }
                });

                reqHttps.on('error', function (e) {
                    webContents.send('uploadFile', e);
                    console.error("error:" + e);
                    global.is_upload = false;
                    if (fs_interval) {
                        clearInterval(fs_interval);
                    }
                });
            }
        })
    },
    //写入配置文件
    writeConf: (win, data) => {
        fs.writeFile(cusConst._confPath + "/conf.json", JSON.stringify(data, null, "   "), function (err, data) {
            if (win != null) {
                var webContents = win.webContents;
                var _result;
                if (err) {
                    _result = {
                        'status': 'error',
                        'msg': err
                    }
                } else {
                    _result = {
                        'status': 'ok',
                        'msg': ''
                    }
                }
                webContents.send('writeConf', _result);
            }

        })
    },
    mkdirsSync: (dirpath, mode) => {
        try {
            if (!fs.existsSync(dirpath)) {
                let pathtmp;
                dirpath.split(/[/\\]/).forEach(function (dirname) {  //这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
                    if (pathtmp) {
                        pathtmp = path.join(pathtmp, dirname);
                    } else {
                        pathtmp = dirname;
                    }
                    if (!fs.existsSync(pathtmp)) {
                        if (!fs.mkdirSync(pathtmp, mode)) {
                            return false;
                        }
                    }
                });
            }
            return true;
        } catch (e) {
            loger.info("create director fail! path=" + dirpath + " errorMsg:" + e);
            return false;
        }
    },

    //------------------------------strean--------------------------------
    avr_findIdleStreamIndex: () => {
        for (var i = 0; i < MAX_STREAMS; ++i) {
            if (cusGlobalParam.g_streamArrGet(i) == null) {
                return i;
            }
        }

        return -1;
    },
    avr_reallyRemoveStream: (streamIndex) => {
        var stream = cusGlobalParam.g_streamArrGet(streamIndex);
        if (stream != null && stream.refCount == 0 && stream.rIndex == -1) {
            confLib.YXV_ConfRemoveStream(confHandle, streamIndex);
            loger.info('avr_reallyRemoveStream:' + streamIndex);
            // global.g_streamArr[streamIndex] = null;
            cusGlobalParam.g_streamArrSet(streamIndex,null);
        }
    },
    avr_RemoveStreamAndWindow:(streamIndex, winIndex)=> {
        // var stream = global.g_streamArr[streamIndex];
        var stream = cusGlobalParam.g_streamArrGet(streamIndex);

        if (stream != null)
        {
            confLib.YXV_ConfRemoveDisplay(confHandle, streamIndex, winIndex);
            var refCount = stream.refCount;
            --stream.refCount;
            if (stream.refCount == 0 && stream.rIndex == -1)  /* the only stream reference, remove stream if too much. */
            {
                setTimeout(function() {
                    cusUtils.avr_reallyRemoveStream(streamIndex);
                }, 5000); /* Really remove stream when don't use in 5 seconds, prevent student bug. */
                loger.info('avr_removeStream:' + streamIndex);
            }
        }
    },
    avr_FindOrAddStream:(url) =>{
        if (url == null) url = "";
        for (var i = 0; i < MAX_STREAMS; ++i) {
            if (cusGlobalParam.g_streamArrGet(i) != null && cusGlobalParam.g_streamArrGet(i).url == url) {
                ++cusGlobalParam.g_streamArrGet(i).refCount;
                loger.info('hookWindow:avr_FindOrAddStream ' + url + ' return existing-' + i);
                return i;
            }
        }

        var newIndex = cusUtils.avr_findIdleStreamIndex();
        loger.info("global.g_streamArr newIndex"+newIndex);
        var srInfo = {};
        srInfo.url = url;
        srInfo.refCount = 1;
        srInfo.rIndex = -1;
        srInfo.index = newIndex;
        // global.g_streamArr[newIndex] = srInfo;
        cusGlobalParam.g_streamArrSet(newIndex,srInfo);

        var delayMS = cusUtils.readConf("millisecond");
        if (delayMS == null) delayMS = 200;
        var addStreamResult = confLib.YXV_ConfAddStream(confHandle, srInfo.index, url, delayMS);
        loger.info('hookWindow:YXV_ConfAddStream=streamindex-'+srInfo.index+':result-'+addStreamResult+':url-'+url+':delay-'+delayMS);

        return srInfo.index;
    },

    avr_removeWindowByIndex:(vwl, index, exited) =>{
        var vwInfo = vwl[index];

        var wsCount = vwInfo.streamIndex.length;
        for (var j = 0; j < wsCount; ++j)
        {
            if (vwInfo.streamIndex[j] != -1)
            {
                confLib.avr_RemoveStreamAndWindow(vwInfo.streamIndex[j], vwInfo.winIndex[j]);
            }
            vwInfo.streamIndex[j] = -1;
            vwInfo.winIndex[j] = -1;
        }

        if (!exited) {
            vwInfo.wnd.hide();
            vwInfo.using = false;

            loger.info('avr_removeWindowByIndex:windowHide-'+index);
            //setTimeout(function () {
            //	avr_realDestroyWindow()
            //}, 5000);
        } else {
            vwInfo.wnd.destroy();
            vwl.splice(index, 1);

            loger.info('avr_removeWindowByIndex:windowDestroy-'+index);
        }
    },
    avr_removeWindow:(vwl, windowId, closeWindow) =>{
        loger.info('avr_removeWindow:windowId-'+windowId);
        for (var i = 0; i < vwl.length; ++i)
        {
            var vwInfo = vwl[i];
            if (vwInfo.windowId == windowId) /* window already exists, */
            {
                loger.info('avr_removeWindow:index-'+i+',refCount:'+vwInfo.refCount);
                --vwInfo.refCount;
                if (vwInfo.refCount == 0)
                {
                    confLib.avr_removeWindowByIndex(vwl, i, closeWindow);
                }

                var streams_str = 'avr_streams:';
                for (var x = 0; x < MAX_STREAMS; ++x)
                {
                    // if (global.g_streamArr[x] != null) streams_str += 'stream' + x + ":" + JSON.stringify(global.g_streamArr[x]);
                    if (cusGlobalParam.g_streamArrGet(x) != null) streams_str += 'stream' + x + ":" + JSON.stringify(cusGlobalParam.g_streamArrGet(x));
                }
                loger.info(streams_str);
                break;
            }
        }
    },
    avr_findWindow(vwl, windowId) {
        for (var i = 0; i < vwl.length; ++i)
        {
            var vwInfo = vwl[i];
            if (vwInfo.windowId == windowId) /* window already exists, */
            {
                return vwInfo;
            }
        }

        return null;
    },
    avr_findRealBounds:(mainWindow, l, t, w, h) =>{
        var bounds = mainWindow.getBounds();

        var scale = global.externalDisplay.scaleFactor;
        var newBounds = { "x":l + bounds.x*scale, "y": t + bounds.y*scale, "width": w, "height": h };

        let hwnd = mainWindow.getNativeWindowHandle() //获取窗口句柄。

        var isMax = mainWindow.isMaximized();
        //if (!isMax)
        //{
        var retX = new Buffer(4), retY = new Buffer(4);
        confLib.YXV_ConfFindTitleOffset(hwnd, retX, retY);

        var xOff = retX.readInt32LE(0), yOff = retY.readInt32LE(0);
        newBounds.x -= xOff*scale;
        newBounds.y -= yOff*scale;
        if (isMax)
        {
            newBounds.x -= xOff*scale;
            newBounds.y -= yOff*scale;
        }

        newBounds.x = parseInt(Math.round(newBounds.x));
        newBounds.y = parseInt(Math.round(newBounds.y));
        loger.info("avr_findRealBounds:" + JSON.stringify(newBounds)+ ',xOff='+xOff+',yOff='+yOff);
        return newBounds;
    },
    avr_addWindow:(mainWindow, l, t, w, h, windowId) =>{
        var newVW = {};
        // var sdf = pipJson.ltrb.split(",");
        var bounds = cusUtils.avr_findRealBounds(mainWindow, l, t, w, h);

        var videoWindow = new BrowserWindow(
            {
                title:"childVideoWindow",
                focusable:false,
                frame:true,
                autoHideMenuBar:true,
                resizable:false,
                moveable:false,
                closable:false,
                minimizable:false,
                maximizable:false,
                parent:mainWindow,
                modal:false,
                transparent:false,
                backgroundColor:"#000000",
                webPreferences: {
                    plugins: true,
                    preload: path.join(__dirname, 'res/js', 'preload.js'),
                },
                show:false
            });

        var url2 = urllib.format({
            pathname: path.join(__dirname, 'view_complex/html/video.html'),
            protocol: 'file:',
            slashes: true
        });
        videoWindow.setBounds(bounds);
        videoWindow.on('ready-to-show', function () {
            videoWindow.show();
        });
        videoWindow.loadURL(url2 + "?windowId=" + windowId);
        // videoWindow.openDevTools();
        newVW.wnd = videoWindow;
        newVW.parent = mainWindow;
        newVW.l = l;
        newVW.t = t;
        newVW.w = w;
        newVW.h = h;

        newVW.streamIndex = Array();
        newVW.winIndex = Array();

        for (var i = 0; i < WIN_MAX_STREAMS; ++i) {
            newVW.streamIndex[i] = -1;
            newVW.winIndex[i] = -1;
        }
        newVW.refCount = 1;
        newVW.windowId = windowId;
        newVW.using = true;
        newVW.isCanvas = false;

        return newVW;
    },
    getVideos:()=>{
        console.log("-----------------------getVideos--------------------");
        var retWinIndex1 = new Buffer(2000);
        confLib.YXV_ConfGetDevNameListV(2000, retWinIndex1);
        var v_resultStr = retWinIndex1.toString();
        global.videoStr = v_resultStr;
        var v_results = v_resultStr.split("|");
        var videsMap =  new Map();
        if(v_results.length > 0){
            for(var i = 1;i<v_results.length-1;i=i+2){
                videsMap.set(v_results[i],v_results[i+1]);
            }
        }
        return videsMap;
    },

     getAudios:()=>{
        var retWinIndex2 = new Buffer(2000);
        confLib.YXV_ConfGetDevNameListA(2000, retWinIndex2);
        // console.log("Buffer2 val:" + retWinIndex2.toString("utf8"));
        var a_resultStr = retWinIndex2.toString();
        global.audioStr = a_resultStr;
        var a_results = a_resultStr.split("|");
        var audiosMap =  new Map();
        if(a_results.length > 1){
            for(var i = 1;i<a_results.length-1;i=i+2){
                audiosMap.set(a_results[i],a_results[i+1]);
            }
        }
        return audiosMap;
    },
    openStream:(mainWindow,left,top,width,height)=>{
        var webContents = mainWindow.webContents;

        var videoUris = cusUtils.getVideos();
        var audioUris = cusUtils.getAudios();

        // console.log("audioUris----:"+audioUris);
        if(videoUris.size == 0){
            result = {
                code:-1,
                type:"stream",
                msg:"请插入视频设备！"
            };
            webContents.send('video', result);
            return ;
        }

        if(audioUris.length == 0){
            result = {
                code:-1,
                type:"stream",
                msg:"请插入音频设备！"
            };
            webContents.send('video', result);
            return ;
        }

        var result;
        var retWinIndex3 = new Buffer(4);
        let hwnd = mainWindow.getNativeWindowHandle() //获取窗口句柄。

        var streamindex = getStreamIndex();
        if(global.currentVideo) {
            global.videoKey = global.currentVideo;
        } else {
            videoUris.forEach(function (item, key, mapObj) {
                global.videoKey = key;
                return;
            });
        }
        if(global.currentAideo){
            global.audioKey = global.currentAideo;
        }else{
            audioUris.forEach(function (item, key, mapObj) {
                global.audioKey = key;
                return;
            });
        }
        var x = confLib.YXV_ConfAddLocalStream(confHandle,streamindex, global.videoKey,global.audioKey,0,0);
        console.log("---------x-------------------=="+x)
        if(x != 0){
            result = {
                code:-1,
                x:x,
                type:"openStream",
                msg:"打开摄像头失败"
            };
            webContents.send('video', result);
            return ;
        }
        // console.log("left:"+left+"-top:"+top+"-left+width:"+(left+width)+"-top+height:"+(top+height));
        confLib.YXV_ConfAddDisplay(confHandle, streamindex, 1,left,top,left+width,top+height, hwnd, retWinIndex3);
        // console.log("--------open------------:" + retWinIndex3.readUInt32LE(0));
        result = {
            code:0,
            type:"openStream",
            msg:"打开摄像头成功",
            streamindex:streamindex,
            winindex:retWinIndex3.readUInt32LE(0)
        };
        webContents.send('video', result);
        return streamindex;
    },

    sendStream:(mainWindow,streamindex,room_id)=>{
        var webContents = mainWindow.webContents;
        var uuid =  UUID.v1();
        // console.log("uuid--------------------"+uuid+"--------random="+Math.floor(Math.random() * 999999));
        if(!streamUrl){
            streamUrl = config.RTMP_SERVER+room_id+"_"+uuid;
        }
        // console.log("url===="+url);
        var l = confLib.YXV_ConfStartSend(confHandle,streamindex,streamUrl);
        // console.log("--------------l--------------=="+l);
        if(l != 0){
            result = {
                code:-1,
                type:"sendStream",
                msg:"视频推流失败"
            };
            webContents.send('video', result);
        }else{
            result = {
                code:0,
                type:"sendStream",
                msg:"视频推流成功",
                url:streamUrl,
                streamindex:streamindex,
            };
            // console.log("result----------"+result.url);
            webContents.send('video', result);
        }
        // console.log("l="+l+"----stmp:"+config.RTMP_SERVER+room_id+"_"+uuid);

    },

    setFlagAndMil:(win,flag,millisecond)=>{
        cusUtils.writeConffm(win,flag,millisecond);
        var webContents = win.webContents;
        webContents.send('onSetFlagAndMil', 'ok');
    },
    writeConffm:(win,flag,millisecond) =>{
        var data = JSON.parse(fs.readFileSync(_confPath + "/conf.json").toString());
        data['flag'] = parseInt(flag);
        data['millisecond'] = parseInt(millisecond);
        cusUtils.writeConf(win,data);
    },
    initPips:(ltwhArrays)=>{
        loger.info("initPips-------------------------:"+ltwhArrays);
        var scale = global.externalDisplay.scaleFactor;
        loger.info("scale:"+scale);
        var ltrb = '';
        var pips = Array();
        var ltrbInfo = Array();

        if (ltwhArrays.length > WIN_MAX_STREAMS * 4)
        {
            ltwhArrays.splice(WIN_MAX_STREAMS * 4, ltwhArrays.length - WIN_MAX_STREAMS * 4);
        }

        for (var i = 0; i < ltwhArrays.length; i+=4) {
            ltwhArrays[i+2] = Math.round(ltwhArrays[i+2]*scale);
            ltwhArrays[i+3] = Math.round(ltwhArrays[i+3]*scale);
            ltwhArrays[i] = Math.round(ltwhArrays[i]*scale);
            ltwhArrays[i+1] = Math.round(ltwhArrays[i+1]*scale);
        }

        ltrbInfo[0] = ltwhArrays[0];
        ltrbInfo[1] = ltwhArrays[1];
        ltrbInfo[2] = ltwhArrays[2];
        ltrbInfo[3] = ltwhArrays[3];
        for (var i = 0; i < 4; ++i)
        {
            ltrbInfo[i] = parseInt(ltrbInfo[i]);
        }

        for (var i = 0; i < ltwhArrays.length; i+=4) {
            var l = (ltwhArrays[i]);
            var t = (ltwhArrays[i+1]);
            if (i < 4) {
                l -= ltrbInfo[0];
                t -= ltrbInfo[1];
            }
            var r = ltwhArrays[i+2]+l;
            var b = ltwhArrays[i+3]+t;
            if(i == 0){
                ltrb += l+','+t+','+r+','+b;
            }else{
                ltrb += '('+l+','+t+','+r+','+b+')';
                pips.push(l+','+t+','+r+','+b);
            }
        }


        var pipJson = {
            ltrb : ltrb,
            pips : pips,
            ltrbInfo : ltrbInfo
        };
        return pipJson;
    },








}
module.exports = cusUtils;