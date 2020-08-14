jQuery("#hdkt_quit").click( function() { disconnect() });
var hdkt_cameras = new Array();
var hdkt_mics = new Array();
var hdkt_screen_share_constraint = {mandatory: {chromeMediaSource: 'screen', maxWidth: window.screen.width, maxHeight: window.screen.height, maxFrameRate: 30}};
var hdkt_audio_select = document.createElement("select");
var hdkt_video_select = document.createElement("select");
var hdkt_chat = true;
var hdkt_speaker = -1;
var hdkt_stager = -1;
var hdkt_player = -1;
var hdkt_record_status = false;
var isAndroid = -1;

var hdkt_public_share = ["images/function-0.jpg", "images/function-1.jpg", "images/function-2.jpg", "images/function-3.jpg", "images/function-4.jpg", "images/function-5.jpg", "images/function-6.jpg", "images/function-7.jpg"]
var hdkt_private_share_num = 0;
var hdkt_private_share = [["images/function.pdf"], ["images/sip.pdf"], ["images/peach.pdf"]];

var hdkt_whiteboard_height = 0;
var hdkt_whiteboard_width = 0;
function hdkt_layout() {
	// var bar_height = jQuery(".hdkt_bar").outerHeight(true);
	// var bottom_height = jQuery(".hdkt_bottom").height();
	// var total_height = jQuery("#hdkt_container").height();
	// var height = total_height - bar_height - bottom_height;
 //    hdkt_whiteboard_width = jQuery("#hdkt_whiteboard_public").width();
	// hdkt_whiteboard_height = height-25-25;
	// trace(_now(), "layout", total_height, height,hdkt_whiteboard_height);
	// jQuery(".hdkt_left").css("height", height);
	// jQuery(".hdkt_left_videos").css("height", height-0.5*height-6);
	// jQuery(".hdkt_middle").css("height", height);
	// jQuery(".hdkt_whiteboard").css("height", hdkt_whiteboard_height);
	// jQuery(".hdkt_right").css("height", height);
	// jQuery(".hdkt-dialog").css("height", height-6-67-jQuery(".hdkt_right_title").outerHeight());/* hdkt_right-hdkt_ringt.border*2_ask-hdkt_right_title */
	// jQuery(".hdkt_left").css("display", "block");
	// if(jQuery(".hdkt_whiteboard canvas").length===0)
	// 	jQuery(".hdkt_whiteboard").css("display", "block");
	// jQuery(".hdkt-dialog").css("display", "block");
}
/*jQuery(window).resize(function() {
	hdkt_layout();
});*/
jQuery("#hdkt_left_user").focus(function(){
	jQuery("#hdkt_left_user").css("boder-color", "rgb(185, 186, 188)");
	jQuery("#hdkt_left_user .hdkt_left_title").css("background-color", "rgb(185, 186, 188)");
});
jQuery("#hdkt_left_user").blur(function(){
	jQuery("#hdkt_left_user").css("boder-color", "rgb(219, 220, 221)");
 	jQuery("#hdkt_left_user .hdkt_left_title").css("background-color", "rgb(219, 220, 221)");
});
jQuery("#hdkt_left_videos").focus(function(){
	jQuery("#hdkt_left_videos").css("boder-color", "rgb(185, 186, 188)");
	jQuery("#hdkt_left_videos .hdkt_left_title").css("background-color", "rgb(185, 186, 188)");
});
jQuery("#hdkt_left_videos").blur(function(){
	jQuery("#hdkt_left_videos").css("boder-color", "rgb(219, 220, 221)");
 	jQuery("#hdkt_left_videos .hdkt_left_title").css("background-color", "rgb(219, 220, 221)");
});
jQuery("#hdkt_middle").focus(function(){
	jQuery("#hdkt_middle").css("background-color", "rgb(185, 186, 188)");
});
jQuery("#hdkt_middle").blur(function(){
 	jQuery("#hdkt_middle").css("background-color", "rgb(219, 220, 221)");
});
jQuery("#hdkt_right").focus(function(){
	jQuery("#hdkt_right").css("boder-color", "rgb(185, 186, 188)");
	jQuery("#hdkt_right .hdkt_right_title").css("background-color", "rgb(185, 186, 188)");
});
jQuery("#hdkt_right").blur(function(){
	jQuery("#hdkt_right").css("boder-color", "rgb(219, 220, 221)");
 	jQuery("#hdkt_right .hdkt_right_title").css("background-color", "rgb(219, 220, 221)");
});
jQuery(".hdkt_left_user").children(".hdkt_left_title").children("span").children("img").click(function() {
	fullScreen("hdkt_left_user");
});
jQuery(".hdkt_left_user").children(".hdkt_left_title").dblclick(function() {
	fullScreen("hdkt_left_user");
});
jQuery(".hdkt_left_videos").children(".hdkt_left_title").children("span").children("img").click(function() {
	fullScreen("hdkt_left_videos_content");
});
jQuery(".hdkt_left_videos").children(".hdkt_left_title").dblclick(function() {
	fullScreen("hdkt_left_videos_content");
}); 
jQuery(".hdkt_whiteboard_title").children("span").children("img").click(function() {
	fullScreen("hdkt_whiteboard_public");
});
jQuery(".hdkt_whiteboard_title").dblclick(function() {
	fullScreen("hdkt_whiteboard_public");
});
jQuery(".hdkt_right_title").children("span").children("img").click(function() {
	trace(_now(), "hdkt_right");
	fullScreen("hdkt_msgView");
});
jQuery(".hdkt_right_title").dblclick(function() {
	fullScreen("hdkt_msgView");
});

function fullScreen(id) {
	var el = document.getElementById(id);
	var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
	rfs.call(el);
}

jQuery(document).on("webkitfullscreenchange", function() {

});

function hdkt_shared_item(scope, sender, reader, subTitle, images, pageNo) {
	this.scope = scope;
	this.sender = sender;
	this.reader = reader;
	this.subTitle = subTitle;
	this.images = images;
	this.pageNo = pageNo;
    this.render = null;
}

var hdkt_mySharedItems = new Array();
function hdkt_preload(scope, urls, sender, reader, subTitle) {
	
	var hdkt_images = new Array(urls.length);
    if(urls.length!==1 && 0>urls[0].lastIndexOf(".pdf")) {
        for (i = 0; i < urls.length; i++) {
            hdkt_images[i] = new Image();
            hdkt_images[i].src = urls[i];
        }
    } else {
        trace("pdf");
        hdkt_images = urls;
    }
    hdkt_mySharedItems.push(new hdkt_shared_item(scope, sender, reader, subTitle, hdkt_images, 0));
    
    var htmlContent = '';
    for(var i=0;i<urls.length;i++){
    	htmlContent += ' <li onclick=\'changeCourseFile("'+urls[i]+'","my_ppt",'+i+')\'><a href="#">'+(i+1)+'.<img src="'+urls[i]+'" alt="" /></a></li>';
    }
    jQuery("#courseFile").html(htmlContent);
    $(".photofocus .focusbigimg li").css("width",($(".ppt").width()));
    if($(".photofocus")){
    	$(".photofocus").slide({ 
		mainCell:".focusmallimg",
		titCell:".focusmallimg li", 
		prevCell:".photofocus_btnl",
		nextCell:".photofocus_btnr",
		effect:"left",
		trigger:"click",
		vis:4,
		scroll:1});
		jQuery(".picScroll-top").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:false,effect:"top",vis:urls.length});
		$(".photofocus .photofocus_btnl").css("width",(0.5*$(".photofocus .photofocus_btnl").height()));
		$(".photofocus .photofocus_btnr").css("width",(0.5*$(".photofocus .photofocus_btnr").height()));
    }
    
	if(my_is_speaker)hdkt_turn_to_page_callback(0,urls[0]);
   	hdkt_turn_to_page(scope, sender, reader, 0, urls[0]);
}

jQuery( document ).ready(function() {
	var aboutChrome = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    isAndroid = navigator.userAgent.indexOf("Android");
    if(isAndroid>=0) {
        trace("you are using Android");
    }

	if(null===aboutChrome) {
		alert("请使用Chrome浏览器，或者使用具有Chrome内核的浏览器如360极速浏览器或者猎豹浏览器，并使用其极速模式。我们将尽快支持火狐浏览器和Opera浏览器。");
	} else if(parseInt(aboutChrome[2], 10) < 30) {
		alert('请将您的Chrome浏览器升级到版本M30以上。如果您使用的是具有Chrome内核的浏览器，请将其Chrome内核升级到版本M30以上。');
	} else if("undefined"===(typeof (navigator.webkitGetUserMedia||navigator.mozGetUserMedia))) {
		alert("您的浏览器内核经过修改，不支持WebRTC功能")
	} else {
		// MediaStreamTrack.getSources(hdkt_gotSources);
	}

})

function hdkt_gotSources(sourceInfos) {
	trace(_now(), sourceInfos);
	var audio_count = 0;
	var video_count = 0;
	
	hdkt_audio_select.disabled = false;
	hdkt_video_select.disabled = false;
}

function hdkt_initUserList() {
	var ths = "<th>身份</th><th>名字</th><th>媒体</th><th>权限</th>";
	if(my_is_moderator)
		ths += "<th class='hdkt_member_control'>控制</th>"
	jQuery(".hdkt_user_tb").append(ths);
}
function hdkt_initBar(type) {
	var publishControl;
		for(var i=0; i<hdkt_cameras.length; i++) {
			publishControl = jQuery("<button title='发布视频" + (i+1) + "' onclick=\"hdkt_publishVideo('" + "user" + "', " + i + ", '" + hdkt_cameras[i].id + "', '" + hdkt_cameras[i].lable + "')\" id='hdkt_publish" + i + "'><img src='images/action/camera_publish.png'/>" + (i+1) +"</button>");
			jQuery(".hdkt_bar_left").append(publishControl);
		}
		for(var j=hdkt_cameras.length; j<my_video_numbers-1; j++) {
			publishControl = jQuery("<button title='发布视频" + (j+1) + "' onclick=\"hdkt_publishVideo('" + "classroom" + "', " + j + ")\" id='hdkt_publish" + j + "'><img src='images/action/camera_publish.png'/>" + (j+1) +"</button>");
			jQuery(".hdkt_bar_left").append(publishControl);	
		}
	
	if(my_is_speaker) {
		

        jQuery(".hdkt_bar_left").append("<button title='打开文档' id='hdkt_share_doc'><img src='images/super_action/open_doc.png'/>&nbsp;</button>")
		jQuery("[id^='hdkt_share']").click( function(){
            requestPreload("public", null, ["images/physics.pdf"]);
		});

        jQuery(".hdkt_bar_left").append("<button title='打开公共画板' id='hdkt_open_public_whiteboard' ><img src='images/super_action/allow_draw.png' id='whiteboard_ctrl_icon'/>&nbsp;</button>");
        
		jQuery("#hdkt_open_public_whiteboard").click(function(){
            var public_id = "whiteboard_canvas_public_" + my_room;
            if(jQuery(this).children("img").attr("src")==="images/super_action/allow_draw.png"){
                whiteboard_global.loadWhiteboardPage("hdkt_whiteboard_public",public_id, "public");
                jQuery("#whiteboard_ctrl_icon").prop("src","images/super_action/forbid_draw.png");
                jQuery(this).prop("title", "关闭公共画板");
            }else{
                whiteboard_global.removeWhiteboard(public_id);
                jQuery("#whiteboard_ctrl_icon").prop("src","images/super_action/allow_draw.png");
                jQuery(this).prop("title", "打开公共画板");
            }
        });

	} else {
		var raiseHandControl = jQuery("<button title='举手' id='hdkt_raiseHand'><img src='images/action/raise_hand.png'/>&nbsp;</button>");
		raiseHandControl.click(function(){
            var myVideo = jQuery("[id^='videoDiv" + my_mid + "']");
            if(myVideo.length===0) {
                alert("请您至少先打开一路自己的视频，谢谢。");
                return;
            }
			requestRaiseHand();
		})
		jQuery(".hdkt_bar_left").append(raiseHandControl);
	}

	trace(_now(), "用户类别：" + ("user"===my_type?"用户":"教室") + " 用户名：" + my_name + " 主讲人：" + (my_is_speaker?"是":"否") + " 主持人：" + (my_is_moderator?"是":"否") + " 权限级别：" + my_authority_level + " 隐身：" + (my_is_invisible?"是":"否"));
}

function hdkt_turn_to_page(scope, sender, reader, page, url) {
	if(my_is_speaker == 'false'){
		hdkt_turn_to_page_callback(page);
	}
}

function hdkt_render_page(pageDiv, scope, sender, reader, pageCount, page) {
    pageDiv.empty();
    if (1 >= page) {
    } else {
        var previous = jQuery("<button>上一页</button>");
        previous.click(function () {
            if (my_is_speaker) {
                requestShare(scope, sender, reader, page - 1, "");
            }
            else
                hdkt_turn_to_page(scope, sender, reader, page - 1, "");
        });
        pageDiv.append(previous);
    }
    pageDiv.append("&nbsp;&nbsp;<span>第" + page + "页/共"+ pageCount +"页</span>&nbsp;&nbsp;")
    if(page<(pageCount-1)) {
        var next = jQuery("<button>下一页</button>");
        next.click( function() {
            if(my_is_speaker) {
                requestShare(scope, sender, reader, page+1, "");
            }
            else
                hdkt_turn_to_page(scope, sender, reader, page+1, "");
        });
        pageDiv.append(next);
    }
}

function hdkt_publishVideo(type, no, id, lable) {
	in_url(no, my_video_urls[no]);
}

function hdkt_publishAudio() {

}

function hdkt_getConstraint(video_no, audio_no) {
	var videoConstraint;
	if(video_no===hdkt_cameras.length) {
		videoConstraint = hdkt_screen_share_constraint;
		return {"video": videoConstraint};
	}
	else {
		videoConstraint = ("undefined"!== typeof video_no) ? {optional: [{sourceId:hdkt_cameras[video_no].id}, {"maxWidth": "1280"}, {"maxHeight": "720"}, {"maxFrameRate": "30"}]} : true;
		var audioConstraint = ("undefined"!== typeof audio_no) ? {optional: [{sourceId:hdkt_mics[audio_no].id}]} : true;
		return {"video": videoConstraint, "audio": audioConstraint}
	}
}

function hdkt_addUser(sn, type, name, video_numbers, is_moderator, video_status, is_speaker, authority_level, is_invisible) {
	if(is_invisible && my_authority_level<authority_level)
		return;
	if(is_speaker) {
		hdkt_speaker = sn;
		hdkt_player = sn;
	}
	var member = "<tr id='hdkt_member" + sn + "'" + (is_speaker?" class='hdkt_speaker'>":">");
	member += "<td id='hdkt_member_rank" + sn + "'>"
	if(is_moderator) {
		member += "<img title='级别" + authority_level +"' src='images/status/moderator.png'/>"
		if(is_speaker)
			member += "<img id='hdkt_speaker_img' title='主讲人' src='images/status/speaker.png'/>";
		member += "</td>";
	}
	else
		member += "&nbsp</td>"
	member += "<td title='" + sn + "'>" + name + (sn===my_mid?"（您）":"") + (is_invisible?"（隐身）":"") + "</td>";
	member += "<td>";
	for(var i=0; i<video_numbers; i++) {
		var video_status_img = video_status[i] < 0?"<img src='images/status/published.png' ":"<img src='images/status/unpublished.png' ";
		var _id = "hdkt_member_video" + sn + "_" + i;
		var videoId = "id='" + _id + "' ";
		var eventAndHandle = "";
		if(video_status[i]==-1)
			eventAndHandle = "onclick=\"hdkt_subscribeVideo(" + sn + ", " + i + ", false, 0, '" + (i<(video_numbers-1)?type:"user") + "', '" + name + "')\"";
		else if(my_is_moderator && my_authority_level>authority_level && video_status[i]==0) {
			eventAndHandle = "onclick='requireForceOpen(" + sn + ", " + i + ")' onmouseover=\"changeMandatoryStatus('" + _id + "', true)\" onmouseout=\"changeMandatoryStatus('" + _id + "', false)\"";
			trace(_now(), "mandatory");
		}
		else {
			trace(_now(), "authority flags: ", my_is_moderator, my_authority_level, authority_level, my_authority_level>authority_level, video_status[i]==0);
		}
		var videoTitle;
		if(i<video_numbers-1)
			videoTitle = "title='" + "视频" + (i+1) + "' ";
		else
			videoTitle = "title='" + "远程桌面' ";

		var video = video_status_img + videoId + videoTitle + eventAndHandle + "/>";
		member += video;
	}
	member += "</td>";
	member += "<td><img title='可打开摄像头' id='hdkt_video_sign" + sn + "' src='images/status/camera_allowed.png'/><img id='hdkt_chat_sign" + sn +"' title='可聊天' src='images/status/chat_allowed.png'/><img id='hdkt_audio_sign" + sn + "'title='未静音' src='images/status/unmuted.png'/>"
	if(my_is_moderator)
		member += "<td class='hdkt_member_control' id='hdkt_member_control" + sn + "'>";
	if(my_is_moderator && (my_authority_level>authority_level  || my_mid===sn)){
		if(!is_speaker && is_moderator) {
			var changeSpeaker = "<img id='hdkt_set_to_speaker" + sn + "' title='设为主讲人' src='images/super_action/set_to_speaker.png' onclick='requestChangeSpeaker(" + sn + ")'>";
			member += changeSpeaker;
		}
		if(my_mid!==sn) {
			var controlVideo = "<img title='禁止发布视频' src='images/super_action/forbit_camera.png' id='hdkt_video_control" + sn + "' onclick='request_control_video(false" + ", " + sn + ")'/>";
			var controlAudio = "<img title='静音' src='images/super_action/mute.png' id='hdkt_audio_control" + sn + "' onclick='request_control_audio(false" + ", " + sn + ")'/>";
			var controlChat = "<img title='禁止聊天' src='images/super_action/forbid_chat.png' id='hdkt_chat_control" + sn + "' onclick='request_control_chat(false" + ", " + sn + ")'/>";
			var onStage = "";
			var privateShare = "";
            var privateWhiteboard = "";
			if(my_is_speaker) {
				onStage = "<img title='上台' src='images/super_action/put_on_to_stage.png' id='hdkt_stage_control" + sn + "' onclick='request_on_stage(" + sn + ")'/>";
				privateShare = "<img title='打开文档' src='images/super_action/open_doc.png' id='hdkt_private_share" + sn + "'/>";
                privateWhiteboard = "<img title='打开私有画板' src='images/super_action/allow_draw.png' id='hdkt_private_whiteboard" + sn + "'/>";
			}
			member += controlVideo + controlAudio + controlChat + onStage + privateShare + privateWhiteboard;
		}
	}
	if(my_is_moderator)
		member += "</td>";
	
	trace(_now(), hdkt_private_share_num);
	jQuery(".hdkt_user_tb" ).append(member);
	jQuery("#hdkt_private_share" + sn).click(function() {
		requestPreload("private", sn, hdkt_private_share[hdkt_private_share_num]);
    });

    //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓for drawing↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    jQuery("#hdkt_private_whiteboard" + sn).click(function(){
        var private_id = "whiteboard_canvas_" + my_room + "_" + my_mid + "_" + sn;

        if(jQuery(this).attr("src") === "images/super_action/allow_draw.png"){
            jQuery(this).attr("src","images/super_action/forbid_draw.png");
            var container_id = "hdkt_whiteboard_" + my_mid + "_" + sn;
            whiteboard_global.loadWhiteboardPage(container_id, private_id, "private", "server");
        }else if(jQuery(this).attr("src") === "images/super_action/forbid_draw.png"){
            jQuery(this).attr("src","images/super_action/allow_draw.png");
            whiteboard_global.removeWhiteboard(private_id);
        }

    });
    //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑for drawing↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

	if(sn!=my_mid)
		jQuery("#hdkt_msgTo").append("<option value='" + sn + "'>" + name + "</option>");
}

function _addUser(authority_level,client_id,client_name,client_seq,client_sn,client_type,is_speaker,video_numbers,video_status){
	var html = "";
	html += '<li id="'+client_sn+'" uid="'+client_id+'"><div class="handup" ';
	if(my_is_speaker == 'true'){
		html +='onclick="request_on_stage('+client_sn+')"';
	}
	html +='></div><span class="name" onclick="document.getElementById(\'hdkt_msgInputBox\').value=\'@'+client_name+':\';hdkt_msgTo='+client_sn+'">'+client_name+'</span><font class="isOnsering" style="display:none;">正在发言</font>';
	for(var i=0; i<video_numbers; i++) {
		if(video_status[i]==-1){
			html += '<img class="huida" src="../img/imger/30.png" width="20" height="20" alt="" onclick="request_on_stage('+client_sn+')"/>';
			if(is_speaker){
				hdkt_subscribeVideo(client_sn,i,false,0,'',client_name);
			}
		}
	}
	html += '</li>';
	
	jQuery("#isJoin").append(html);
	jQuery("#"+client_id).hide();
	jQuery("#isJoinNum").html(Number(jQuery("#isJoinNum").html())+1);
	if(Number(jQuery("#noJoinNum").html()) > 0){
		jQuery("#noJoinNum").html(Number(jQuery("#noJoinNum").html())-1);
	}
}

function _deleteUser(client_sn){
	jQuery( "#" + client_sn ).remove();
	if(Number(jQuery("#isJoinNum").html()) > 0){
		jQuery("#isJoinNum").html(Number(jQuery("#isJoinNum").html())-1);
	}
	jQuery("#noJoinNum").html(Number(jQuery("#noJoinNum").html())+1);
	
}

function hdkt_subscribeVideo(sn, video_no, is_offer, is_direct, peer_type, peer_name) {
    requestVideoStream(sn, video_no, is_offer, is_direct);
}

function hdkt_deleteUser(sn) {
	jQuery( "#hdkt_member" + sn ).remove();
	jQuery( "[id^='videoDiv" + sn + "']" ).remove();
	jQuery("#hdkt_msgTo option[value='" + sn + "']").remove();

	if(my_is_speaker && jQuery("#hdkt_whiteboard_tab_" + hdkt_speaker + "_" + sn).hasClass("hdkt_on")) {
		jQuery("#hdkt_whiteboard_tab_public").show();
		jQuery("#hdkt_whiteboard_tab_public").addClass("hdkt_on");
		jQuery("#hdkt_whiteboard_public").show();
		jQuery("#hdkt_page_public").show();			
	}

	if(sn===hdkt_speaker) {
		jQuery("[id^='hdkt_whiteboard_tab_" + hdkt_speaker + "']").remove();
		jQuery("[id^='hdkt_whiteboard_" + hdkt_speaker + "']").remove();
		jQuery("[id^='hdkt_page_" + hdkt_speaker + "']").remove();
		jQuery("#hdkt_whiteboard_public").empty();
		jQuery("#hdkt_page_public").empty();
	}
	else {
		jQuery("#hdkt_whiteboard_tab_" + hdkt_speaker + "_" + sn).remove();
		jQuery("#hdkt_whiteboard_" + hdkt_speaker + "_" + sn).remove();
		jQuery("#hdkt_page_" + hdkt_speaker + "_" + sn).remove();
	}
}

function changeMandatoryStatus(id, flag) {
	var obj = jQuery("#" + id);
	var title = obj.prop("title");
	if(flag) {
		obj.css("cursor", "pointer");
		obj.prop("src", "images/super_action/force_to_publish.png");
		obj.prop("title", "强制打开" + title);
	}
	else {
		obj.css("cursor", "inherit");
		obj.prop("src", "images/status/unpublished.png");
		obj.prop("title", title.substring(4));
	}
}

function hdkt_subscribe_error_handle(publisher, video_no) {
	var sn = parseInt(publisher);
    var videoNo = parseInt(video_no);
	var peer = findRemotePeer(sn);
	var userName = "undefined"!==(typeof hdkt_getUserName(sn))?hdkt_getUserName(sn):"";
	alert("打开" + userName + "视频" + (videoNo+1) + "失败，请稍后再试或与管理员联系。");
	jQuery("#videoDiv" + publisher + "_" +video_no).remove();
	if(null!==peer.videos_in[videoNo]) {
		peer.videos_in[videoNo].close();
		peer.videos_in[videoNo] = null;
	}
	var video_control = jQuery("#hdkt_member_video" + publisher + "_" + video_no);
	video_control.prop("src", "images/status/published.png");
	video_control.removeClass("watched");
	video_control.addClass("watchable");

}

function hdkt_addVideo(sn, video_no, name, url) {	
	var isSpeakerVideo = false;
	for(var i = 0;i<peer_conn_list.length;i++){
		if(sn == peer_conn_list[i].client_sn && peer_conn_list[i].is_speaker){
			isSpeakerVideo = true;
			break;
		}
	}

	if(isSpeakerVideo){
		if(my_is_speaker == false || isClassroom == true){
			hookSpeakerWindow(sn,video_no,url);
		}
	}else {
		hookWindow(sn,video_no,url);
	}

	hdkt_addVideoNotify(sn, name, video_no, 1);
	// return video_new_tag;
}

function hdkt_addVideoNotify(sn, name, video_no, status) {
	var video_control = jQuery("#hdkt_member_video" + sn + "_" + video_no);
	switch (status) {
		case -1:
            if(sn===my_mid && (video_no<hdkt_cameras.length || video_no===my_video_numbers-1))
                break;
			var text = video_control.text(); trace(_now(), text);
			if(0===text.indexOf("强制打开"))
				video_control.text(text.substring(4));
			video_control.removeAttr("onclick").removeAttr("onmouseover").removeAttr("onmouseout");
			video_control.removeClass("unwatchable");
			video_control.removeAttr("style");
			video_control.addClass("watchable");
			video_control.prop("src", "images/status/published.png");
			video_control.click(function() {
                hdkt_subscribeVideo(sn, video_no, false, 0, "", name);
			})
			// if($("#"+sn).find('img').length==0){
			// 	$("#"+sn).append('<img class="huida" src="../img/imger/30.png" width="20" height="20" alt="" onclick="request_on_stage('+sn+')"/>');
			// }
			break;
		case 1:
			video_control.removeClass("watchable");
			video_control.addClass("watched");
			video_control.prop("src", "images/status/watched.png");
			break;
	}
}

function hdkt_closeVideo(publisher, video_no) {
    for (var i = 0; i < peer_conn_list.length; ++i)
    {
        var peer = peer_conn_list[i];
        if (peer.client_sn == publisher)
        {
            if (peer.videos_in[video_no] != null)
            {
                peer.videos_in[video_no].close();
                peer.videos_in[video_no] = null;
            }
            break;
        }
    }

    var videoDiv = jQuery("#videoDiv" + publisher + "_" + video_no);
    videoDiv.remove();
    var video_control = jQuery("#hdkt_member_video" + publisher + "_" + video_no);
    video_control.prop("src", "images/status/published.png");
    video_control.removeClass("watched");
    video_control.addClass("watchable");

	
}

function hdkt_raiseHandNotify(sn) {
	
	jQuery('#'+sn+" .handup").show();
	//过5秒自动隐藏举手图标
	setTimeout(function(){
		jQuery('#'+sn+" .handup").hide();
	},5000);
}

function hdkt_change_speaker(moderator, speaker) {
	var id = jQuery(".hdkt_speaker").attr("id");
	if("undefined" !== typeof id) {
		id = parseInt(id.substring(11));
		trace(_now(), id);
	}

	jQuery("#hdkt_speaker_img").remove();
	jQuery("#hdkt_member_rank" + speaker).append("<img id='hdkt_speaker_img' title='主讲人' src='images/status/speaker.png'/>");
	jQuery("#hdkt_member" + speaker).addClass("hdkt_speaker");
	jQuery("#hdkt_set_to_speaker" + speaker).remove();

	if("undefined" !== typeof id) {
		jQuery("#hdkt_member" + id).removeClass("hdkt_speaker");
		
		var authority_level = hdkt_getAuthorityLevel(id);
		if(my_is_moderator && (my_authority_level>authority_level || my_mid===id) && id!==speaker) {
			jQuery("#hdkt_member_control" + id).append("<img id='hdkt_set_to_speaker" + id + "' title='设为主讲人' src='images/super_action/set_to_speaker.png' onclick='requestChangeSpeaker(" + id + ")'>");
		}
	}
    if(my_mid===hdkt_speaker) {
        jQuery("#hdkt_share_doc").remove();
        jQuery("#hdkt_mix_start").remove();
        jQuery("#hdkt_record").remove();

        var raiseHandControl = jQuery("<button title='举手' id='hdkt_raiseHand'><img src='images/action/raise_hand.png'/>&nbsp;</button>");
        raiseHandControl.click(function(){
            requestRaiseHand();
        })
        jQuery(".hdkt_bar_left").append(raiseHandControl);

        jQuery("[id^='hdkt_stage_contro']").remove();
        jQuery("[id^='hdkt_private_share']").remove();
    }

    if(my_mid===speaker) {
        var recordControl = jQuery("<button title='录制' id='hdkt_record'><img src='images/super_action/record_green.png'/>&nbsp;</button>");
        recordControl.click(function() {
            requestRecord(true);
        })

        var mixControl = jQuery("<button title='视频混合' id='hdkt_mix_start'><img src='images/super_action/start_mix.png'/>&nbsp;</button>");
        mixControl.click(function() {
            var mode = 1;
            var max_bit_rate = 500000;
            requestStartMix(mode, window.screen.width, window.screen.height);
        });

        jQuery(".hdkt_bar_left").append("<button title='打开文档' id='hdkt_share_doc'><img src='images/super_action/open_doc.png'/>&nbsp;</button>");
        jQuery("[id^='hdkt_share']").click( function(){
            requestPreload("public", null, ["images/Lucene_Solr.pdf"]);
        });

        jQuery("#hdkt_raiseHand").remove();

        for(var i=0; i<peer_conn_list.length; i++) {
            var controls = jQuery("#hdkt_member_control" + peer_conn_list[i].client_sn);
            if(my_authority_level>peer_conn_list[i].authority_level) {
                var onStage = "<img title='上台' src='images/super_action/put_on_to_stage.png' id='hdkt_stage_control" + peer_conn_list[i].client_sn + "' onclick='request_on_stage(" + peer_conn_list[i].client_sn + ")'/>";
                onStage = jQuery(onStage);
                var privateShare = "<img title='打开文档' src='images/super_action/open_doc.png' id='hdkt_private_share" + peer_conn_list[i].client_sn + "'/>";
                privateShare = jQuery(privateShare);
                privateShare.click(function() {
                    requestPreload("private",  peer_conn_list[i].client_sn, hdkt_private_share[hdkt_private_share_num]);
                })
                controls.append(onStage).append(privateShare);
            }
        }
    }
    hdkt_speaker = speaker;
}

function hdkt_videoControl(moderator, publisher, allow) {
	if(my_mid === publisher) {
		if(0==allow) {
			var control = jQuery("[id^='hdkt_publish']");
			control.prop('disabled', true);
		}
		else if(1===allow) {
			var control = jQuery("[id^='hdkt_publish']");
			control.prop('disabled', false);
		}
	}
	var authority_level = hdkt_getAuthorityLevel(publisher);
	var sign = "<img title='" + (1===allow?"可打开摄像头":"不可打开摄像头") + "' id='hdkt_video_sign" + publisher + "' src='images/status/" + (1===allow?"camera_allowed":"camera_forbidden") + ".png'/>";
	jQuery("#hdkt_video_sign" + publisher).replaceWith(sign);
	var control = "";
	if(my_is_moderator && my_authority_level>authority_level) {
		var control = jQuery("#hdkt_video_control" + publisher);
		control.attr("title", 0===allow?"允许发布":"禁止发布");
		control.attr("src", 0===allow?"images/super_action/allow_camera.png":"images/super_action/forbit_camera.png");
		control.removeAttr("onclick");
		control.unbind();
		control.click(function () {
			request_control_video(0===allow?true:false, publisher);
		})
	}
}

function hdkt_audioControl(moderator, publisher, allow) {
	var video = jQuery("[id^='video_pc_display_" + publisher + "']");
	video.prop("muted", 1===allow?false:true);
	var authority_level = hdkt_getAuthorityLevel(publisher);
	var sign = "<img title='" + (1===allow?"未禁音":"禁音") + "' id='hdkt_audio_sign" + publisher + "' src='images/status/" + (1===allow?"unmuted":"muted") + ".png'/>";
	jQuery("#hdkt_audio_sign" + publisher).replaceWith(sign);
	if(my_is_moderator && my_authority_level>authority_level) {
		var control = jQuery("#hdkt_audio_control" + publisher);
		control.attr("title", 0===allow?"打开声音":"禁音");
		control.attr("src", 0===allow?"images/super_action/unmute.png":"images/super_action/mute.png");
		control.removeAttr("onclick");
		control.unbind();
		control.click(function () {
			request_control_audio(0===allow?true:false, publisher);
		})
	}
}

function hdkt_chatControl(moderator, publisher, allow) {
	var authority_level = hdkt_getAuthorityLevel(publisher);
	var sign = "<img title='" + (1===allow?"允许聊天":"禁止聊天") + "' id='hdkt_chat_sign" + publisher + "' src='images/status/" + (1===allow?"chat_allowed":"chat_forbidden") + ".png'/>";
	if(my_mid===publisher) {
		jQuery("#hdkt_msgInputBox").prop("disabled", 1===allow?false:true);
		jQuery("#hdkt_sendBtn").prop("disabled", 1===allow?false:true);
	}
	jQuery("#hdkt_chat_sign" + publisher).replaceWith(sign);
	if(my_is_moderator && my_authority_level>authority_level) {
		var control = jQuery("#hdkt_chat_control" + publisher);
		control.attr("title", 0===allow?"允许聊天":"禁止聊天");
		control.attr("src", 0===allow?"images/super_action/allow_chat.png":"images/super_action/forbid_chat.png");
		control.removeAttr("onclick");
		control.unbind();
		control.click(function () {
			request_control_chat(0===allow?true:false, publisher);
		})
	}
}

function hdkt_on_stage(sn, video_no) {
    /*jQuery('.answering').removeClass('answering');
    jQuery('.isOnsering').hide();
    jQuery('.huida').show();

    jQuery('#'+sn).addClass('answering');
    jQuery('#'+sn+' .isOnsering').show();
    jQuery('#'+sn+' .huida').hide();
    jQuery('#'+sn+' .handup').hide();

    jQuery('#isJoin li img').attr('src','../img/imger/30.png');
    jQuery('#'+sn+' img').attr('src','../img/imger/31.png');
    jQuery('.endupbutton').remove();
    jQuery('#'+sn).append('<span class="endupbutton" style="float: right;color:#333;" onclick="jQuery(\'.endupbutton\').remove();endHandup();">结束发言</span>');*/
	hdkt_subscribeVideo(sn, video_no, false, 0, "", "");
}

function hdkt_stageControl(moderator, publisher) {
	hdkt_on_stage(publisher,0);
}

function hdkt_recordNotify(is_start) {
    if(is_start===1) {
        hdkt_record_status = true;
        jQuery("#hdkt_record").children("img").prop("src", "images/super_action/record_red.png");
        jQuery("#hdkt_record").prop("title", "停止录制");
        jQuery(".hdkt_bar_left").append("<span id='hdkt_record_status_info'>&nbsp;&nbsp;&nbsp;&nbsp;录制中...</span>");
    } else {
        hdkt_record_status = false;
        jQuery("#hdkt_record").children("img").prop("src", "images/super_action/record_green.png");
        jQuery("#hdkt_record").prop("title", "录制");
        jQuery("#hdkt_record_status_info").remove();
    }
}

function hdkt_mixNotify(action) {
	if(action===1) {
		trace(_now(), hdkt_speaker);
		var subscribeMixControl = jQuery("<img id='hdkt_video_mix0'" + "src='images/status/published.png'/>");
		subscribeMixControl.click(function() {
			requestVideoStream(0, 0, false, 0, "", "视频混合");
		});
		jQuery("#hdkt_member" + hdkt_speaker).children().eq(2).append(subscribeMixControl);

		var startMixControl = jQuery("#hdkt_mix_start");
		var stopMixControl = jQuery("<button title='关闭视频混合' id='hdkt_mix_stop'><img src='images/super_action/stop_mix.png'/>&nbsp;</button>");
		stopMixControl.click(function() {
			requestStopMix();
		});
		startMixControl.replaceWith(stopMixControl);
	} else if(action===-1) {
		removePeer(0);
		var subscribeMixControl = jQuery("#hdkt_video_mix0");
		subscribeMixControl.remove();
		var stopMixControl = jQuery("#hdkt_mix_stop");
		var startMixControl = jQuery("<button title='打开视频混合' id='hdkt_mix_start'><img src='images/super_action/start_mix.png'/>&nbsp;</button>");
		startMixControl.click(function() {
			var mode = 1;
			var total_width = 1280;
			var total_height = 720;
			var max_bit_rate = 921600;
			requestStartMix(mode, total_width, total_height);
		});
		stopMixControl.replaceWith(startMixControl);
		jQuery("#videoDiv0_0").remove();
		trace("mix is stopped.");
	}
}

function hdkt_syncVideo(sn, video_no) {
    var video = jQuery("#videoDiv" + sn + "_" + video_no).children("video");
    if(video.length===0) {
        var peerName = hdkt_getUserName(sn);
        requestVideoStream(sn, video_no, false, 0, "user", peerName);
        video = jQuery("#videoDiv" + sn + "_" + video_no).children("video"); //todo
    }
    var c_video;
    var syncDiv = jQuery(".hdkt_sync");
    if(video.length===1) {
        syncDiv.empty();
        c_video= video.clone();
        syncDiv.append(c_video);
        c_video.height(jQuery(window).height());
        jQuery("#hdkt_container").fadeOut( "fast" );
        syncDiv.fadeIn("fast");
    }
    syncDiv.click(function() {
        jQuery("#hdkt_container").fadeIn( "fast" );
        syncDiv.fadeOut("fast");
        c_video.remove();
        syncDiv.empty();
    })
}

var hdkt_msgTo = "";
var hdkt_msgTo_name = "";
function hdkt_sendMsg() {
	
	var msgBOx = jQuery("#hdkt_msgInputBox");
	var text = msgBOx.val();
	if(text.indexOf('@') >=0 && text.indexOf(':') >= 0){
		hdkt_msgTo_name = text.substring(text.indexOf('@')+1,text.indexOf(':'));
		text = text.substring(text.indexOf(':')+1);
	}else{
		hdkt_msgTo = "";
		hdkt_msgTo_name = "";
	}

	var to = hdkt_msgTo;//jQuery("#hdkt_msgTo").val();
	
	if (msgBOx && msgBOx.length != 0) {
		if ( text == "") {
			alert("发送内容不能为空!");
			return;
		}
		try {
			if (to == "") {
				sendToPeer("chat_public", JSON.stringify({ "msg" : text }));
			} else {
				sendToPeer("chat_private", JSON.stringify({ "client_sn" : to, "msg" : text }));
			}
			hdkt_showMessage("我", text,null, hdkt_msgTo_name);
			msgBOx.val("");
		} catch (e) {
			alert(e.message);
		}
	}
}

function hdkt_messageHandle(from, msg, scope) {
	var to;
	if(scope=="public")
		to = "";
	else
		to = "我";
	var nickName = hdkt_getUserName(from);
	hdkt_showMessage(nickName, msg, from,to);
}

function hdkt_showMessage(nickName, msg, sn,toNickName) {
	var sendTo = nickName ;//+ " 发送给 " + toNickName;
	if(toNickName != "" && sn != null){
		jQuery("#hdkt_msgView").append('<li><span class="cred" onclick="document.getElementById(\'hdkt_msgInputBox\').value=\'@'+nickName+':\';hdkt_msgTo='+sn+'">'+sendTo+' 对 '+toNickName+'说：</span>'+msg+'<div class="time">'+(new Date()).Format("hh:mm:ss")+'</div></li>');
	}else if(toNickName != "" && sn == null){
		jQuery("#hdkt_msgView").append('<li><span class="cred" onclick="document.getElementById(\'hdkt_msgInputBox\').value=\'@'+nickName+':\';hdkt_msgTo='+sn+'">'+sendTo+' 对 '+toNickName+'说：</span>'+msg+'<div class="time">'+(new Date()).Format("hh:mm:ss")+'</div></li>');
	}else if(toNickName == "" && sn != null){
		jQuery("#hdkt_msgView").append('<li><span onclick="document.getElementById(\'hdkt_msgInputBox\').value=\'@'+nickName+':\';hdkt_msgTo='+sn+'">'+sendTo+' 说 ：</span>'+msg+'<div class="time">'+(new Date()).Format("hh:mm:ss")+'</div></li>');
	}else if(toNickName == "" && sn == null){
		jQuery("#hdkt_msgView").append('<li><span >'+sendTo+' 说：</span>'+msg+'<div class="time">'+(new Date()).Format("hh:mm:ss")+'</div></li>');
	}
	
	jQuery("#hdkt_msgView").scrollTop(jQuery("#hdkt_msgView").scrollTop() + jQuery("#hdkt_msgView").innerHeight());
}
	
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    	if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function hdkt_getAuthorityLevel(sn) {
	var n = peer_conn_list.length;
	var authority_level;
	for(var i=0; i<n; i++) {
		if(sn===peer_conn_list[i].client_sn) {
			authority_level = peer_conn_list[i].authority_level;
			return authority_level;
		}

	}
}

function hdkt_getUserName(sn) {
 	var n = peer_conn_list.length;
 	var clientName;
	for(var i=0; i<n; i++) {
		if(sn===peer_conn_list[i].client_sn) {
			clientName = peer_conn_list[i].client_name;
			break;
		}
	}
	return clientName;
}

function hdkt_tabs(id,cur,s){
	console.log(jQuery("#"+id).length);
	if (jQuery("#"+id).length){
		function closeContent(length){
			for(var i=0;i<length;i++){
				trace(jQuery(".hdkt_whiteboard:eq(" + i +")").prop("id"));
				jQuery(".hdkt_whiteboard:eq(" + i +")").hide();
				jQuery(".hdkt_page:eq(" + i +")").hide();
			}	
		}
		var length=jQuery("#"+id+"  "+s).length;
		 jQuery("#"+id+"  "+s).each(function(i){
			jQuery(this).click(function(){
				 jQuery("#"+id+"  "+s).removeClass(cur);   
				 closeContent(length);
				 jQuery(this).addClass(cur);
				 jQuery(".hdkt_whiteboard:eq(" + i +")").show();
				 jQuery(".hdkt_page:eq(" + i +")").show();

                //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓  for drawing  ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                var whiteboardId;
                if(i == 0){
                    whiteboardId = "whiteboard_canvas_public_" + whiteboard_global.whiteboard_roomId;
                }else{
                    var containerId = jQuery(".hdkt_whiteboard:eq(" + i + ")").attr("id");
                    whiteboardId = "whiteboard_canvas_" + my_room + "_" + containerId.replace("hdkt_whiteboard_","");
                }

                whiteboard_global.setDesinger(whiteboardId);
                if(whiteboard_global.whiteboardDesigner){
                    whiteboard_global.adjustWhiteboard(whiteboard_global.hdkt_whiteboard_width-140,whiteboard_global.hdkt_whiteboard_height);
                }
                //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑  for drawing  ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
			});
		});
	}//end length
}