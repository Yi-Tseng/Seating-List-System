
/**
 * Module dependencies.
 */

var user = require('./routes/user');
var http = require('http');
var irc = require('irc');
var config = require('./config/config.js');
var winston = require('winston');
var escape = require('escape-html');
var redis = require('socket.io/lib/stores/redis');
var redisConf = {
	host: config.redis.host,
	port: config.redis.port,
}

var client = new irc.Client(
	config.irc.server,
	config.irc.bot_nick,
	{
    	channels: [config.irc.channel],
    	debug:true
	}
);

var io = require('socket.io').listen(process.env.PORT || config.irc.ws_port || 3001);

io.set('store', new redis({
	redisPub: redisConf,
	redisSub: redisConf,
	redisClient: redisConf,
}));

client.addListener('error', function(message) {
    winston.info('[IRC] error: ', message);
});

client.join(config.irc.channel + ' ' + config.irc.bot_pwd);

client.addListener('message', function (from, to, message) {
	winston.info("[IRC] channel : " + config.irc.channel + " from : " + from + ', to : ' + to + ', message : ' + message);

	if(!to.match(new RegExp(config.irc.bot_nick + '[0-9_]*'))) {
		message = escape(message);
		io.sockets.emit('irc_msg', {'from':from, 'to': to, 'msg':message});
	}
});

client.addListener('pm', function(from, message) {
	winston.info('[IRC-PM] get message : ' + message);
	var splitArr = message.split(' ');
	var command = splitArr[0];
	winston.info('[IRC-PM] command : ' + command);

	if(command === 'setGravatar') {
		var email = splitArr[1];
		user._addGra(from, email);
	}
});

user.setSockets(io.sockets);
