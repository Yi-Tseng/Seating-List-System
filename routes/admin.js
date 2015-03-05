var winston = require('winston');
var config = require('../config/config.js');

exports.index = function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/admin] access from ' + ip);
	res.render('admin', {
		conference: config.conference,
		gaScript: config.gaScript,
	});
	res.end();
}
