
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
var app = express();
var config = require('./config/config.js');

// all environments
app.set('port', process.env.PORT || config.server.port || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log('Socket connected!');
});

var client = new irc.Client(
	config.irc.server, 
	config.irc.bot_nick, 
	{
    	channels: [config.irc.channel], 
    	debug:true
	}
);

client.addListener('error', function(message) {
    console.log('error: ', message);
});

client.join(config.irc.channel + ' ' + config.irc.bot_pwd)

client.addListener('message', function (from, to, message) {
	console.log(config.irc.channel + " IRC : " + from + ' => ' + to + ': ' + message);
	if(!to.match(/HITCON_BOT[0-9]?/)) {
		message = xss(message);
		io.sockets.emit('irc_msg', {'from':from, 'to': to, 'msg':message});
	}
	
});

client.addListener('pm', function(from, message) {
	console.log('[PM] : ' + message);
	var splitArr = message.split(' ');
	var command = splitArr[0];
	console.log('command : ' + command);

	if(command === 'setGravatar') {
		var email = splitArr[1];
		user._addGra(from, email);
	}

});

// path
app.get('/admin', admin.index);
app.post('/admin', function(req, res) {
	var tmp = req.body.pwd;
	for(var c=0; c<128; c++) {
		tmp = md5(tmp);
	}

	if(tmp !== config.admin_pwd) {
		res.send({res:'err'});
		res.end();
	} else {
		io.sockets.emit('conf_msg', {'msg':req.body.conf_msg});
	}
});

user.setSockets(io.sockets);
app.get('/list', user.list);
app.post('/modify', user.modify);
app.get('/list-gra', user.getGra);
app.get('/black-list', user.blackList);
app.post('/black-list', user.addBlack);
app.get('/:room', routes.index);
app.get('/', function(req, res) {
	res.redirect('/r0');
});
