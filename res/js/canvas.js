var drawingCxt;
var cvsHeight,cvsWidth;

var initCanvas;

var isDrawing = false;
var canvasTop = 0;

var lineMode = "any"; // "any", "straight","rect","circle","clear"

var lineWidth = 2;
var fontSise = 12;
var fillStyle = "#000000";
var strokeStyle = "#000000";


var currentPath = [];

var whiteboard = [];
//var paths = [];

var actions = [];
var new_actions = [];

var parentCommit = "root";
var commitHistory = ["root"];

var drawingDisabled = true;

var isSticky = true;

var stickyRadius = 20;

var coverLayer;
var coverCxt;
var currentDrawingId = "drawing";

var enableNodeExtensions = false;

const localServiceAddr = "http://127.0.0.1:9021";

var serverAddr = "http://192.168.2.107:6095";

function isInNode() {
    try {
        var fs = require("fs");
        if(!fs) return false;
    } catch(e) {
        return false;
    }
    return true;
}

function loadLocalConfig() {
    var fs = require("fs");
    var process = require("process");
    var path = require("path");

    var targetFile = path.dirname(process.execPath) + "/config.json";
    var cfgText = fs.readFileSync(targetFile);
    if(!cfgText) throw "配置文件加载失败。";

    var cfgData = JSON.parse(cfgText);

    if(cfgData.serverAddr) serverAddr = cfgData.serverAddr;
    if(cfgData.stickyRadius) stickyRadius = cfgData.stickyRadius;
    if(cfgData.lineWidth) lineWidth = cfgData.lineWidth;
}

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }  
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }  
}

function getQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r) return unescape(r[2]);
    else return null;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function randomNumeric() {
    var str = "";

    str += Math.floor(Math.random()*100000).toString();
    /*str += "_";
    str += Math.floor(Math.random()*100000).toString();
    str += "_";
    str += Math.floor(Math.random()*100000).toString();
    str += "_";
    str += Math.floor(Math.random()*100000).toString();
*/
    return str;
}

function showPopup(msg) {
    var coverLayer = document.createElement("div");
    coverLayer.className = "cover-layer";

    var msgBox = document.createElement("div");
    msgBox.className = "msg-box";
    msgBox.innerHTML = msg;

    var prevDrawingDisabled = drawingDisabled;

    drawingDisabled = true;

    $(msgBox).click(function() {
        document.body.removeChild(coverLayer);
        document.body.removeChild(msgBox);
        drawingDisabled = prevDrawingDisabled;
    });

    document.body.appendChild(coverLayer);
    document.body.appendChild(msgBox);

    $(msgBox).css("top", $(document).height() / 2 - $(msgBox).height() / 2);
    $(msgBox).css("left", $(document).width() / 2 - $(msgBox).width() / 2);
}

function clearCanvas() {

    // if(initCanvas){
    //     drawingCxt.putImageData(initCanvas.getContext("2d").getImageData(0,0,initCanvas.width,initCanvas.height),0,0);
    // }else{
        cvsHeight = document.getElementById(currentDrawingId).height;
        cvsWidth = document.getElementById(currentDrawingId).width;

        document.getElementById(currentDrawingId).width = 0;
        document.getElementById(currentDrawingId).height = 0;

        document.getElementById(currentDrawingId).width = cvsWidth;
        document.getElementById(currentDrawingId).height = cvsHeight;

        //drawingCxt.clearRect(0,0,cvsWidth,cvsHeight);

        //drawingCxt.fillStyle = "#333333";
        //drawingCxt.fillRect(0,0,cvsWidth,cvsHeight);

        drawingCxt.fillStyle = fillStyle;
        drawingCxt.strokeStyle = strokeStyle;

        drawingCxt.lineWidth = lineWidth;
    // }
    
   
    
}

function resetEverything(noLog) {
    if(!noLog) {
        addAction("reset","");
    }

    
    currentPath = [];
    clearCanvas();
    var paths = [];
    for(var i = 0;i<whiteboard.length;i++){
        if(!whiteboard[i]) continue;
        if(whiteboard[i].ppt_name == ppt_name && whiteboard[i].ppt_page ==ppt_page){
            paths = whiteboard[i].paths
            whiteboard[i].paths = [];
            break;
        }
    }
    var delIndex = [];
    for(var i in paths) {
       delIndex.push(paths[i].id);
    }
    for(var i = delIndex.length-1;i>=0;i--){
        delPath(ppt_name,ppt_page,delIndex[i]);
    }

    // paths = [];
}

function removePath(id) {
    paths[id] = null;
}

function renderAllPaths() {
    drawingCxt = document.getElementById(currentDrawingId).getContext("2d");
    drawingCxt.strokeStyle = "#FFFFFF";
    clearCanvas();
    var paths = [];
    var canvasWidth = document.getElementById(currentDrawingId).width;
    var canvasHeight = document.getElementById(currentDrawingId).height;
    for(var i = 0;i<whiteboard.length;i++){
        if(!whiteboard[i]) continue;
        if(whiteboard[i].ppt_name == ppt_name && whiteboard[i].ppt_page ==ppt_page){
            paths = whiteboard[i].paths
            break;
        }
    }

    
    for(var i in paths) {
        var currPath = paths[i];
        if(!currPath) continue;
        
        if(currPath.type) {
            var currType = currPath.type;
			var chooseColor = "red";
            var pathCanvasWidth = currPath.canvasWidth;
            var pathCanvasHeight = currPath.canvasHeight;
            if(currType == "circle") {
                var props = currPath.props;
                drawingCxt.save();
                drawingCxt.scale(canvasWidth/pathCanvasWidth,canvasHeight/pathCanvasHeight);
				drawingCxt.beginPath();
				drawingCxt.lineWidth = currPath.lineWidth;
				drawingCxt.fillStyle = currPath.fillStyle;
				drawingCxt.strokeStyle = currPath.strokeStyle;
                if(props.length != 3) continue;
                drawingCxt.moveTo(props[0] + props[2], props[1]);
                drawingCxt.arc(props[0], props[1], props[2], 0, Math.PI * 2);
                if (currPath.choose){
                    drawingCxt.fillStyle = chooseColor;
                    drawingCxt.strokeStyle = chooseColor;
                }
				drawingCxt.stroke();
                drawingCxt.restore();
            }else if(currType == "rect"){
                drawingCxt.save();
                drawingCxt.scale(canvasWidth/pathCanvasWidth,canvasHeight/pathCanvasHeight);
				var props = currPath.props;
				drawingCxt.lineWidth = currPath.lineWidth;
				drawingCxt.fillStyle = currPath.fillStyle;
				drawingCxt.strokeStyle = currPath.strokeStyle;
                if(props.length != 4) continue;
				drawingCxt.rect(props[0], props[1], props[2], props[3]);
                if (currPath.choose){
                    drawingCxt.fillStyle = chooseColor;
                    drawingCxt.strokeStyle = chooseColor;
                }
                drawingCxt.stroke();
                drawingCxt.restore();
			}else if(currType == "any"){
				var props = currPath.props;
                console.log('-------renderAllPaths-----')
                console.log(props)
                drawingCxt.save();
                drawingCxt.scale(canvasWidth/pathCanvasWidth,canvasHeight/pathCanvasHeight);
				drawingCxt.beginPath();
                if(props.length < 1) continue;
				drawingCxt.moveTo(props[0][0],props[0][1]);
				for(var j = 1; j < props.length; j++) {
					drawingCxt.lineTo(props[j][0],props[j][1]);
				}
				drawingCxt.lineWidth = currPath.lineWidth;
				drawingCxt.fillStyle = currPath.fillStyle;
				drawingCxt.strokeStyle = currPath.strokeStyle;
                if (currPath.choose){
                    drawingCxt.fillStyle = chooseColor;
                    drawingCxt.strokeStyle = chooseColor;
                }
				drawingCxt.stroke();
                drawingCxt.restore();
                console.log('-----renderAllPaths-----end---');
			}else if(currType == "text"){
                drawingCxt.save();
                drawingCxt.scale(canvasWidth/pathCanvasWidth,canvasHeight/pathCanvasHeight);
                var props = currPath.props;
                drawingCxt.fillStyle = currPath.fillStyle;
                drawingCxt.strokeStyle = currPath.strokeStyle;
                drawingCxt.font = currPath.font;
                if(props.length != 4) continue;
                if (currPath.choose){
                    drawingCxt.fillStyle = chooseColor;
                    drawingCxt.strokeStyle = chooseColor;
                }
                drawingCxt.fillText(currPath.value,props[0],props[1]);
                drawingCxt.restore();  
            }
            continue;
        }
       
    }
    console.log(paths);
}

function getActions() {
    return JSON.stringify(actions);
}

function loadActions(ats, noReset) {
    if(noReset) {
        for(var i in ats) {
            var currAction = ats[i];
            if(currAction.actionType == "cancel") {
                for(var j=0; j<actions.length; j++) {
                    if(actions[j].id == currAction.targetId) {
                        //console.log("Canceling action");
                        actions.splice(j,1);
                        break;
                    }
                }
                for(var j=0; j<ats.length; j++) {
                    if(ats[j].id == currAction.targetId) {
                        //console.log("Canceling action");
                        ats.splice(j,1);
                        break;
                    }
                }
                ats.splice(i,1);
            }
        }

        for(var id in ats) {
            actions.push(ats[id]);
        }
    } else {
        actions = ats;
    }

    paths = [];

    for(var i in actions) {
        var currAction = actions[i];
        console.log("Loading action "+currAction.id);
        switch(currAction.actionType) {
            case "new":
                switch(currAction.objectType) {
                    case "path":
                        paths.push(currAction.points);
                        break;
                    default:
                        console.log("Unknown object type "+currAction.objectType);
                }
                break;
            case "remove":
                switch(currAction.objectType) {
                    case "path":
                        removePath(currAction.pathId);
                        break;
                    default:
                        console.log("Unknown object type "+currAction.objectType);
                }
                break;
            case "reset":
                resetEverything(true);
                break;
            default:
                console.log("Unknown action type "+currAction.actionType);
        }
    }
    renderAllPaths();
}

function loadActionsFromServer(commitToken) {
    $.post(serverAddr+"/fetch",commitToken,function(resp) {
        if(resp == "Failed" || resp[0] != '[') return;

        /*var parts = resp.split("\n");
        actions = [];

        for(var i = parts.length-1; i >= 0; i--) loadActions(JSON.parse(parts[i]), true);*/

        loadActions(JSON.parse(resp));

        parentCommit = commitToken;
        commitHistory.push(commitToken);

        $("#last-commit-id").html(commitToken);
    });
}

function cancelStep() {
    if(actions.length == 0) return;
    cancelAction(actions[actions.length-1].id);
    clearCanvas();
    loadActions(actions);
}

function addAction(actionType, objectType, details) {
    var actionId = randomNumeric();

    var actionDetails = {
        "id": actionId,
        "actionType": actionType,
        "objectType": objectType
    }

    if(details) {
        for(key in details) {
            actionDetails[key] = details[key];
        }
    }

    if(actionType != "cancel") actions.push(actionDetails);

    new_actions.push(actionDetails);

    return actionId;
}

function cancelAction(actionId) {
    for(var i in actions) {
        if(actions[i].id == actionId) {
            actions.splice(i,1);
            addAction("cancel","action",{
                "targetId": actionId
            });
            return true;
        }
    }

    return false;
}

function commitActions(callback) {
    $("#last-commit-id").html("...");

    $.post(serverAddr+"/commit",JSON.stringify({
        "parentCommit": parentCommit,
        "actions": new_actions
    }),function(resp) {
        if(resp=="Failed" || resp.length != 8) {
            alert("提交失败。");
            return;
        }
        parentCommit = resp;
        commitHistory.push(resp);
        new_actions = [];
        $("#last-commit-id").html(resp);
        setCookie("AlphaBoard-Last-Commit-Id",resp,30);
        if(callback) callback(resp);
    })
}

function showCoverDiv(msg) {
    $("#cover-div").html(msg);
    $("#cover-div").css("line-height",$("#cover-div").css("height"));
    $("#cover-div").fadeIn();
    $("#cover-div").dblclick(function() {
        $("#cover-div").fadeOut();
        $("#cover-div").click(function() {});
    });
}

function commitAndShare() {
    commitActions(function(token) {
        showCoverDiv(window.location.href + "?load=" + token);
    });
}

var actionListShowed = false;

function toggleActionList() {
    if(!actionListShowed) {
        actionListShowed = true;
        drawingDisabled = true;
        updateActionList();
        $("#action-list").fadeIn();
        $("#cover-div").html("");
        $("#cover-div").fadeIn();
        $("#cover-div").click(toggleActionList);
    } else {
        actionListShowed = false;
        drawingDisabled = false;
        $("#cover-div").unbind("click");
        $("#action-list").fadeOut();
        $("#commit-list").fadeOut();
        $("#path-list").fadeOut();
        $("#cover-div").fadeOut();

        var pathPreviews = document.getElementsByClassName("path-preview");
        for(var id = 0; id < pathPreviews.length; id++) {
            console.log(pathPreviews[id]);
            if(pathPreviews[id]) document.body.removeChild(pathPreviews[id])
        };
    }
}

function cancelActionsInList() {
    var children = $("#action-list-content").children("tr");
    for(var i=0; i<children.length; i++) {
        if(children[i].isSelected) {
            cancelAction(children[i].actionId);
            break;
        }
    }
    updateActionList();
    loadActions(actions);
}

function updateActionList() {
    var actionList = document.getElementById("action-list-content");

    actionList.innerHTML = "";

    for(var id = actions.length - 1; id >= 0 && id >= actions.length - 10; id--) {
        var item = actions[id];
        var actionDesc = "";

        switch(item.actionType) {
            case "new":
                actionDesc = "新建";
                switch(item.objectType) {
                    case "path":
                        if(item.hasOwnProperty("desc")) actionDesc += item.desc;
                        else actionDesc += "路径";

                        if(!item.points.type) {
                            actionDesc += " 从 "+Math.floor(item.points[0][0])+","+Math.floor(item.points[0][1])
                                +" 到 "+Math.floor(item.points[item.points.length - 1][0])+","+Math.floor(item.points[item.points.length - 1][1]);
                        }
                        break;
                    default:
                        actionDesc += item.objectType;
                }
                break;
            case "remove":
                actionDesc = "移除";
                switch(item.objectType) {
                    case "path":
                        if(item.hasOwnProperty("desc")) actionDesc += item.desc;
                        else actionDesc += "路径";
                        break;
                    default:
                        actionDesc += item.objectType;
                }
                break;
            case "reset":
                actionDesc = "重置";
                break;
            default:
                actionDesc = item.actionType;
        }

        var newElement = document.createElement("tr");
        newElement.innerHTML = actionDesc;
        newElement.actionId = item.id;

        $(newElement).click(function(e) {
            if(e.target.isSelected) {
                $(e.target).css("background","none");
                $(e.target).css("color","#FFFFFF");
                e.target.isSelected = false;
            } else {
                $(e.target).css("background-color","#FFFFFF");
                $(e.target).css("color","#000000");
                e.target.isSelected = true;
            }
        });

        actionList.appendChild(newElement);
    }
}

function showCommitList() {
    updateCommitList();
    $("#action-list").fadeOut();
    $("#commit-list").fadeIn();
}

function removeSelectedPaths() {
    var items = document.getElementsByClassName("path-list-item");
    var pathList = document.getElementById("path-list-content");

    console.log(items);

    for(var id in items) {
        var item = items[id];
        console.log(item);
        if(item.isSelected) {
            addAction("remove","path",{
                "pathId": item.pathId
            });
            removePath(item.pathId);
            pathList.removeChild(item);
            if(item.previewCanvas) document.body.removeChild(item.previewCanvas);
        }
    }

    renderAllPaths();
}

function createPathPreview(path) {
    coverLayer = document.createElement("canvas");
    coverLayer.className = "path-preview";
    coverLayer.width = $(document).width();
    coverLayer.height = $(document).height() - 50;

    $(coverLayer).css("position","fixed");
    $(coverLayer).css("top","0px");
    $(coverLayer).css("bottom","50px");
    $(coverLayer).css("left","0px");
    $(coverLayer).css("right","0px");

    coverCxt = coverLayer.getContext("2d");
    coverCxt.fillStyle = fillStyle;
    coverCxt.strokeStyle = strokeStyle;

    coverCxt.lineWidth = lineWidth;

    coverCxt.moveTo(path[0][0], path[0][1]);

    for(var i=1; i<path.length; i++) {
        coverCxt.lineTo(path[i][0],path[i][1]);
    }

    coverCxt.stroke();

    document.body.appendChild(coverLayer);

    return coverLayer;
}

function updatePathList() {
    var pathList = document.getElementById("path-list-content");

    pathList.innerHTML = "";

    for(var id = paths.length - 1; id >= 0 && id >= paths.length - 15; id--) {
        var item = paths[id];
        if(!item) continue;

        var newElement = document.createElement("tr");
        newElement.pathId = id;
        newElement.className = "path-list-item";
        newElement.innerHTML = "路径 " + id.toString();

        if(item.hasOwnProperty("type")) newElement.innerHTML += " [" + item.type + "]";
        else newElement.innerHTML += " 共 "+item.length+" 个节点";

        $(newElement).click(function(e) {
            if(e.target.isSelected) {
                $(e.target).css("background","none");
                $(e.target).css("color","#FFFFFF");
                e.target.isSelected = false;
                if(e.target.previewCanvas) document.body.removeChild(e.target.previewCanvas);
            } else {
                $(e.target).css("background-color","#FFFFFF");
                $(e.target).css("color","#000000");
                e.target.isSelected = true;
                e.target.previewCanvas = createPathPreview(paths[e.target.pathId]);
            }
        });

        pathList.appendChild(newElement);
    }
}

function showPathList() {
    updatePathList();
    $("#action-list").fadeOut();
    $("#path-list").fadeIn();
}

function updateCommitList() {
    var commitList = document.getElementById("commit-list-content");
    commitList.innerHTML = "";
    for(var id = commitHistory.length - 1; id >= 0; id--) {
        var item = commitHistory[id];

        var newElement = document.createElement("tr");
        newElement.innerHTML = item;
        newElement.commitId = item;

        $(newElement).click(function(e) {
            if(e.target.isSelected) {
                $(e.target).css("background","none");
                $(e.target).css("color","#FFFFFF");
                e.target.isSelected = false;
            } else {
                $(e.target).css("background-color","#FFFFFF");
                $(e.target).css("color","#000000");
                e.target.isSelected = true;
            }
        });

        commitList.appendChild(newElement);
    }
}



function promptForLoadCommit() {
    var targetCommitId = prompt("输入要加载的提交 ID: ");
    if(targetCommitId) {
        console.log(targetCommitId);
        loadActionsFromServer(targetCommitId);
        renderAllPaths();
        toggleActionList();
    }
}

function switchFullScreen() {
    toggleFullScreen();
    onResize();
}

function showAboutInfo() {
    var aboutInfo = "AlphaBoard nightly-20161023\n\nCopyright &copy; 2016 Heyang Zhou.\nLicensed under LGPL v3.";
    if(!enableNodeExtensions) showPopup("<pre>"+aboutInfo+"</pre>");
    else {
        var request = require("request");
        request.get(localServiceAddr + "/version", function(err,resp,body) {
            if(!err) aboutInfo += "\nWith " + body;
            showPopup("<pre>"+aboutInfo+"</pre>");
        });
    }
}

function checkCloudStatus(targetElement) {
    $(targetElement).html("未知");
    $.get(serverAddr + "/ping", function(resp) {
        if(resp == "Pong") $(targetElement).html("正常");
        else $(targetElement).html("异常");
    });
}
function startCheckCloudStatus() {
    var targetElement = document.getElementById("cloud-status-text");

    checkCloudStatus(targetElement);

    setInterval(function() {
        checkCloudStatus(targetElement);
    },10000);
}

window.addEventListener("load",function() {
    if(isInNode()) {
        enableNodeExtensions = true;
        try {
            loadLocalConfig();
        } catch(e) {
            alert(e);
            window.close();
        }
        toggleFullScreen();
    }

    document.oncontextmenu = function() {
        return false;
    };
/*
    cvsWidth = $("#drawing").width();
    cvsHeight = $("#drawing").height();

    document.getElementById(currentDrawingId).width = cvsWidth;
    document.getElementById(currentDrawingId).height = cvsHeight;
*/
    drawingCxt = document.getElementById(currentDrawingId).getContext("2d");

    drawingCxt.strokeStyle = "#FFFFFF";

    clearCanvas();

    var initialCommit = getQueryString("load");
    if(!initialCommit) var initialCommit = getCookie("AlphaBoard-Last-Commit-Id");

    if(initialCommit) {
        loadActionsFromServer(initialCommit);
    }

    // startCheckResize();
    //startCheckCloudStatus();
});

var path_id;
var start_time;
function drawBegin(e) {
    if(drawingDisabled) return;


    var mouseJson = getMousePos(e);
    var targetX = mouseJson.x, targetY = mouseJson.y;

    if(targetX > cvsWidth || targetY > cvsHeight) return;

    isDrawing = true;

    var foundStickingTarget = false;

    var paths = [];
    for(var i = 0;i<whiteboard.length;i++){
        if(!whiteboard[i]) continue;
        if(whiteboard[i].ppt_name == ppt_name && whiteboard[i].ppt_page ==ppt_page){
            paths = whiteboard[i].paths
            break;
        }
    }

    currentPath.push([targetX, targetY]);

    coverLayer = document.createElement("canvas");
    coverLayer.width = $("#" + currentDrawingId).width();
    coverLayer.height =$("#" + currentDrawingId).height() ;

    $(coverLayer).css("position","absolute");//position: absolute
    var top = document.getElementById(currentDrawingId).offsetTop;
    var left = document.getElementById(currentDrawingId).offsetLeft; 
    $(coverLayer).css("top",top+"px");
    $(coverLayer).css("left",left+"px");
    // $(coverLayer).css("z-index",2);

    coverCxt = coverLayer.getContext("2d");
    coverCxt.fillStyle = fillStyle;
    coverCxt.strokeStyle = strokeStyle;

    coverCxt.moveTo(targetX, targetY);

    document.getElementById(currentDrawingId).parentElement.appendChild(coverLayer);

    path_id = randomNumeric();
    start_time = new Date();
    var targetPath = {
            "id":path_id
        };

    createPath(ppt_name,ppt_page,targetPath);
    //drawMove(e);
}

function divMousedown(e){
    currentDrawingId = $(".avr_canvas_div_class").find('.avr_canvas_class')[0].id;
    drawBegin(e);
}

/*$(".avr_canvas_div_class").mousedown(function (e) {
    currentDrawingId = $(this).find('.avr_canvas_class')[0].id;
    drawBegin(e);
});*/
if(getElementsByClassName('avr_canvas_div_class','*')[0]){
    getElementsByClassName('avr_canvas_div_class','*')[0].addEventListener("touchstart",function(e) {
    currentDrawingId = $(this).find('.avr_canvas_class')[0].id;
    drawBegin(e.touches[0]);
    })
}


function drawEnd(e) {
    if(drawingDisabled || !isDrawing) return;

    isDrawing = false;

    var origX = currentPath[currentPath.length - 1][0], origY = currentPath[currentPath.length - 1][1];

    var targetX = origX, targetY = origY;

    var foundStickingTarget = false;

    var paths = [];
    var path_index = 0;
   
    for(var i = 0;i<whiteboard.length;i++){
        if(!whiteboard[i]) continue;
        if(whiteboard[i].ppt_name == ppt_name && whiteboard[i].ppt_page ==ppt_page){
            paths = whiteboard[i].paths;
            path_index = i;
            break;
        }
    }


    coverCxt.lineTo(targetX, targetY);
    coverCxt.stroke();

    currentPath.push([targetX, targetY]);

    if(lineMode == "straight") {
        paths.push([currentPath[0],currentPath[currentPath.length - 1]]);
        addAction("new","path",{
            "desc": "直线",
            "points": [currentPath[0],currentPath[currentPath.length - 1]]
        });
    } else if(lineMode == "rect") {
        var startPt = currentPath[0];
        var endPt = currentPath[currentPath.length - 1];
		var left = startPt[0],top = startPt[1],width = endPt[0]-left,height = endPt[1]- top;
		var targetPath = {
			"id":path_id,
            "type": "rect",
			"lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "props": [left,top,width,height]
        };
        paths.push(targetPath);
        addAction("new","path",{
            "desc": "矩形",
            "points": targetPath
        });
        updatePath(ppt_name,ppt_page,targetPath);
    } else if(lineMode == "circle") {
        var centerPt = currentPath[0];
        var mouseJson = getMousePos(e);
        var x = mouseJson.x; // 鼠标落下时的X
        var y = mouseJson.y; // 鼠标落下时的Y
		var rx = (centerPt[0] - e.offsetX)/2;
        var ry = (centerPt[1] - e.offsetY)/2;
        var r = Math.sqrt(rx*rx+ry*ry);
		
        var targetPath = {
			"id":path_id,
            "type": "circle",		
			"lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "props": [rx+x, ry+y, r]
        };

        paths.push(targetPath);

        addAction("new","path",{
            "desc": "圆",
            "points": targetPath
        });
        updatePath(ppt_name,ppt_page,targetPath);
    } else if(lineMode == "any"){
        if (currentPath.length && currentPath.length == 2) /* only one point */
        {
            var arr1 = currentPath[0], arr2 = currentPath[1];
            if (arr1.length >= 2 && arr2.length >= 2 && arr1[0] == arr2[0] && arr1[1] == arr2[1])
            {
                arr2[0] = arr1[0]+lineWidth;
                arr2[1] = arr1[1]+lineWidth;
            }
        }
		var targetPath = {
			"id":path_id,
            "type": "any",		
			"lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "props": currentPath
        };
		paths.push(targetPath);
        addAction("new","path",{
			"desc":"任意线",
            "points": targetPath
        });
        updatePath(ppt_name,ppt_page,targetPath);
    }else if(lineMode == "text"){
        var startPt = currentPath[0];
        var endPt = currentPath[currentPath.length - 1];
        var left = startPt[0],top = startPt[1],width = endPt[0]-left,height = endPt[1]- top;
        var textAreaLeft = left + document.getElementById(currentDrawingId).offsetLeft
        document.getElementById("textDiv").innerHTML="<div id='textInput' contenteditable='true' style='font-size:"+fontSise+"px;color:"+fillStyle+";font-family:Arial;z-index:1;background-color:transparent;position:absolute;left:"+textAreaLeft+"px;top:"+top+"px;width:auto;min-width:"+width+";max-width:500px;min-height:"+height+"px;border:"+lineWidth+"px solid "+fillStyle+";display:inline-block;'></div>"; 
        document.getElementById("textInput").focus();
        document.getElementById('textInput').addEventListener('blur',function(e){
            // if(e.keyCode!=13) return;
            var font = fontSise+"px Arial";
            drawingCxt.font = font;
            drawingCxt.fillStyle = fillStyle;
            drawingCxt.fillText(this.innerText,left,top+fontSise);
            document.getElementById("textDiv").innerHTML = "";
            
            var targetPath = {
            "id":randomNumeric(),
            "type": "text",
            "lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "value":this.innerText,
            "font":font,
            "props": [left,top+fontSise,width,height]
            };
            paths.push(targetPath);
            addAction("new","path",{
                "desc":"文字",
                "points": targetPath
            });
            
           createPath(ppt_name,ppt_page,targetPath); 
              
            
        });
    }else if(lineMode == "choose") {
        var startPt = currentPath[0];
        var endPt = currentPath[currentPath.length - 1];
        var left = startPt[0],top = startPt[1],width = endPt[0]-left,height = endPt[1]- top;
        coverCxt.rect(left, top, width, height);
        for(var i in paths) {
            paths[i].choose = false;
        }
        //--------------选择图形start
        for(var i in paths) {
             var currPath = paths[i];
            if(!currPath) continue;
            if(currPath.type) {
                var currType = currPath.type;
                if(currType == "rect"){
                    var props = paths[i].props;
                    if(coverCxt.isPointInPath(props[0],props[1])){
                        paths[i].choose = true;
                        break;
                    }else if(coverCxt.isPointInPath(props[0],props[1]+props[3])){
                        paths[i].choose = true;
                        break;
                    }else if(coverCxt.isPointInPath(props[0]+props[2],props[1])){
                        paths[i].choose = true;
                        break;
                    }else if(coverCxt.isPointInPath(props[0]+props[2],props[1]+props[3])){
                        paths[i].choose = true;
                        break;
                    }
                }else if(currType == "circle"){
                    var props = paths[i].props;
                    if(coverCxt.isPointInPath(props[0],props[1])){
                        paths[i].choose = true;
                        break;
                    }
                }else if(currType == "text"){
                    var props = paths[i].props;
                    if(coverCxt.isPointInPath(props[0],props[1])){
                        paths[i].choose = true;
                        break;
                    }else if(coverCxt.isPointInPath(props[0],props[1]+props[3])){
                        paths[i].choose = true;
                        break;
                    }else if(coverCxt.isPointInPath(props[0]+props[2],props[1])){
                        paths[i].choose = true;
                        break;
                    }else if(coverCxt.isPointInPath(props[0]+props[2],props[1]+props[3])){
                        paths[i].choose = true;
                        break;
                    }
                }else{
                    var props = paths[i].props;
                    for(var j in props) {
                        if(coverCxt.isPointInPath(props[j][0],props[j][1])){
                            paths[i].choose = true;
                            break;
                        }
                    }
                }
            }
            
        }
        //--------------选择图形end
        //-----移除画板------start
        var remIndex = [];
        var delId = [];
        for(var i in paths) {
            if(paths[i].choose){
                remIndex.push(i);
                delId.push(paths[i].id);
            }
        }
        for(var i = delId.length-1;i>=0;i--){
            delPath(ppt_name,ppt_page,delId[i]);
            paths.splice(remIndex[i],1);
        }
        //-----移除画板------end

    } 

    if(enableNodeExtensions) {
        var target_paths_length = paths.length - 1;
        for(var i = 0; i < target_paths_length; i++) {
            var p = paths[i];
            if(!p.length || p.length > 5) continue;
            for(var j = 0; j < p.length - 1; j++) {
                var item = [p[j], p[j+1]];
                if(item[0][0] == item[1][0] && item[0][1] == item[1][1]) continue;
                (function() {
                    currentPath = paths[paths.length - 1];
                    for(var k = 0; k < currentPath.length - 1; k++) {
                        var lineA = [currentPath[k][0], currentPath[k][1], currentPath[k+1][0], currentPath[k+1][1]];
                        var lineB = [item[0][0], item[0][1], item[1][0], item[1][1]];
                        var reqJson = {
                            "lineA": lineA,
                            "lineB": lineB
                        };
                        var request = require("request");
                        request.post(localServiceAddr + "/algorithms/get_intersection", {
                            "form": JSON.stringify(reqJson)
                        }, function(err,resp,body) {
                            if(err || !body.length || body[0] != "[") {
                                return;
                            }

                            var respData = JSON.parse(body);

                            if(respData[0] < 0 || respData[1] < 0) return;

                            paths.push([respData, respData]);

                            addAction("new","path",{
                                "desc": "交点",
                                "points": [respData, respData]
                            });
                        });
                    }
                })();
            }
        }
    }

    currentPath = [];

    document.getElementById(currentDrawingId).parentElement.removeChild(coverLayer);

    coverLayer = null;
    coverCxt = null;
    //whiteboard[ppt_page].paths = paths;
    renderAllPaths();

    path_id = null;
}
function divMouseup(e){
    currentDrawingId = $(".avr_canvas_div_class").find('.avr_canvas_class')[0].id;
    drawEnd(e);
}

/*$(".avr_canvas_div_class").mouseup(function (e) {
    currentDrawingId = $(this).find('.avr_canvas_class')[0].id;
    drawEnd(e);
});*/
if(getElementsByClassName('avr_canvas_div_class','*')[0]){
    getElementsByClassName('avr_canvas_div_class','*')[0].addEventListener("touchend",function() {
        currentDrawingId = $(this).find('.avr_canvas_class')[0].id;
        drawEnd();
    });   
}


function drawMove(e) {
    if(drawingDisabled) return;

    if(!isDrawing) return;

    //e.preventDefault();
	
    coverCxt.fillStyle = fillStyle;
    coverCxt.lineWidth = lineWidth;
    coverCxt.strokeStyle = strokeStyle;

    var mouseJson = getMousePos(e);
    var targetX = mouseJson.x, targetY = mouseJson.y;

    var targetPath = {};
	if(lineMode == 'rect'){
		cvsHeight = document.getElementById(currentDrawingId).height;
		cvsWidth = document.getElementById(currentDrawingId).width;
		coverCxt.clearRect(0,0,cvsWidth,cvsHeight);
		renderAllPaths();
		coverCxt.strokeRect(currentPath[0][0], currentPath[0][1], targetX-currentPath[0][0], targetY-currentPath[0][1]);
        targetPath = {
            "id":path_id,
            "type": "rect",
            "lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "props": [currentPath[0][0], currentPath[0][1],targetX-currentPath[0][0],targetY-currentPath[0][1]]
        };
	}else if(lineMode == "circle"){
		cvsHeight = document.getElementById(currentDrawingId).height;
		cvsWidth = document.getElementById(currentDrawingId).width;
		coverCxt.clearRect(0,0,cvsWidth,cvsHeight);
		renderAllPaths();
		drawingCxt.beginPath();
        var x = targetX;//ffsetX; // 鼠标落下时的X
        var y =targetY//offsetY; // 鼠标落下时的Y
		var rx = (currentPath[0][0] - x)/2;
        var ry = (currentPath[0][1] - y)/2;
        var r = Math.sqrt(rx*rx+ry*ry);
		drawingCxt.arc(rx+x,ry+y,r,0,Math.PI*2);
		drawingCxt.stroke();
        targetPath = {
            "id":path_id,
            "type": "circle",       
            "lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "props": [rx+x, ry+y, r]
        };
        
	}else if(lineMode == 'choose'){
        cvsHeight = document.getElementById(currentDrawingId).height;
        cvsWidth = document.getElementById(currentDrawingId).width;
        coverCxt.clearRect(0,0,cvsWidth,cvsHeight);
        renderAllPaths();
        coverCxt.strokeRect(currentPath[0][0], currentPath[0][1], targetX-currentPath[0][0], targetY-currentPath[0][1]);
    }else if(lineMode == 'text'){
        cvsHeight = document.getElementById(currentDrawingId).height;
        cvsWidth = document.getElementById(currentDrawingId).width;
        coverCxt.clearRect(0,0,cvsWidth,cvsHeight);
        renderAllPaths();
        coverCxt.strokeRect(currentPath[0][0], currentPath[0][1], targetX-currentPath[0][0], targetY-currentPath[0][1]);
      
    }else{
        coverCxt.lineTo(targetX,targetY);
		coverCxt.stroke();
        targetPath = {
            "id":path_id,
            "type": "any",      
            "lineWidth": lineWidth,//画笔宽度
            "fillStyle": fillStyle,//颜色
            "strokeStyle": fillStyle,//颜色
            "canvasWidth" : document.getElementById(currentDrawingId).width,
            "canvasHeight" : document.getElementById(currentDrawingId).height,
            "props": currentPath
        };
       
	}


    var current_time = new Date();
    if(current_time.getTime()-start_time.getTime() >= 250){
       updatePath(ppt_name,ppt_page,targetPath); 
       start_time = current_time;
    }

    currentPath.push([targetX,targetY]);
}

function divMousemove(e){
    currentDrawingId = $(".avr_canvas_div_class").find('.avr_canvas_class')[0].id;
    drawMove(e);
}

function divMouseleave(e){
    currentDrawingId = $(".avr_canvas_div_class").find('.avr_canvas_class')[0].id;
    drawEnd(e);
}
/*$(".avr_canvas_div_class").mousemove(function (e) {
    currentDrawingId = $(this).find('.avr_canvas_class')[0].id;
    drawMove(e);
});
$(".avr_canvas_div_class").mouseleave(function (e) {
    drawEnd(e);
    
});*/
if(getElementsByClassName('avr_canvas_div_class','*')[0]){
   getElementsByClassName('avr_canvas_div_class','*')[0].addEventListener("touchmove",function(e) {
    currentDrawingId = $(this).find('.avr_canvas_class')[0].id;
    drawMove(e.touches[0]);
    }); 
}


function changeCanvas(){
    /*if($("#courseFile li").length == 0) {
        alert("请先打开课件！");
        return;
    }*/
    if(drawingDisabled){
        canvasIsOpened = true;
        // $(_this).text("关闭画板"); 
        drawingDisabled = false;
        //document.getElementById(currentDrawingId).style.zIndex = 0;
        //$(_this).css("background","#484849");
    }else{
        canvasIsOpened = false;
        // $(_this).text("打开画板"); 
        drawingDisabled = true;
        //document.getElementById(currentDrawingId).style.zIndex = -1;
       // $(_this).css("background","");
    }

    var xCreate = false;
    if(!drawingDisabled){
        for(var i = 0;i<whiteboard.length;i++){
            if(!whiteboard[i]) continue;
            if(whiteboard[i].ppt_name == ppt_name && whiteboard[i].ppt_page ==ppt_page){
                xCreate =true;
            }
        }
        if(!xCreate){
            createCanvas(ppt_name,ppt_page,true);
            xCreate =true;
        }
    }

}

function changeTools(_this){
    var display = document.getElementById("tools").style.display;
    if(display && display == 'none'){
        // $(_this).text("关闭工具栏"); 
        document.getElementById("tools").style.display = "";
        $(_this).css("background","#484849");
    }else{
        // $(_this).text("打开工具栏"); 
         document.getElementById("tools").style.display = "none";
         $(_this).css("background","");
    }
}

function createPath(ppt_name,ppt_page,targetPath){

     if (my_mid == -1) {
            alert("Not connected");
            return;
        }
        var data = {
                sub_action:"createPath",
                ppt_name:ppt_name,
                ppt_page:ppt_page,
                content:targetPath
            };
        
        var r = new XMLHttpRequest();
        r.onreadystatechange = function() {
            sendCanvasCallback(r);
        }
        r.open("POST", server + "/canvas?room_id=" + my_room + "&client_sn=" + my_mid, true);
        r.send(JSON.stringify(data));
}

function updatePath(ppt_name,ppt_page,targetPath){
     if (my_mid == -1) {
            alert("Not connected");
            return;
        }
        var data = {
                sub_action:"updatePath",
                ppt_name:ppt_name,
                ppt_page:ppt_page,
                content:targetPath
            };
        
        var r = new XMLHttpRequest();
        r.onreadystatechange = function() {
            sendCanvasCallback(r);
        }
        r.open("POST", server + "/canvas?room_id=" + my_room + "&client_sn=" + my_mid, true);
        r.send(JSON.stringify(data));
}

function delPath(ppt_name,ppt_page,id){
    
     if (my_mid == -1) {
            alert("Not connected");
            return;
        }
        var data = {
                sub_action:"delPath",
                ppt_name:ppt_name,
                ppt_page:ppt_page,
                content:{
                    id: id
                }
            };
        
        var r = new XMLHttpRequest();
        r.onreadystatechange = function() {
            sendCanvasCallback(r);
        }
        r.open("POST", server + "/canvas?room_id=" + my_room + "&client_sn=" + my_mid, true);
        r.send(JSON.stringify(data));
}


function createCanvas(ppt_name,ppt_page,sendout) {
    if (my_mid == -1) {
        alert("Not connected");
        return;
    }
    var data;
    if (!data){
        data = {
            sub_action:"create",
            ppt_name:ppt_name,
            ppt_page:ppt_page,
            paths:new Array(),
            canvas:{
                canvasWidth: $("#" + currentDrawingId).width(),
                canvasHeight: $("#" + currentDrawingId).height()
            }
        };
    }

    whiteboard[whiteboard.length] = data;
    
    if (sendout)
    {
        var r = new XMLHttpRequest();
        r.onreadystatechange = function() {
            sendCanvasCallback(r);
        }
        r.open("POST", server + "/canvas?room_id=" + my_room + "&client_sn=" + my_mid, true);
        r.send(JSON.stringify(data));
    }
}

function deleteCanvas() {
    if (my_mid == -1) {
        alert("Not connected");
        return;
    }

    if (ppt_name != null) {
        var index = -1;
        for (var i = 0; i < whiteboard.length; ++i) {
            if (whiteboard[i].ppt_name == ppt_name && whiteboard[i].ppt_page == ppt_page) {   
                    var data = {
                    sub_action:"destroy",
                    ppt_name:ppt_name,
                    ppt_page:ppt_page, 
                    canvas:"{}"
                };         
                var r = new XMLHttpRequest();
                r.onreadystatechange = function() {
                    sendCanvasCallback(r);
                }
                r.open("POST", server + "/canvas?room_id=" + my_room + "&client_sn=" + my_mid, true);
                r.send(JSON.stringify(data));

                whiteboard.splice(i, 1);
                break;
            }
        }

        ppt_name = null;
        ppt_page = 0;
        renderAllPaths();
    }
}

function sendCanvasCallback(r) {
    try {
        if (r.readyState != 4) return;
        //if (r.code == 0) { 
        //    var r = JSON.parse(r.responseText);
        //    trace(_now(), r);
            
        //} else {
        //    trace(_now(), "Invalid http status: " + r.status + "[" + r.statusText + "]");
        //}
    } catch (e) {
       // trace(_now(), e);
    }
}

function getMousePos(event) {
   var e = event || window.event;
   var scrollX = /* document.getElementById("content").scrollLeft || */ document.body.scrollLeft;
   var scrollY = /* document.getElementById("content").scrollTop || */ document.body.scrollTop;
   var top = $('#'+currentDrawingId).offset().top;//document.getElementById(currentDrawingId).offsetTop;
   var left = $('#'+currentDrawingId).offset().left;//document.getElementById(currentDrawingId).offsetLeft;
   var x = e.clientX + scrollX - left ;
   var y = e.clientY + scrollY - top;// - canvasTop; /* 45: TITLE BAR HEIGHT */
   return { 'x': x, 'y': y };
}

/*
* clsName:给定类名
* tagName：给定的HTML元素，如果为任意 tagName='*'
* ClassElements：返回值
*/
function getElementsByClassName(clsName, tagName) {
    var ClassElements = [];
    selElements = document.getElementsByTagName(tagName);
 
    for (var i = 0; i < selElements.length; i++) {
        if (selElements[i].className == clsName) {
            ClassElements[ClassElements.length] = selElements[i];
        }
    }
    return ClassElements;
}
