let time_interval;
var passageway;
var items;
var plan = window.Electron.readConf().plan;
var claId = "";
var hdType = window.Electron.readConf().hdType;
if(hdType=="inner"){
    claId = remote.getGlobal('in_clientId');
  }else{
    claId = remote.getGlobal('lessonModel').classroom.classroomId;
  }
var planB = new Array({"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1});//白板
var planA = new Array({"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1});//黑板

if(plan=="a"){//白板
items = new Array({"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1});
  
  passageway = 5;

}else{//黑板
  items = new Array({"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 1, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1},
                  {"priority": 0, "zoom": 1});
  passageway = 4;
}

var Tools = {
	pip_vga_max:function(){
    if(plan=="a"){//白板
      pipEdit.items = planA;
    }else{  //黑板
      pipEdit.items = planB;
    }

		Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit,1,function(_result){});
	},
	pip_vga_min:function(){
    if(plan=="a"){//白板
      pipEdit.items = planA;
    }else{  //黑板
      pipEdit.items = planB;
    }
		Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit,1,function(_result){});
	},
	pip_vga_no:function(){
    if(plan=="a"){//白板
      pipEdit.items = planA;
    }else{  //黑板
      pipEdit.items = planB;
    }
		Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit,0,function(_result){});
	},
  pip_vga_one:function(){
    if(plan=="a"){//白板
      pipEdit.items = planA;
    }else{  //黑板
      pipEdit.items = planB;
    }
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit,0,function(_result){});
  },
  student_pip_vga_max:function(){
    if(plan=="a"){//白板
      pipEdit_student.items = planA;
    }else{  //黑板
      pipEdit_student.items = planB;
    }
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit_student,1,function(_result){});
  },
  student_pip_vga_min:function(){
    if(plan=="a"){//白板
      pipEdit_student.items = planA;
    }else{  //黑板
      pipEdit_student.items = planB;
    }    
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit_student,1,function(_result){});
  },
  student_pip_vga_stu_max:function(){
    if(plan=="a"){//白板
      pipEdit_student_max.items = planA;
    }else{  //黑板
      pipEdit_student_max.items = planB;
    } 
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit_student_max,1,function(_result){});
  },
  student_pip_vga_stu_min:function(){
    if(plan=="a"){//白板
      pipEdit_student_max.items = planA;
    }else{  //黑板
      pipEdit_student_max.items = planB;
    } 
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit_student_max,1,function(_result){});
  },
  student_2_1_pip_vga_max:function(){
    if(plan=="a"){//白板
      pipEdit_student_2_1.items = planA;
    }else{  //黑板
      pipEdit_student_2_1.items = planB;
    }     
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit_student_2_1,1,function(_result){});
  },
  student_2_1_pip_vga_min:function(){
    if(plan=="a"){//白板
      pipEdit_student_2_1.items = planA;
    }else{  //黑板
      pipEdit_student_2_1.items = planB;
    }     
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit_student_2_1,1,function(_result){});
  },
  student_2_1_pip_vga_stu_max:function(){
    if(plan=="a"){//白板
      pipEdit_student_2_1_max.items = planA;
    }else{  //黑板
      pipEdit_student_2_1_max.items = planB;
    } 
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit_student_2_1_max,1,function(_result){});
  },
  student_2_1_pip_vga_stu_min:function(){
    if(plan=="a"){//白板
      pipEdit_student_2_1_max.items = planA;
    }else{  //黑板
      pipEdit_student_2_1_max.items = planB;
    }     
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit_student_2_1_max,1,function(_result){});
  },
  student_3_1_pip_vga_max:function(){
    if(plan=="a"){//白板
      pipEdit_student_3_1.items = planA;
    }else{  //黑板
      pipEdit_student_3_1.items = planB;
    }     
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit_student_3_1,1,function(_result){});
  },
  student_3_1_pip_vga_min:function(){
    if(plan=="a"){//白板
      pipEdit_student_3_1.items = planA;
    }else{  //黑板
      pipEdit_student_3_1.items = planB;
    }     
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit_student_3_1,1,function(_result){});
  },
  student_3_1_pip_vga_stu_max:function(){
    if(plan=="a"){//白板
      pipEdit_student_3_1_max.items = planA;
    }else{  //黑板
      pipEdit_student_3_1_max.items = planB;
    }      
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),passageway,pipEdit_student_3_1_max,1,function(_result){});
  },
  student_3_1_pip_vga_stu_min:function(){
    if(plan=="a"){//白板
      pipEdit_student_3_1_max.items = planA;
    }else{  //黑板
      pipEdit_student_3_1_max.items = planB;
    }     
    Server.setPipAndSwitch(claId,window.Electron.remote.getGlobal('token'),0,pipEdit_student_3_1_max,1,function(_result){});
  },
  setLiveTime:function(_id,_startTime){
    clearInterval(time_interval);
    var starttime = new Date(_startTime);
    time_interval = setInterval(function () {
      var nowtime = new Date();
      var time = nowtime - starttime;
      var hour = parseInt(time / 1000 / 60 / 60 % 24) < 10 ? '0'+ parseInt(time / 1000 / 60 / 60 % 24) : parseInt(time / 1000 / 60 / 60 % 24);
      var minute = parseInt(time / 1000 / 60 % 60) <10 ? '0'+ parseInt(time / 1000 / 60 % 60) : parseInt(time / 1000 / 60 % 60);
      var seconds = parseInt(time / 1000 % 60) <10 ? '0'+parseInt(time / 1000 % 60):parseInt(time / 1000 % 60);
      $('#'+_id).html(hour + ":" + minute + ":" + seconds );
    }, 1000)
  },
  ptz:{
      "action": "",
      "camera": 0,
      "x": 0.5,
      "y": 0.2,
      "z": 0.1,
      "speed": 10,
      "speed2": 10,
      "preset": 255
  }
}

var pipEdit = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items": items,
  "positions": [
    {
      "x": 0,
      "y": 0,
      "w": 1,
      "h": 1,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.70,
      "y": 0.70,
      "w": 0.2999999,
      "h": 0.2999999,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}

var student_x = 0.64,student_y = 0.52,student_w = 0.35,student_h = 0.35;
var pipEdit_student = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items": items,
  "positions": [
    {
      "x": 0,
      "y": 0.19,
      "w": 0.62,
      "h": 0.62,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.64,
      "y": 0.1,
      "w": 0.35,
      "h": 0.35,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}

var student_2_1_x = 0.68,student_2_1_y = 0.52,student_2_1_w = 0.32,student_2_1_h = 0.32;
var pipEdit_student_2_1 = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items":items,
  "positions": [
    {
      "x": 0,
      "y": 0.17,
      "w": 0.66,
      "h": 0.66,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.68,
      "y": 0.115,
      "w": 0.32,
      "h": 0.32,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}


var student_3_1_x = 0.74,student_3_1_y = 0.52,student_3_1_w = 0.25,student_3_1_h = 0.25;
var pipEdit_student_3_1 = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items":items ,
  "positions": [
    {
      "x": 0,
      "y": 0.14,
      "w": 0.73,
      "h": 0.73,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.74,
      "y": 0.2,
      "w": 0.25,
      "h": 0.25,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}



//------------------

var student_max_x = 0,student_max_y = 0,student_max_w = 0.62,student_max_h = 1;
var pipEdit_student_max = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items":items,
  "positions": [
    {
      "x": 0.64,
      "y": 0.515,
      "w": 0.35,
      "h": 0.35,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.64,
      "y": 0.1,
      "w": 0.35,
      "h": 0.35,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}

var student_2_1_max_x = 0,student_2_1_max_y = 0,student_2_1_max_w = 0.66,student_2_1_max_h = 1;
var pipEdit_student_2_1_max = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items":items,
  "positions": [
    {
      "x": 0.68,
      "y": 0.115,
      "w": 0.32,
      "h": 0.32,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.68,
      "y": 0.515,
      "w": 0.32,
      "h": 0.32,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}


var student_3_1_max_x = 0,student_3_1_max_y = 0,student_3_1_max_w = 0.73,student_3_1_max_h = 1;
var pipEdit_student_3_1_max = {
  "ixTemplate": 5,
  "isChannel": 1,
  "items":items,
  "positions": [
    {
      "x": 0.74,
      "y": 0.515,
      "w": 0.25,
      "h": 0.25,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    },
    {
      "x": 0.74,
      "y": 0.2,
      "w": 0.25,
      "h": 0.25,
      "xInRatio": 1,
      "yInRatio": 1,
      "wInRatio": 1,
      "hInRatio": 1
    }
  ]
}

