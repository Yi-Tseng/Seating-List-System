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

$('.display-gra-btn').click(function() {
	if($('.display-gra-btn').hasClass('g-btn-move')) {
		
		$('.display-gra-btn').html('頭像設定');
		$('.display-gra-btn').removeClass('g-btn-move');
		$('.gravatar-regist').removeClass('g-move');
		
	} else {
		$('.display-gra-btn').addClass('g-btn-move');
		$('.gravatar-regist').addClass('g-move');
		$('.display-gra-btn').html('關閉');
	}
	
});


function modifySit () {
	var sn = $("#sitno").val();
	// sn = sn.substring(4); // cut "seat"
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
				$("#"+sn).removeClass();
				$("#"+sn).addClass('sit');
				$("#"+sn).addClass('sitted');
				$("#"+sn).attr('title', nick);
				loadBlackList();
				loadGravatar();
			}
		}, 
		'json');
}

function clearSitWithSitno(sn){
	$.post('/modify', 
		{sitno:sn, nickname:'', room:room_num}, 
		function(data){
			if(data.msg === 'success') {
				$("#"+sn).attr('style', '');
			}
		}, 
		'json');
}

function clearSit() {
	var sn = $("#sitno").val();
	// sn = sn.substring(4); // cut "seat"
	if(sn === '') {
		return;
	}

	$.post('/modify', 
		{sitno:sn, nickname:'', room:room_num}, 
		function(data){
		
			if(data.msg === 'success') {
				$("#"+sn).attr('style', '');
				$("#"+sn).removeClass();
				$("#"+sn).addClass('sit');
				$("#"+sn).attr('title', '空');	
			} else {

			}
		}, 
		'json');

	// socket.emit('clear_sit', {sitno:sn, nickname:null, room:room_num});
	
}

function init() {
	room_num = $('#room').val();
	console.log("get room : " + room_num);

	loadSits();
	initSocketIO();
	setTimeout(function(){
		loadBlackList();
		loadGravatar();
	}, 4000);
	
	setTimeout(function(){
		$(".dark-cover").remove();
		console.log("ok");
	}, 3000);
}

function loadSits() {
	
	$.get('/list/?room=' + room_num, function(data) {
		if(data.msg === 'success') {
			for(var k in data.seats) {
				var seat = data.seats[k];
				$('#' + seat.no).attr('title', seat.name);
				$('#' + seat.no).addClass('sitted');
			}
		}
	}, 'json');
}

function loadBlackList() {

	$.get('/black-list', function(data) {
		var list = data.list;
		console.log(list);
		for(k in list) {
			$("a[title='"+list[k].name+"']").addClass('black-sit');
		}
	}, 'json');
}

function initSocketIO() {
	console.log('init socket.io');

	socket = io.connect('http://'+location.hostname+':'+location.port);

	socket.on('sit_md', function (data) {

		if(data.room === room_num) {
			var sn = data.sitno;
			var nick = data.nickname;
			var oldSeat = data.oldSeat;
			console.log('old ' + oldSeat);

			if(oldSeat != undefined) {
				clearSitWithSitno(oldSeat);
			}

			console.log(data);
			$("#"+sn).removeClass("selected");
			$("#"+sn).addClass("sitted");
			$("#"+sn).attr("title", nick);
		}

		
	});

	socket.on('sit_clr', function (data) {
		if(data.room === room_num) {
			var sn = data.sitno;
			$("#"+sn).attr('style', '');
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

	socket.on('reload_gravatar', function(data) {
		console.log(data);
		var k = data.ircNick;
		var emailHash = data.emailHash;
		var graURL = 'http://en.gravatar.com/avatar/' + emailHash;
		$('a[title='+k+']').addClass('gravatar-sit');
		$('a[title='+k+']').attr('style', 'background-image: url('+graURL+'?d=mm&s=150);');
		console.log('change gra finished');
	});
	
}

function loadGravatar() {
	$.get('/list-gra', function(data) {

		if(data.res === 'success') {
			var graList = data.list;
			for(var k in graList) {
				var ircNick = graList[k].ircNick;
				var emailHash = graList[k].emailHash;
				var graURL = 'http://en.gravatar.com/avatar/' + emailHash;
				$("a[title='"+ircNick+"']").addClass('gravatar-sit');
				$("a[title='"+ircNick+"']").attr('style', 'background-image: url('+graURL+'?d=mm&s=150);');
			}
		}
	});
}

function addGravatar() {
	var ircNick = $('#ircNick').val();
	var email = $('#email').val();
	email = email.toLowerCase();
	var emailHash = hex_md5(email);
	$.post('/add-gra', 
		{'ircNick':ircNick, 'emailHash':emailHash}, 
		function(data) {
			if(data.res === 'success') {
				$('#ircNick').val('');
				$('#email').val('');
				// socket.emit('reload_gravatar', {'ircNick':ircNick, 'emailHash':emailHash});
				$('#gra_msg').html('修改成功');
				
			} else {
				$('#gra_msg').html('修改失敗');
			}
		});
}

