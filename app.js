
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var admin = require('./routes/admin');
var md5 = require('MD5');
var http = require('http');
var path = require('path');
var irc = require('irc');
var xss = require('xss');
var escape = require('escape-html');
var app = express();
var config = require('./config/config.js');
var winston = require('winston');
var redis = require('socket.io/lib/stores/redis');
var redisConf = {
	host: config.redis.host,
	port: config.redis.port,
}

// all environments
app.set('port', process.env.PORT || config.server.port || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.cookieSecret));
app.use(express.cookieSession());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
// winston.add(winston.transports.File, { filename: 'log.log' });

var server = http.createServer(app).listen(app.get('port'), function(){
	winston.info('[Express] Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.set('store', new redis({
	redisPub: redisConf,
	redisSub: redisConf,
	redisClient: redisConf,
}));

io.on('connection', function (socket) {
	winston.info('[Socket] Socket connected!');
});

// path
app.get('/admin', admin.index);
app.post('/admin', function(req, res) {

	var tmp = req.body.pwd;
	if(typeof tmp === 'undefined'){
		return;
	}

	for(var c=0; c<128; c++) {
		tmp = md5(tmp);
	}

	if(tmp !== config.admin_pwd) {
		winston.info('[/admin] Password error!');
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
});

user.setSockets(io.sockets);
app.get('/list', user.list);
app.post('/modify', user.modify);
app.get('/list-gra', user.getGra);
app.get('/black-list', user.blackList);
app.post('/black-list', user.addBlack);
app.delete('/black-list', user.delBlack);

app.get('/:room', routes.index);
app.get('/', function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/] Access from ' + ip);
	res.redirect('/r0');
});
