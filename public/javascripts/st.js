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
		return;
	}

	$.post('/modify', 
		{sitno:sn, nickname:nick, room:room_num}, 
		function(data){
		
			if(data.msg === 'success') {
				if($("a[title='" + nick + "']").length != 0) {
					
					var _id = $("a[title='" + nick + "']").attr('id');
					clearSitWithSitno(_id);

					$("a[title='" + nick + "']").removeClass("sitted");
					$("a[title='" + nick + "']").attr('title', '空');
				}
				
				$(".selected").removeClass("selected");
				$("#"+sn).addClass('sitted');
				$("#"+sn).attr('title', nick);

			} else {

			}
		}, 
		'json');
	socket.emit('modify_sit', {sitno:sn, nickname:nick, room:room_num});
}

function clearSitWithSitno(sn){
	$.post('/modify', 
		{sitno:sn, nickname:null, room:room_num}, 
		function(data){
		
			if(data.msg === 'success') {
				$(".selected").removeClass("selected");
				$("#"+sn).removeClass('sitted');
				$("#"+sn).attr('title', '空');	
			} else {

			}
		}, 
		'json');

	socket.emit('clear_sit', {sitno:sn, nickname:null, room:room_num});
}

function clearSit(){
	var sn = $("#sitno").val();

	console.log(sitno);

	$.post('/modify', 
		{sitno:sn, nickname:null, room:room_num}, 
		function(data){
		
			if(data.msg === 'success') {
				$(".selected").removeClass("selected");
				$("#"+sn).removeClass('sitted');
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
	initSocketIO();
	$(".dark-cover").remove();
}

function initSocketIO() {
	console.log('init socket.io');

	socket = io.connect('http://takeshi.tw:8181');
	socket.on('sit_md', function (data) {
		var sn = data.sitno;
		var nick = data.nickname;
		// console.log(data);
		$("#"+sn).addClass("sitted");
		$("#"+sn).attr("title", nick);

	});

	socket.on('sit_clr', function (data) {
		var sn = data.sitno;
		
		$("#"+sn).removeClass('sitted');
		$("#"+sn).attr('title', '空');
	});
	
	socket.on('irc_msg', function (data) {
		console.log("IRC Message : " + data.from + " : " + data.msg);
		html =  "<div class='msg-bubble'>" + data.msg + "</div>";
		$("a[title='" + data.from + "']").prepend(html);

		setTimeout(function() {
			$("a[title='" + data.from + "'] .msg-bubble").remove();
		}, 2000);
	});
}

