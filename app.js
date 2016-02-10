
/**
 * Module dependencies.
 */

var express = require('express');

// middlewares for express
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieSession = require('cookie-session');
var serveStatic = require('serve-static');
var errorHandler = require('errorhandler');

var routes = require('./routes');
var user = require('./routes/user');
var admin = require('./routes/admin');
var md5 = require('MD5');
var http = require('http');
var path = require('path');
var xss = require('xss');
var app = express();
var config = require('./config/config.js');
var winston = require('winston');
var redis = require('socket.io-redis');
var redisConf = {
	host: config.redis.host,
	port: config.redis.port,
}

// all environments
app.set('port', process.env.PORT || config.server.port || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(cookieParser(config.cookieSecret));
app.use(cookieSession({keys:[config.cookieSecret]}));
app.use(serveStatic(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}
// winston.add(winston.transports.File, { filename: 'log.log' });

var server = http.createServer(app).listen(app.get('port'), function(){
	winston.info('[Express] Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.adapter(new redis({
	redisPub: redisConf,
	redisSub: redisConf,
	redisClient: redisConf,
}));

io.on('connection', function (socket) {
	winston.info('[Socket] Socket connected!');
});

// path
app.get('/admin', admin.index);
app.post('/admin', admin.postMsg);
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
