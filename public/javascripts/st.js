var socket;

var room_num;

$(".sit").click(function(){
	if(this.className.indexOf('selected') != -1){
		$(".selected").removeClass("selected");
		$("#sitno").val('');
		$("#nickname").val('');
	} else {
		$(".selected").removeClass("selected");
		this.className = "selected " + this.className;
		$("#sitno").val(this.id);
		if(this.title === '空') {
			$("#nickname").val('');
		} else {
			$("#nickname").val(this.title);
		}
	}
});


function modifySit () {
	var sn = $("#sitno").val();
	var nick = $("#nickname").val();
	if(nick === '') {
		$(".selected").removeClass("selected");
		$(".selected").removeClass("black-sit");
		return;
	}

	if(sn === '') {
		return;
	}

	$.post('/modify', 
		{sitno:sn, nickname:nick, room:room_num}, 
		function(data){
		
			if(data.msg === 'success') {
				if($("a[title='" + nick + "']").length != 0) {
					var _id = $("a[title='" + nick + "']").attr('id');
					clearSitWithSitno(_id);
				} else {

					$("#"+sn).removeClass();
					$("#"+sn).addClass('sit');
					$("#"+sn).addClass('sitted');
					$("#"+sn).attr('title', nick);
					socket.emit('modify_sit', {sitno:sn, nickname:nick, room:room_num});
					loadBlackList();
				}
			} else {

			}
		}, 
		'json');
}

function clearSitWithSitno(sn){
	$.post('/modify', 
		{sitno:sn, nickname:null, room:room_num}, 
		function(data){
			if(data.msg === 'success') {
				modifySit();
				socket.emit('clear_sit', {sitno:sn, nickname:null, room:room_num});
			} else {

			}
		}, 
		'json');
}

function clearSit() {
	var sn = $("#sitno").val();

	if(sn === '') {
		return;
	}



	$.post('/modify', 
		{sitno:sn, nickname:null, room:room_num}, 
		function(data){
		
			if(data.msg === 'success') {
				$("#"+sn).removeClass();
				$("#"+sn).addClass('sit');
				$("#"+sn).attr('title', '空');	
			} else {

			}
		}, 
		'json');

	socket.emit('clear_sit', {sitno:sn, nickname:null, room:room_num});
	
}


function loadSits() {
	room_num = $('#room').val();
	console.log("get room : " + room_num);
	loadBlackList();
	initTomatoSit();
	initSocketIO();
	$(".dark-cover").remove();
}

function loadBlackList() {
	$.get('/black-list', function(data) {
		var list = data.list;
		for(k in list) {
			console.log(name);
			$('a[title='+list[k]+']').addClass('black-sit');
		}
	}, 'json')
}

function initTomatoSit() {
	$('a[title="Oscar"]').addClass('tomato-sit');
}

function initSocketIO() {
	console.log('init socket.io');

	socket = io.connect('http://'+location.hostname+':'+location.port);

	socket.on('sit_md', function (data) {
		if(data.room === room_num) {
			var sn = data.sitno;
			var nick = data.nickname;
			// console.log(data);
			$("#"+sn).addClass("sitted");
			$("#"+sn).attr("title", nick);
		}
	});

	socket.on('sit_clr', function (data) {
		if(data.room === room_num) {
			var sn = data.sitno;
			$("#"+sn).removeClass();
			$("#"+sn).addClass('sit');
			$("#"+sn).attr('title', '空');
		}
	});
	
	socket.on('irc_msg', function (data) {
		console.log("IRC Message : " + data.from + " : " + data.msg);
		html =  "<div class='msg-bubble'>" + data.msg + "</div>";
		$("a[title='" + data.from + "']").prepend(html);

		setTimeout(function() {
			$("a[title='" + data.from + "'] .msg-bubble").remove();
		}, 2000);
	});
	socket.on('conf_msg', function(data) {
		console.log('Conference Message : ' + data.msg);
		html = '<div class="conf-msg" id="conf-msg">' + data.msg + '</div>';
		$('body').prepend(html);

		setTimeout(function() {
			$('#conf-msg').remove();
		}, 10000);
	});
}



