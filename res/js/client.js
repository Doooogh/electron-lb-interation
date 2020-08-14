	var request = null,handRequest = null;
	var isNeedConnect = false;
	var connectInterval;
	var server = window.Electron.remote.getGlobal('mcu');
	var wait_server = window.Electron.remote.getGlobal('nginx')+'/mcu';
	//var server = "http://"+window.Electron.remote.getGlobal('host')+":"+window.Electron.remote.getGlobal('port')+window.Electron.config.MCU_SERVER;
	if(window.Electron.remote.getGlobal('hdType')=="inner"){
		server = window.Electron.remote.getGlobal('mcu');
	}
	var my_is_moderator = false, my_is_speaker = false, my_authority_level = 0, my_is_invisible = false; my_video_numbers = 0;
	var message_counter = 0;
	let mcu_token;
	let is_send_url = false;
	let isClassroom = false;
	let contentWidth ;
	let contentHeight ;
	let isRec = false;
	let uploadding = false;

	var fayanren,zhujianren;
	
	var configuration = { iceServers: [] };
	var local_stream;
	
	var peer_conn_list = new Array();

	var videoList = new Array();
	var courseStartTime;
	let allVideos = new Array();

	let classroomId;
	let recStatus;
		
	var isCreate = false;
	var ppt_name = "my_ppt";
	var ppt_page = 0;

	var closeHandTime =new Date();
	

	function findRemotePeer(peer_mid)
	{
		for (var i = 0; i < peer_conn_list.length; ++i)
		{
			var peer = peer_conn_list[i];
			if (peer.client_sn == peer_mid)
			{
				return peer;
			}
		}
		
		return null;
	}

	function requestVideoStream(peer_mid, video_no)
	{
		var peer = findRemotePeer(peer_mid);
		if (peer == null)
		{

			trace(_now(), "Peer" + peer_mid + " not exist!");
			window.Electron.log("client-js","Peer" + peer_mid + " not exist!");
			return;
		}
		
		var vStatus = peer.video_status[video_no];
		if (vStatus == -1)
		{
			sendToPeer("subscribe_video", JSON.stringify({ "publisher": peer_mid, "video_no" : video_no }));
			return null;
		}
		else
		{
			trace(_now(), "Peer" + peer_mid + " video " + video_no + " not exist!");	
			window.Electron.log("client-js","Peer" + peer_mid + " video " + video_no + " not exist!");		
		}
	}
	
	function closeVideo(peer, isIn, ix)
	{
		if (isIn)
		{
			if (peer.videos_out[ix] != null)
			{
				peer.videos_out[ix].close();
				peer.videos_out[ix] = null;
			}
		}
		else
		{
			if (peer.videos_in[ix] != null)
			{
				peer.videos_in[ix].close();
				peer.videos_in[ix] = null;
			}
		}
	}
	
	function clearPeers()
	{
		for (var i = 0; i < peer_conn_list.length; ++i)
		{
			var peer = peer_conn_list[i];
			for (var j = 0; j < peer.videos_in.length; ++j)
			{
				closeVideo(peer, true, j);
			}
			
			for (var j = 0; j < peer.videos_out.length; ++j)
			{
				closeVideo(peer, false, j);
			}
		}
		peer_conn_list = new Array();
	}
	
	function removePeer(peer_mid)
	{
		if(zhujianren==peer_mid){
			zhujianren = null;
			$(".tishi").show();
			/*if(fayanren){
				
			}*/
		}

		for (var i = 0; i < 8; ++i)
		{
			var video_tag = document.getElementById("video_pc_display_" + peer_mid + "_" + i);
			if (video_tag != null)
			{
				video_tag.parentNode.removeChild(video_tag);
			}
			
			var video_tag2 = document.getElementById("rtmpVideo" + peer_mid + "_" + i);
			if (video_tag2 != null)
			{
				video_tag2.parentNode.removeChild(video_tag2);
			}
		}
		
		var index = -1;
		for (var i = 0; i < peer_conn_list.length; ++i)
		{
			var peer = peer_conn_list[i];
			if (peer.client_sn == peer_mid)
			{
				for (var j = 0; j < peer.videos_in.length; ++j)
				{
					closeVideo(peer, true, j);
				}
				
				for (var j = 0; j < peer.videos_out.length; ++j)
				{
					closeVideo(peer, false, j);
				}
				index = i;
				break;
			}
		}
		
		if (index != -1)
		{
			peer_conn_list.splice(index, 1);
		}
	}
	
	function requestPreload(scope, to, urls) {
		if(scope==="public")
			sendToPeer("preload", JSON.stringify({ "scope" : "public", "images" : urls }));
		else if(scope==="private")
			sendToPeer("preload", JSON.stringify({ "scope" : "private", "client_sn" : to, "images" : urls }));
	}

	function requestShare(scope, to, page_no, src) {
		if(scope==="public")
			sendToPeer("share_doc", JSON.stringify({ "scope" : "public", "page_no" : page_no, "src" : src }));
		else if(scope==="private")
			sendToPeer("share_doc", JSON.stringify({ "scope" : "private", "to" : to, "page_no": page_no, "src" : src }));
	}
	
	function in_url(index, url)
	{
		sendToPeer("add_video", JSON.stringify({ "client_sn": my_mid, "video_no": index, "url": url, "is_direct": 0, "client_type" : "rtmp" }));
	}
	
	function logError(error)
	{
		trace(_now(), error);
		window.Electron.log('client-js',error);
	}	
	
	function handlePeerMessage(res)
	{
		console.log('----------------handlePeerMessage-------------');
		console.log('res='+res)
		if(res!=null){
		if (res.action == "join")
		{
			var peer_info = { "client_sn" : res.client_sn, "conf_id" : res.conf_id, "client_type" : res.client_type, "client_seq" : res.client_seq, "is_speaker" : res.is_speaker, 
				"client_name" : res.client_name, "video_numbers" : res.video_numbers, "is_moderator" : res.is_moderator, "client_id" : res.client_id
			};
			
			peer_info.videos_out = new Array(res.video_numbers);
			peer_info.videos_in = new Array(res.video_numbers);
			peer_info.video_status = new Array(res.video_numbers);
			for (var i = 0; i < res.video_status.length; ++i)
			{
				peer_info.video_status[i] = res.video_status[i] == 0 ? 0 : -1;
			}
			trace(_now(), "Peer " + peer_conn_list.length + ": " + JSON.stringify(peer_info));
			window.Electron.log('client-js',"Peer " + peer_conn_list.length + ": " + JSON.stringify(peer_info));
			peer_conn_list.push(peer_info);
			hdkt_addUser(res.client_sn, res.client_type, res.client_name, res.video_numbers, res.is_moderator, res.video_status, res.is_speaker, res.authority_level, res.is_invisible); //add by ray
			//page_addUser(res.client_sn, peer_info.client_name, res.video_numbers, res.video_status, res.is_speaker);
			_addUser(res.authority_level,res.client_id,res.client_name,res.client_seq,res.client_sn,res.client_type,res.is_speaker,res.video_numbers,res.video_status);
			//-----------canvas start--------------------
			if(res.client_sn == my_mid){
				if(res.whiteboard){
					whiteboard = res.whiteboard;
		        	renderWhiteboard(3, -1);
		        	trace(_now(), res);
		        	window.Electron.log('client-js',res);
				}
				
				if(res.broadcastData && res.broadcastData.startTime){
	        		getCourseStartTime(res.broadcastData.startTime.data);
				}

				if(res.broadcastData && res.broadcastData.on_stage_sn && res.broadcastData.on_stage_sn.data){
					//当前发言人存在的情况下展示发言人视频
					fayanren = res.broadcastData.on_stage_sn.data;
					initFayanren(fayanren);
				}else{
					fayanren = null;
				}

				if(res.docUrls && my_is_speaker == "false"){
					initPdf(res.client_sn,res.docUrls,res.docIndex);
				}

				if(res.broadcastData && res.broadcastData.recStatus){
					recStatus = res.broadcastData.recStatus.data;
					change_rec_status(recStatus);
				}

				if(res.broadcastData && res.broadcastData.pip){
					var pipData = res.broadcastData.pip.data;
					window.Electron.writeConf(['pip','stuUp'],[pipData.pip,pipData.stuUp]);
				}

				if(res.broadcastData && res.broadcastData.bc_share_doc){
					var data = res.broadcastData.bc_share_doc.data;
					on_bc_share_doc(data);
	        	}

	        	if(res.broadcastData && res.broadcastData.stuVideoStatus){
					var data = res.broadcastData.stuVideoStatus.data;
					onStuVideoChange(data);
	        	}

	        	if(res.videoList){
					allVideos = res.videoList;
					showWin(allVideos);
	        	}
				
				hdkt_layout();
			}

			
			
        	//-----------canvas end--------------------
		}
		else if (res.action == "joinList")
		{
			console.log("-------------joinList-------------------------------------"+res)
			for(var i = 0;i<res.peers.length;i++){
				var p = res.peers[i];
				if(!p.videos_in){
					p.videos_in = new Array();
				}
				if(!p.videos_out){
					p.videos_out = new Array();
				}
				if(!p.video_status){
					p.video_status = new Array();
				}
				peer_conn_list.push(p);
				_addUser(p.authority_level,p.client_id,p.client_name,p.client_seq,p.client_sn,p.client_type,p.is_speaker,p.video_numbers,p.video_status);
			}


		}
		else if (res.action == "join_resp")
		{
			console.log("-------------join_resp-------------------------------------"+res)
		}
		else if (res.action == "chat")
		{
			trace(_now(), "Message from peer(" + res.from + "): " + res.msg);
			window.Electron.log('client-js',"Message from peer(" + res.from + "): " + res.msg);
			trace(_now(), res);
			window.Electron.log('client-js',res);
			hdkt_messageHandle(res.from, res.msg, res.scope);
		}
		else if (res.action == "leave")
		{
			if(res.videoList){
				allVideos = res.videoList;
				showWin(allVideos);
        	}
			removePeer(res.client_sn);
			
			//发言人退出，置空广播中的发言人
			if(fayanren == res.client_sn || zhujianren == res.client_sn){
				endHandup();
				chagePipInit();
			}
			_deleteUser(res.client_sn);
		}
		else if (res.action == "new_video")
		{
			if(res.videoList){
				allVideos = res.videoList;
				showWin(allVideos);
        	}
			var peer = findRemotePeer(res.client_sn);
			if (peer != null)
			{
				peer.video_status[res.video_no] = res.video_status;
				if(peer.is_speaker){
					hdkt_subscribeVideo(res.client_sn, res.video_no, false, 0, "", peer.client_name);
				}
				hdkt_addVideoNotify(res.client_sn, peer.client_name, res.video_no, res.video_status);
			}
		}
		else if (res.action == "add_video" || res.action == "add_candidate")
		{
			var peer = findRemotePeer(res.client_sn);
			if (peer == null) return;
			
			//var conn = res.is_answer ? peer.videos_out[res.video_no] : peer.videos_in[res.video_no];
			if (res.action == "add_video")
			{
				hdkt_addVideo(res.client_sn, res.video_no, peer.client_name, res.sdp.sdp);
			}
		}
		else if (res.action == "preload")
		{
			hdkt_preload(res.scope, res.images, res.sender, res.to, "二次函数与一元二次方程");
		}
		else if (res.action == "share_doc"){
			hdkt_turn_to_page(res.scope, res.sender, res.to, res.page_no, res.src);
		}

		else if (res.action == "change_speaker") {
			hdkt_change_speaker(res.moderator, res.speaker);
		}
		else if (res.action == "control_video") {
			hdkt_videoControl(res.moderator, res.publisher, res.allow);
		} 
		else if(res.action == "control_audio") {
			hdkt_audioControl(res.moderator, res.publisher, res.allow);
		}
		else if(res.action == "control_chat") {
			hdkt_chatControl(res.moderator, res.publisher, res.allow);
		}
		else if(res.action == "put_in_stage" || res.action == "on_stage") {
			hdkt_stageControl(res.moderator, res.publisher);
		}
		else if(res.action == "record") {
			hdkt_recordNotify(res.is_start);
		}
		else if(res.action == "raise_hand") {
			hdkt_raiseHandNotify(res.client_sn);
		} else if(res.action == "start_mix") {
			trace(_now(), "mix is startted.");
			window.Electron.log('client-js',"mix is startted.");
			var peer_info = { "client_sn" : 0, "conf_id" : my_room, "client_type" : "", "client_seq" : 0, 
				"client_name" : "视频混合", "video_numbers" : 1, "is_moderator" : false, "client_id" : 0
			};
			peer_info.videos_out = new Array(res.video_numbers);
			peer_info.videos_in = new Array(res.video_numbers);
			peer_info.has_videos = new Array(res.video_numbers);
			peer_info.has_videos[0] = 0;
			trace("Peer " + peer_conn_list.length + ": " + JSON.stringify(peer_info));
			window.Electron.log('client-js',"Peer " + peer_conn_list.length + ": " + JSON.stringify(peer_info));
			peer_conn_list.push(peer_info);
			hdkt_mixNotify(1);
		} else if(res.action == "stop_mix") {
			hdkt_mixNotify(-1);
		} else if(res.action==="sync_video") {
            hdkt_syncVideo(res.publisher, res.video_no);
        }
        //for drawing处理MCU返回的信息
        else if(res.action == "whiteboard") {

        }else if(res.action == "canvas"){
        	if(res.sender != my_mid){

			    var isExists = false;
			    var whiteboardIndex = -1;
			    var isNewOrDelete = 0;

			    for(var i = 0;i<whiteboard.length;i++) {
			    	if (whiteboard[i].ppt_name == res.ppt_name && whiteboard[i].ppt_page == ppt_page) {
			    		isExists = true;
			    		whiteboardIndex = i;
			    		break;
			    	}
			    }

			    if (whiteboardIndex == -1 && res.sub_action != "create") return;
	            if(res.sub_action == "createPath"){
	        		whiteboard[whiteboardIndex].paths.push(res.content);
	        	}else if(res.sub_action == "updatePath"){
	        		for(var j in whiteboard[whiteboardIndex].paths) {
			            if(whiteboard[whiteboardIndex].paths[j].id == res.content.id){
			               whiteboard[whiteboardIndex].paths[j] = res.content;
			            }
			        }
	        	}else if(res.sub_action == "delPath"){
	        		var delIndex = [];
			        for(var j in whiteboard[whiteboardIndex].paths) {
			            if(whiteboard[whiteboardIndex].paths[j].id == res.content.id){
			               delIndex.push(j);
			            }
			        }
			        for(var j = delIndex.length-1;j>=0;j--){
			            whiteboard[whiteboardIndex].paths.splice(delIndex[j],1);
			        }
	        	}else if(res.sub_action == "destroy"){
	        		//whiteboard.splice(whiteboardIndex, 1);
	        		isNewOrDelete = 1;
	        	}

			    if(!isExists){
			    	isNewOrDelete = 2;
				    var canvasWb = {
				        "canvas":res.content,
				        "creator":res.sender,
				        "ppt_name":res.ppt_name,
				        "ppt_page":res.ppt_page,
				        "paths":[]
				    };
					whiteboard.push(canvasWb);
					whiteboardIndex = whiteboard.length - 1;
			    }
	        	renderWhiteboard(isNewOrDelete, whiteboardIndex);
	        	trace(_now(), res);
	        	window.Electron.log('client-js',res);
        	}
        }else if(res.action == "broadcast"){
    		if(res.key == "putMain"){
    			if(res.sender != my_mid){
        			changeVideo(res.data,true);//切入
        		}
        	}else if(res.key == "outMain"){
				if(res.sender != my_mid){
					changeVideo(res.data,false);//切出
        		}
        	}else if(res.key == "endHandup"){
        		onEndHandup();
        	}else if(res.key == "startTime"){
        		getCourseStartTime(res.data);
        	}else if(res.key == "on_stage_sn"){
        		if(res.data != ''){
					change_stage_sn(res.data);
        		}else{
        			change_stage_sn_end();
        		}
        	}else if(res.key == "recStatus"){
        		if(res.sender != my_mid){
        			change_rec_status(res.data);
        		}
        	}else if(res.key == "pip"){
        		var pipData = res.data;
				window.Electron.writeConf(['pip','stuUp'],[pipData.pip,pipData.stuUp]);
        	}else if(res.key == 'bc_share_doc'){
				var data = res.data;
				on_bc_share_doc(data);
        	}else if(res.key == 'openOrCloseCanvas'){
				var data = res.data;
				openOrCloseCanvas(data);
        	}else if(res.key == 'closeFayanrenVideo'){
        		closeFayanrenVideo();
        	}else if(res.key == 'stuVideoStatus'){
        		onStuVideoChange(res.data);
        	}else if(res.key == "updatePlanInfo"){
        		updatePlanInfo(res.data);
        	}
        	
        }else{
			trace(_now(), "unrecognized action");
			window.Electron.log('client-js',"unrecognized action");
		}
		}
	}
	
	function hangingGetCallback() {
			if (request.readyState != 4) {
				return;
			}
			if (request.status != 200) {
				trace(_now(), "server error: " + request.status + " " + request.statusText);
				window.Electron.log('client-js', "server error: " + request.status + " " + request.statusText);
				if(request.status == 403){
					connect(my_name,my_id, my_room,'user','recordCastClient',[],'0',my_is_speaker,my_is_moderator);
					// disconnect();
					var streamindexs = new Array();
					var winindexs = new Array();
					var vl2 = new Array();
					for (var i = 0; i < videoList.length; i++) {
						vl2[i] = videoList[i];
					}

					for (var i = 0; i < vl2.length; i++) {
						var videoStr = vl2[i];
						streamindexs.push(videoStr.split("_")[1]);
						winindexs.push(videoStr.split("_")[2]);
						window.Electron.ipcRenderer.send("removeWindow", videoStr.split("_")[0], videoStr.split("_")[1], videoStr.split("_")[2]);
					}
					
					//window.Electron.ipcRenderer.send("removeAllWindow",streamindexs,winindexs);
					return;
				}
				// disconnect();
				// return;
			} else {
				trace(_now(), "Response:" + request.responseText);
				window.Electron.log('client-js', "Response:" + request.responseText);
				++message_counter;
				
				var message = JSON.parse(request.responseText);
				handlePeerMessage(message);
			}
			startHangingGet();
	}
	
	function startHangingGet() {
		try {
			request.open("GET", server + "/wait?client_sn=" + my_mid+"&token="+window.Electron.remote.getGlobal('token'), true);
			request.onreadystatechange = hangingGetCallback;
			request.send();
		} catch (e) {
			trace(_now(), "error: " + e);
			window.Electron.log('client-js',"error: " + e);
		}
	}

	function hangingInitCallback() {
		if(isNeedConnect && handRequest.readyState == 4 && handRequest.status == 200){
			is_send_url = false;
			connect(my_name,my_id, my_room,'user','recordCastClient',[],'0',my_is_speaker,my_is_moderator);
			return;
		}
		// console.log("hangingInitCallback:"+handRequest.readyState);
	}
	
	function startHangingInit() {
		try {
			window.Electron.remote.getGlobal('mcu');
			handRequest.open("GET", "http://www.baidu.com", true);
			handRequest.onreadystatechange = hangingInitCallback;
			handRequest.onerror = errorHttpConnection;
			handRequest.send();
		} catch (e) {
			trace(_now(), "error: " + e);
			window.Electron.log('client-js',"error: " + e);
		}
	}
	
	function lossHttpConnection() {
		trace(_now(), "Loss connection with peer connection server.");

		window.Electron.log('client-js',"Loss connection with peer connection server.");
		// disconnect();
		connect(my_name,my_id, my_room,'user','recordCastClient',[],'0',my_is_speaker,my_is_moderator);
		var streamindexs = new Array();
					var winindexs = new Array();
					var vl2 = new Array();
					for (var i = 0; i < videoList.length; i++) {
						vl2[i] = videoList[i];
					}

					for (var i = 0; i < vl2.length; i++) {
						var videoStr = vl2[i];
						streamindexs.push(videoStr.split("_")[1]);
						winindexs.push(videoStr.split("_")[2]);
						window.Electron.ipcRenderer.send("removeWindow", videoStr.split("_")[0], videoStr.split("_")[1], videoStr.split("_")[2]);
					}
	}

	function errorHttpConnection(){
		trace(_now(), "errorHttpConnection.");
		window.Electron.log('client-js',"errorHttpConnection.");
	}
	
	function signInCallback() {
		try {
			if (request.readyState == 4) {
				if (request.status == 200) { 
					var r = JSON.parse(request.responseText);
					if (r.code != 0)
					{
						trace(_now(), r.status);
						disconnect();
						return;
					}
					else
					{
						my_seq = r.client_seq;
						my_mid = r.client_sn;
						jQuery("#hdkt_login").css("display", "none");
						jQuery("#hdkt_container").css("display", "block");
						hdkt_initBar(my_type);
						jQuery("#hdkt_container").removeClass( "hidden" );
					}
					
					window.setTimeout(startHangingGet, 0);
					/*isNeedConnect = false;
					if(!connectInterval){
						handRequest = new XMLHttpRequest();
						connectInterval =setInterval(startHangingInit,5000);
					}*/
				} else {
					trace(_now(), "Invalid http status: " + request.status + "[" + request.statusText + "]");
					window.Electron.log('client-js',"Invalid http status: " + request.status + "[" + request.statusText + "]");
					disconnect();
				}
			}			
		} catch (e) {
			trace(_now(), e);
			trace(_now(), "error: " + e.description);
			window.Electron.log('client-js',"error: " + e.description);
		}
	}
	
	function signIn() {
		try {			
		
			hdkt_initUserList();
			request = new XMLHttpRequest();
			request.onreadystatechange = signInCallback;
			//request.timeout = 5000;
			request.ontimeout = lossHttpConnection;
			request.open("POST", server + "/join?conf_id=" + my_room+"&token="+window.Electron.remote.getGlobal('token'), true);
			var data = JSON.stringify({ "client_id" : my_id, "client_type" : my_type, "is_moderator" : my_is_moderator, "client_name" : my_name, "video_numbers" : my_video_numbers, "is_speaker" : my_is_speaker, "authority_level" : my_authority_level, "is_invisible" : my_is_invisible});
			trace(_now(), data);
			window.Electron.log('client-js',data);
			request.send(data);
		} catch (e) {
			trace(_now(), e);
			window.Electron.log('client-js',e);
		}
	}
	
	function sendToPeer(path, data) {
		if (my_mid == -1) {
			alert("Not connected");
			return;
		}
		
		var r = new XMLHttpRequest();
		r.onreadystatechange = function() {
			sendToPeerCallback(r);
		}
		r.open("POST", server + "/" + path + "?conf_id=" + my_room + "&client_sn=" + my_mid+"&token="+window.Electron.remote.getGlobal('token'), true);
		r.send(data);
		trace(_now(), "Send to mcu(" + my_mid + "):", data);
		trace(_now(), "responseText:", r.responseText);
		window.Electron.log('client-js',"Send to mcu(" + my_mid + "):");
		window.Electron.log('client-js',data);
		window.Electron.log('client-js',r.responseText);
		
	}
	function sendToPeerCallback(r) {
		try {
			if (r.readyState == 4) {
				if (r.status == 200) { 
					var r = JSON.parse(r.responseText);
					trace(_now(), r);
					window.Electron.log('client-js',r);
					if (r.code != 0) {
                        if ("subscribe_video_resp" === r.action) {
                            hdkt_subscribe_error_handle(r.publisher, r.video_no);
                        } else {
                            return;
                        }
					}
					else
					{
						if("force_open_video_resp"===r.action && 0===r.code) {
                            trace(_now(), "success");
							window.Electron.log('client-js',success);
                        }
                        else if("unsubscribe_video_resp"=== r.action && 0=== r.code) {
                            hdkt_closeVideo(r.publisher, r.video_no);
                        }
                        //for drawing
                        else if("whiteboard_resp" === r.action && 0 === r.code){
                            whiteboard_global.getDesinger(r).handleResponseFromMCU(r);
                        }
					}
				} else {
					trace(_now(), "Invalid http status: " + r.status + "[" + r.statusText + "]");
					window.Electron.log('client-js',"Invalid http status: " + r.status + "[" + r.statusText + "]");
				}
			}
		} catch (e) {
			trace(_now(), e);
			window.Electron.log('client-js',e);
		}
	}
	
	function connect(name,id,room,type,signInDevice,video_urls,authority_level,isSpeaker,isModerator) {

		my_name = name;
		my_id = id;
		my_room = room;
		my_type = type;
		if("user"===my_type) {
			var my_signInDevice = signInDevice;//$("#signInDeviceType").val();
			if("recordCastClient"===my_signInDevice) {
				my_video_urls = video_urls;//getVideoUrls(parseInt(id));
				trace(my_video_urls);
				window.Electron.log('client-js',my_video_urls);
			} else {
				my_video_urls = [];
			}
		}
		my_video_numbers = hdkt_cameras.length + my_video_urls.length + 1;
		trace(_now(), my_video_urls, my_video_numbers);
		my_is_moderator = isModerator;//"true";//===jQuery("#isModerator").val()?true:false;
		my_is_speaker = isSpeaker;
		my_authority_level = authority_level;//jQuery("#authorityLevel").val();
		my_is_invisible = "true"===jQuery("#is_invisible").val()?true:false;;
		if (my_name.length == 0) {
			alert("I need a name please.");
			document.getElementById("_local").focus();
		} else {
			signIn();
		}
	}
	
	function disconnect() {
		if (request) {
			request.abort();
			request = null;
		}
		
		if (my_mid != -1) {
			request = new XMLHttpRequest();
			request.open("GET", server + "/leave?client_sn=" + my_mid+"&token="+window.Electron.remote.getGlobal('token'), false);
			request.send();
			request = null;
		}
		
		my_seq = -1;
		my_mid = -1;
		
		document.getElementById("connect").disabled = false;
		document.getElementById("disconnect").disabled = true;
		document.getElementById("send").disabled = true;
		document.getElementById("call").disabled = true;
		document.getElementById("in_conf").disabled = true;
		//document.getElementById("call_direct").disabled = true;
		
		clearPeers();
		jQuery("#hdkt_container").fadeOut( "fast" );
		jQuery("#hdkt_container").addClass( "hidden" );
		jQuery("#hdkt_login").fadeIn( "fast" );
	}
	
	window.onbeforeunload = disconnect;

	function send() {
		var text = document.getElementById("_message").value;
		var peer_mid = parseInt(document.getElementById("_peer_mid").value);
		if (!text.length) {
			alert("No text supplied or invalid peer id");
		} else {
			if (peer_mid != -1)
			{
				sendToPeer("chat_private", JSON.stringify({ "client_sn" : peer_mid, "msg" : text }));
			}
			else
			{
				sendToPeer("chat_public", JSON.stringify({ "msg" : text }));
			}
		}
	}

	function requestPreload(scope, to, urls) {
		if(scope==="public")
			sendToPeer("preload", JSON.stringify({ "scope" : "public", "images" : urls }));
		else if(scope==="private")
			sendToPeer("preload", JSON.stringify({ "scope" : "private", "to" : to, "images" : urls }));
	}

	function requestShare(scope, from, to, page_no, src) {
		if(scope==="public")
			sendToPeer("share_doc", JSON.stringify({ "scope" : "public", "page_no" : page_no, "src" : src }));
		else if(scope==="private")
			sendToPeer("share_doc", JSON.stringify({ "scope" : "private", "to" : to, "page_no": page_no, "src" : src }));
	}

	function requireForceOpen(publisher, video_no) {
		sendToPeer("force_open_video", JSON.stringify({ "publisher" : publisher, "video_no" : video_no }));
	}

	function requestChangeSpeaker(sn) {
		sendToPeer("change_speaker", JSON.stringify({ "speaker":sn }));
	}

	function request_control_video(status, sn) {
		sendToPeer("control_video", JSON.stringify({"allow": status, "client_sn": sn}));
	}

	function request_control_audio(status, sn) {
		sendToPeer("control_audio", JSON.stringify({"allow": status, "client_sn": sn}));
	}

	function request_control_chat(status, sn) {
		sendToPeer("control_chat", JSON.stringify({"allow": status, "client_sn": sn}));
	}

	function request_on_stage(sn) {
		/*if(fayanren){
			alert("请结束当前发言人！");
			return;
		}*/
		sendToPeer("broadcast", JSON.stringify({"key":"on_stage_sn","data":sn,"save":1}));
		sendToPeer("on_stage", JSON.stringify({"publisher": sn, "video_no": 0}));
		
	}

	var isHandUp = false;
	function requestRaiseHand(_this) {
		var isOpen = false;
		for (var i = 0; i < videoList.length; i++) {
			var videoStr = videoList[i];
			if(videoStr.indexOf(my_mid+"_") == 0){
				isOpen = true;
				break;
			}
		}
		if(isOpen){
			if(!isHandUp){
				$(_this).css("background","#484849");
				isHandUp = true;
			}else{
				$(_this).css("background","");
				isHandUp = false;
			}
			sendToPeer("raise_hand", JSON.stringify({}));
		}else{
			alert("请打开摄像头！")
		}
		
	}

	function requestRecord(is_start) {
		//sendToPeer("record", JSON.stringify({"start": start, "speaker": speaker, "course_name": courseName, "start_time": startTime, "end_time": endTime}));
        sendToPeer("record", JSON.stringify({ "is_start" : is_start }));
	}

	function requestStartMix(mode, total_width, total_height, max_bit_rate) {
		if("undefined" !== typeof max_bit_rate)
			sendToPeer("start_mix", JSON.stringify({"mode": mode, "total_width": total_width, "total_height": total_height, "max_bit_rate": max_bit_rate}));
		else
			sendToPeer("start_mix", JSON.stringify({"mode": mode, "total_width": total_width, "total_height": total_height}));
	}

	function requestStopMix() {
		sendToPeer("stop_mix", JSON.stringify({}));
	}

	function putMain(sn) {
		sendToPeer("broadcast", JSON.stringify({"key":"putMain","data":sn,"save":1}));
	}
	function outMain(sn) {
		sendToPeer("broadcast", JSON.stringify({"key":"outMain","data":sn,"save":0}));
	}
	function endHandup() {
		// jQuery('.answering').removeClass('answering');
	 //    jQuery('.isOnsering').hide();
	 //    jQuery('.huida').show();
	 //    jQuery('#fayanrenTools').hide();
  //       jQuery('#isJoin li img').attr('src','../img/imger/30.png');
		if(fayanren){
			sendToPeer("broadcast", JSON.stringify({"key":"endHandup","data":fayanren,"save":0}));
		}
	}

	function requestCloseVideo(sn, video_no) {
		sendToPeer("unsubscribe_video", JSON.stringify({ "publisher":sn, "video_no": video_no }));
	}

    function requestSyncVideo(sn, video_no) {
        sendToPeer("sync_video", JSON.stringify({ "publisher":sn, "video_no": video_no }));
    }

 	function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }

    function toStartTime(courseStartTime){
	  	var starttime = new Date(courseStartTime);
	  	setInterval(function () {
	    var nowtime = new Date();
	    var time = starttime - nowtime;
	    if(time < 0){
	    	$('#toStartTime').hide();
	    	return;
	    }
	    $('#toStartTime').show();
	    var day = parseInt(time / 1000 / 60 / 60 / 24);
	    var hour = parseInt(time / 1000 / 60 / 60 % 24);
	    var minute = parseInt(time / 1000 / 60 % 60);
	    var seconds = parseInt(time / 1000 % 60);
	     // console.log(day + "天" + hour + "小时" + minute + "分钟" + seconds + "秒")
	    $('.timespan').html(day + "天" + hour + "小时" + minute + "分钟" + seconds + "秒");
	  }, 1000);
    }

    function changeVideo(sn,main){
    	for (var i = 0; i < videoList.length; i++) {
			var videoStr = videoList[i];
			var str = videoStr.split("_");
			var streamindex = str[1];
			var winIndex = str[2];
			if(str[0] == sn){
				if(main){//如果是切入主屏的操作
					var left = $('#content').offset().left;
					var top = $('#content').offset().top;
					var width = $('#content').width();
					var height = $('#content').height();
					ipcRenderer.send('copyWindow',left,top,width,height,streamindex,winIndex);
				}else{
					ipcRenderer.send('uncopyWindow',left,top,width,height,streamindex,winIndex);
				}
			}
		}
    }

    function onEndHandup(){
    	for (var i = 0; i < videoList.length; i++) {
			var videoStr = videoList[i];
			var str = videoStr.split("_");
			var streamindex = str[1];
			var winIndex = str[2];
			if(str[0] == fayanren){
				if(fayanren == my_mid){
		    		// hookMyselfWindow(true,streamindex,winIndex);
		    		changeVideo(fayanren,false);
		    	}else{
		    		ipcRenderer.send('removeWindow',fayanren,streamindex,winIndex);
		    	}
			}
		}
		jQuery('.answering').removeClass('answering');
	    jQuery('.isOnsering').hide();
	    jQuery('.huida').show();
	    fayanren = null;
	    sendToPeer("broadcast", JSON.stringify({"key":"on_stage_sn","data":"","save":1}));
    }

    function searchUser(_this){
    	var searchValue = $(_this).val();
    	$(_this).parent().parent().find('li').show();
    	$(_this).parent().parent().find('li').each(function(index,element){
    		if(index > 0){
    			if($(element).find('span').text().indexOf(searchValue) >=0){
    				return;
    			}else{
    				$(element).hide();
    			}
    		} 
    	})
    }

    function toolsActive(_this,_lineMode){
    	lineMode=_lineMode;
    	$('.a_active').removeClass('a_active');
    	$(_this).parent().addClass('a_active');

    }
	var recTimeInter;
    function startRec(_this){
    	if(isRec){
			ipcRenderer.send('stopRec');
			$(_this).children().attr('class','start');
			if(recTimeInter) clearInterval(recTimeInter);
    	}else{
    		ipcRenderer.send('startRec');
    		$(_this).children().attr('class','stop');
    		var starttime = new Date();
    		recTimeInter = setInterval(function () {
			    var nowtime = new Date();
			    var time = nowtime - starttime;
			    var hour = parseInt(time / 1000 / 60 / 60 % 24);
			    var minute = parseInt(time / 1000 / 60 % 60);
			    var seconds = parseInt(time / 1000 % 60);
			    $('#recTime').html(hour + ":" + minute + ":" + seconds );
			  }, 1000)
    	}
    	isRec = !isRec;
    }

    function uploadFile(type){
    	if(uploadding){
    		$('#uploadProgress').modal('show');
    	}else{
    		if(isRec) {
	    		alert("请先停止录制！");
	    		return;
	    	}
	    	var filePath =$('#uploadFile').val();
	    	if(!filePath || filePath == ''){
	    		alert("请先录制！");
	    		return;
	    	}
	    	document.getElementById("filePath").innerHTML=filePath;
	    	ipcRenderer.send('uploadFile',filePath,type);
	    	$('#uploadProgress').modal('show');
	    	uploadding = true;
    	}
    }

    function showWin(){}
	function hdkt_turn_to_page_callback(){}
	function renderAllPaths(){};
	function getCourseStartTime(){};
	function hookSpeakerWindow(){};
	function change_stage_sn(){};
	function change_stage_sn_end(){};
	function chagePipInit(){};
	function change_rec_status(){};
	function on_bc_share_doc(){};
	function closeFayanrenVideo(){};
	function openOrCloseCanvas(){};
	function initFayanren(){};
	function onStuVideoChange(){};
	function updatePlanInfo(){};
  (function($, h, c) {
			var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j
					+ "-special-event", b = "delay", f = "throttleWindow";
			e[b] = 350;
			e[f] = true;
			$.event.special[j] = {
				setup : function() {
					if (!e[f] && this[k]) {
						return false
					}
					var l = $(this);
					a = a.add(l);
					$.data(this, d, {
						w : l.width(),
						h : l.height()
					});
					if (a.length === 1) {
						g()
					}
				},
				teardown : function() {
					if (!e[f] && this[k]) {
						return false
					}
					var l = $(this);
					a = a.not(l);
					l.removeData(d);
					if (!a.length) {
						clearTimeout(i)
					}
				},
				add : function(l) {
					if (!e[f] && this[k]) {
						return false
					}
					var n;
					function m(s, o, p) {
						var q = $(this), r = $.data(this, d);
						r.w = o !== c ? o : q.width();
						r.h = p !== c ? p : q.height();
						n.apply(this, arguments)
					}
					if ($.isFunction(l)) {
						n = l;
						return m
					} else {
						n = l.handler;
						l.handler = m
					}
				}
			};
			function g() {
				i = h[k](function() {
					a.each(function() {
						var n = $(this), m = n.width(), l = n.height(), o = $
								.data(this, d);
						if (m !== o.w || l !== o.h) {
							n.trigger(j, [ o.w = m, o.h = l ])
						}
					});
					g()
				}, e[b])
			}
		})(jQuery, this);
