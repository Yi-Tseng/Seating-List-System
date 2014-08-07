var socket;
var room_num;
var bullets = {};
var firedBullets = {};
var bulletSpeed = 30;

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

}

function init() {
	room_num = $('#room').val();
	console.log("get room : " + room_num);

	loadSits();
	initSocketIO();
	loadBlackList();
	loadGravatar();

	setTimeout(function(){
		$(".dark-cover").remove();
	}, 2000);
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
		var tmpArr = data.msg.split(':');
		var from = data.from;
		var to = '';
		var message = '';
		if(tmpArr.length > 1){
			to = tmpArr[0];
			message = data.msg.substr(to.length + 1);
		} else {
			message = data.msg;
		}

		// 'DennyHuang: Hello:World'

		console.log("IRC Message : " + from + " -> " + to + " : " + message);

		if(to !== '' && $("a[title='" + to + "']").length != 0) {
			var locFrom = $("a[title='" + from + "']").position();
			var locTo = $("a[title='" + to + "']").position();
			var rnd = Math.random();

			var bulletId = hex_md5('' + rnd);
			while(typeof bullets[bulletId] !== 'undefined') {
				rnd = Math.random();
				bulletId = hex_md5(rnd);
			}

			var bcvs = "<div id='" + bulletId + "' class='irc-bullet' style='top:" + (locFrom.top) + "px; left:" + (locFrom.left)+ "px;'></div>"
			var bullet = {from:from, to:to, locFrom:locFrom, locTo:locTo};

			bullets[bulletId] = bullet;
			$('body').append(bcvs);

			$('#' + bulletId).animate(
				{left:locTo.left + "px", top:locTo.top + "px"},
				400,
				function(){
					var pos = $(this).position();
					var height = $(this).height();
					var width = $(this).width();

					$(this).animate(
						{
							height: height*2,
							width:width*2,
							opacity:0,
							left:pos.left - width/2,
							top:pos.top - height/2
						},
						300,
						function(){
							var bulletId = this.id;
							$('#' + bulletId).remove();
						})
				});
		}

		//
		html =  "<div class='msg-bubble'>" + message + "</div>";
		$("a[title='" + from + "']").prepend(html);
		setTimeout(function() {
			$("a[title='" + from + "'] .msg-bubble").remove();
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
		console.log('reload gra' + data);
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

function help() {
	window.scrollTo(0, 0);
	var helpImageHtml = '<img class="help" src="/images/help.png"></img>';
	$('html').append(helpImageHtml);
	$('.help').click(function() {
		$('.help').remove();
	});
}
