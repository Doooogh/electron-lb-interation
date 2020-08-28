
var config = {
//--------------正式--------------
 /* HOST:'a.easyhao.com',
  PORT:'8210',
  NGINX_SERVER:'http://a.easyhao.com:8083',
  MCU_SERVER: 'http://a.easyhao.com:8082',
  RTMP_SERVER:'rtmp://a.easyhao.com/mp4/',*/
  MCU_SERVER:'/ierp/api/mcu',
  USER_INFO:'/ierp/api/edu/user/getUserById',
  USER_LOGIN:'/ierp/api/hdlive/login',
  FIND_LESSON:'/ierp/api/hdlive/findLesson',
  LESSON_INFO:'/ierp/api/hdlesson/findLesson',
  CLASSROOM_INFO:'/ierp/api/hdclassroom/getClassroom',
  LESSON_UPLOAD:'/ierp/api/hdlesson/uploadResource',
  START_AVCONF:'/ierp/api/hdlive/startAVConf',
  STOP_AVCONF:'/ierp/api/hdlive/stopAVConf',
  WAIT_DEVICE_DATA:'/ierp/api/hdlive/waitDeviceData',
  SET_PIP_AND_SWITCH:'/ierp/api/hdlive/setPipAndSwitch',
  FILE_UPLOAD:'/ierp/api/hdlesson/fileUpload',
  BASE_CONF_PATH:'Documents\\Easyhao\\interation',
  ISPRINTSCREEN:'/ierp/api/behavioural/isPrintscreen',
  ANALYZE:'/ierp/api/behavioural/analyze',
  SITE_CONFIG_INFO_ADDR:'http://a.easyhao.com:7000/site',
  about:{
    title:'互动3.0',
    pcV:'3.0.609',
    copyright:'新晨易捷（北京）科技有限公司',
    phone:'400-107-0166',
    mail:'support@easyhao.com',
    net:'www.easyhao.com'
  },
  info:{
    Programming:['Qiushi, Yuan','Shubing, Wu','Yashuan, Yang','Xu, Zhao','Jianxiang,gao'],
    Artwork:'Ronghui, Liu',
    Documentation:['Qiushi, Yuan','Ronghui, Liu']
  }
}

module.exports = config
