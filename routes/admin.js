var winston = require('winston');

exports.index = function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/admin] access from ' + ip);
	res.render('admin', {});
	res.end();
}