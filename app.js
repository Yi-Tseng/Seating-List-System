
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var irc = require('irc');
var xss = require('xss');

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

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/list', user.list);
app.post('/modify', user.modify);



var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io = require('socket.io').listen(server);


io.sockets.on('connection', function (socket) {

	socket.on('modify_sit', function(data) {
		io.sockets.emit('sit_md', data);
	});
	socket.on('clear_sit', function(data) {
		io.sockets.emit('sit_clr', data);
	});
	
});

var client = new irc.Client('irc.freenode.net', 'SITCON_BOT', {
    channels: ['#sitcon'],debug:true
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});

client.join('#sitcon takeshi0807');

client.addListener('message', function (from, to, message) {
	console.log("SITCON IRC : " + from + ' => ' + to + ': ' + message);
	message = xss(message);

	io.sockets.emit('irc_msg', {'from':from, 'msg':message});
});

