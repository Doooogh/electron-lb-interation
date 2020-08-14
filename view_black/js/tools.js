let time_interval;
var Tools = {
/*  pip_vga_max:function(){
    Server.setPipAndSwitch(window.Electron.remote.getGlobal('lessonModel').classroom.classroomId,window.Electron.remote.getGlobal('token'),5,pipEdit,1,function(_result){});
  },*/
	pip_black_no:function(){
		Server.setPipAndSwitch(window.Electron.remote.getGlobal('lessonModel').classroom.classroomId,window.Electron.remote.getGlobal('token'),0,pipEdit,0,function(_result){});
	},
  pip_black_one:function(){
    Server.setPipAndSwitch(window.Electron.remote.getGlobal('lessonModel').classroom.classroomId,window.Electron.remote.getGlobal('token'),4,pipEdit,0,function(_result){});
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
  "items": [
    {
      "priority": 1,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
       "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 1,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    },
    {
      "priority": 0,
      "zoom": 1
    }
  ],
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


