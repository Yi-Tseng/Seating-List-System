var socket;
var room_num;
var bullets = {};
var firedBullets = {};
var bulletSpeed = 30;
var graApi = '//en.gravatar.com/avatar';

function modifySit () {
	var sn = $('#sitno').val();
	var nick = $('#nickname').val();
	if(nick === '') {
		$('.selected').removeClass('selected');
		$('.selected').removeClass('black-sit');
		return;
	}

	if(sn === '') {
		return;
	}

	$.post('/modify', {
			sitno: sn,
			nickname: nick,
			room: room_num,
		},
		function(data){
			if(data.msg !== 'success')
				return;
		},
		'json');
}

function clearSitWithSitno(sn){
	$.post('/modify',
		{sitno: sn, nickname: '', room: room_num},
		function(data){
			if(data.msg !== 'success')
				return
			$("#"+sn).attr('style', null);
		},
		'json');
}

function clearSit() {
	var sn = $("#sitno").val();
	if(sn === '') {
		return;
	}

	$.post('/modify',
		{
			sitno: sn,
			nickname: '',
			room: room_num
		},
		function(data){
			if(data.msg !== 'success')
				return

			$('#' + sn).attr('style', null);
			$('#' + sn).removeClass();
			$('#' + sn).addClass('sit');
			$('#' + sn).attr('title', '空');
		},
		'json');
}

function loadSits(callback) {
	/**********************************************
	 *  :param callback: The success callback
	 **********************************************/

	$.get('/list/?room=' + room_num, function(data) {
		if(data.msg !== 'success')
			return

		for(var k in data.seats) {
			var seat = data.seats[k];
			$('#' + seat.no).attr('title', seat.name);
			$('#' + seat.no).addClass('sitted');
		}
		if (isFunction(callback))
			callback();
	}, 'json');
}

function loadBlackList(callback) {
	/**********************************************
	 *  :param callback: The success callback
	 **********************************************/

	$.get('/black-list', function(data) {
		if(data.msg !== 'success')
			return;

		var list = data.list;
		console.log('black list: ', list);
		for(k in list) {
			$("a[title='"+list[k].name+"']").addClass('black-sit');
		}
		if (isFunction(callback))
			callback();
	}, 'json');
}

function initSocketIO(success_cb) {
	/*************************************************************************
	 *  :param success_cb: The callback after connect/reconnect successfully.
	 *************************************************************************/

	console.log('init socket.io');

	socket = io.connect('//' + location.hostname + ':' + location.port);

	socket.on('connect', function(){
		removeLoadingAnimation();
		if (isFunction(success_cb)) {
			success_cb();
		}
	})

	socket.on('reconnect', function(){
		removeLoadingAnimation();
		if (isFunction(success_cb)) {
			success_cb();
		}
	})

	socket.on('reconnecting', function(){
		$('.dark-cover').show();
		loadBlackList(function(){
			loadGravatars();
		})
	})

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

		console.log("IRC Message : " + from + " -> " + to + " : " + message);

		if(to !== ''
			&& $("a[title='" + to + "']").length != 0
			&& $("a[title='" + from + "']").length != 0) {
			var locFrom = $("a[title='" + from + "']").position();
			var locTo = $("a[title='" + to + "']").position();
			var rnd = Math.random();

			var bulletId = hex_md5('' + rnd);
			while(typeof bullets[bulletId] !== 'undefined') {
				rnd = Math.random();
				bulletId = hex_md5(rnd);
			}

			var bcvs = '<div id="' + bulletId + '" class="irc-bullet" style="top:' + (locFrom.top) + 'px; left:' + (locFrom.left)+ 'px;background-color: yellow;"></div>'
			var bullet = {
				from: from,
				to: to,
				locFrom: locFrom,
				locTo: locTo,
			};

			bullets[bulletId] = bullet;
			$('body').append(bcvs);

			console.log('locto', locTo);
			var magic = 4.34375
			$('#' + bulletId).animate({
					left: locTo.left + magic + 'px',
					top: locTo.top + magic + 'px',
				},
				2000
			 );
			 setTimeout(function(){
				 $('#' + bulletId).remove()
			 }, 2000)
		}

		html =  "<div class='msg-bubble'>" + message + "</div>";
		$(html).appendTo($("a[title='" + from + "']")).animate({
			bottom: '40px',
			opacity: 1,
		}, 500).delay(5500).fadeOut(400, function(){
			$(this).remove()
		})
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
		console.log('reload gra:', data);
		var nickname = data.ircNick;
		var emailHash = data.emailHash;
		loadGravatar(nickname, emailHash);
		console.log('change gra finished');
		loadBlackList();
	});
}

function loadGravatar(nickname, emailHash){
	var graURL = graApi + '/' + emailHash + '?d=mm&s=150';
	$('a[title="' + nickname + '"]').addClass('gravatar-sit');
	$('a[title="' + nickname + '"]').css('background-image' , 'url(' + graURL + ')');
}

function loadGravatars(callback) {
	/**********************************************
	 *  :param callback: The success callback
	 **********************************************/

	$.get('/list-gra', function(data) {
		if(data.msg !== 'success')
			return;

		var graList = data.list;
		console.log('gra list: ', data.list)
		for(var k in graList) {
			var nickname = graList[k].ircNick;
			var emailHash = graList[k].emailHash;
			var graURL = graApi + '/' + emailHash;
			loadGravatar(nickname, emailHash);
		}
		if (isFunction(callback))
			callback();
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

function init(){
	/**********************************************
	 *  Init order
	 *		*. loadSits();
	 *			*. loadBlackList();
	 *				*. loadGravatars();
	 *		*. initSocketIO();
	 **********************************************/
	room_num = $('#room').val();
	console.log('get room : ' + room_num);

	loadSits(function(){
		loadGravatars(function(){
			loadBlackList();
		})
	})
	initSocketIO();
}

function removeLoadingAnimation(){
	var loading = $('.dark-cover')
	if(loading.length > 0)
		$('.dark-cover').hide();
}

$(document).ready(function(){
	init();

	$('.sit').click(function(){
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

	$('#modify-trigger-btn').click(function(){
		$footer = $('.footer');
		if($footer.css('display') === 'none'){
			$footer.css('display', 'block');
		}
		else{
			$footer.attr('style', null);
		}
	})

	$('#help-btn').click(function(){
		help()
	})

	$('#modify-seat-btn').click(function(){
		modifySit()
	})

	$('#clear-seat-btn').click(function(){
		clearSit()
	})
});
