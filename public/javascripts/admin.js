
function sendConfMsg() {
	var cmsg = $('#conf_msg').val();
	var pwd = $('#pwd').val();
	$.post('/admin', 
		{pwd:pwd, conf_msg:cmsg}, 
		function(data) {
			if(data.res === 'err') {
				$('#conf_msg').val('密碼錯誤！');
			} else {
				$('#conf_msg').val('');
			}
			$('btn_send').attr('disabled', true);
			setTimeout(function() {
				$('btn_send').attr('disabled', false);
			}, 10000);
		}, 
		'json'
	);
}