$(function(){
	var conf = window.Electron.readConf();
/*	$("input:radio[value='"+conf.plan+"']").attr('checked','true');*/
	$('#autoOpen').prop("checked",conf.autoOpen);
	$('#rtmpDelay').val(conf.millisecond);
	 $(".close-btn").click(function(){
         currentWindow.close();
      });
})

function mysubmit(){
	var autoOpen_ischecked = $('#autoOpen').is(':checked');
	var delayMS = parseInt($('#rtmpDelay').val());
	if(autoOpen_ischecked){
		window.Electron.setAppStart();
	}else{
		window.Electron.cancelAppStart();
	}
/*	var plan = $("input[name='plan']:checked").val();
    window.Electron.writeConf(['plan'],[plan]);*/
	window.Electron.writeConf(['autoOpen','millisecond'],[autoOpen_ischecked, delayMS]);
	window.Electron.closeCurrWin();
}