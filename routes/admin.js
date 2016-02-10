var winston = require('winston');
var config = require('../config/config.js');

exports.index = function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/admin] access from ' + ip);
	res.render('admin', {
		conference: config.conference,
		gaid: config.gaid,
	});
	res.end();
}

exports.postMsg = function(req, res) {
  	var tmp = req.body.pwd;
  	if(typeof tmp === 'undefined'){
  		return;
  	}

  	for(var c=0; c<128; c++) {
  		tmp = md5(tmp);
  	}

  	if(tmp !== config.admin_pwd) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      winston.info('[/admin] Password error from ip ' + ip);
  		res.send({res:'err'});
  		res.end();
  	} else {
  		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  		winston.info('[/admin] Password pass from ip ' + ip);
  		winston.info('[/admin] message : ' + req.body.conf_msg);

  		io.sockets.emit('conf_msg', {'msg':req.body.conf_msg});
  		res.send({res:'ok'})
  		res.end()
  	}
}
