
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
var fs = require('fs');
var app = express();

// all environments
app.set('port', process.env.PORT || 8181);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// get pwd
console.log('getting password...');
var pwd = (fs.readFileSync('./config/pwd.txt')).toString();
console.log('got!');


// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io = require('socket.io').listen(server);


io.sockets.on('connection', function (socket) {

	socket.on('modify_sit', function(data) {

		if(data.sitno.length <= 8) {
			io.sockets.emit('sit_md', data);
		}
	});
	socket.on('clear_sit', function(data) {
		io.sockets.emit('sit_clr', data);
	});
	socket.on('reload_gravatar', function(data) {
		data.email = xss(data.email);
		data.ircNick = xss(data.ircNick);
		io.sockets.emit('reload_gravatar', data);
	});
	
});

// var client = new irc.Client('irc.freenode.net', 'SITCON_BOT', {
//     channels: ['#sitcon'],debug:true
// });

// client.addListener('error', function(message) {
//     console.log('error: ', message);
// });

// client.join('#sitcon sitcon_bot_pwd');

// client.addListener('message', function (from, to, message) {
// 	console.log("SITCON IRC : " + from + ' => ' + to + ': ' + message);
// 	message = xss(message);
// 	io.sockets.emit('irc_msg', {'from':from, 'to': to, 'msg':message});
// });

// path
app.get('/blablaadmin', admin.index);
app.post('/blablaadmin', function(req, res) {

	if(md5(req.body.pwd) !== pwd) {
		res.send({res:'err'});
		res.end();
	} else {
		console.log('Conf Msg : ' + req.body.conf_msg);
		io.sockets.emit('conf_msg', {'msg':req.body.conf_msg});
	}
});


app.get('/list', user.list);
app.post('/modify', user.modify);
app.get('/list-gra', user.getGra);
app.post('/add-gra', user.addGra);
app.get('/black-list', user.blackList);
app.post('/black-list', user.addBlack);
app.get('/:room', routes.index);
app.get('/', function(req, res) {
	res.redirect('/r0');
});
