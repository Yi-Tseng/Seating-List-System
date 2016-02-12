
/**
 * Module dependencies.
 */

var user = require('./routes/user');
var http = require('http');
var irc = require('irc');
var config = require('./config/config.js');
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'log.log' });
var escape = require('escape-html');
var redis = require('socket.io-redis');
var md5 = require('MD5');
var userModels = require('./models/user');
var Gravatar = userModels.Gravatar;

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

io.adapter(new redis({
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
    // escape SITCON-tgBot
    if(from === "SITCON-tgBot") {
      // msg example:
      // <EricTseng>: test
      var fromMth = message.match(new RegExp('<[^>]+>'));
      var msgMth = message.match(new RegExp(': .*'));
      if(fromMth !== null && msgMth !== null) {
        // if match name, extract name
        from = fromMth[0];
        from = from.substr(1, from.length-2);
        message = msgMth[0];
        message = message.substr(1);
      }
    }

    if(!to.match(new RegExp(config.irc.bot_nick + '[0-9_]*'))) {
    message = escape(message);
    io.sockets.emit('irc_msg', {'from':from, 'to': to, 'msg':message});
    }
    });

client.addListener('pm', function(from, message) {
    winston.info('[IRC-PM] get message : ' + message);
    var splitArr = message.split(' ');
    if(splitArr.length < 2) {
    return;
    }
    var command = splitArr[0];
    winston.info('[IRC-PM] command : ' + command);

    if(command === 'setGravatar') {
    var email = splitArr[1];
    addGra(from, email);
    }
    });

function addGra(ircNick, email) {
  var emailHash = md5(email);

  winston.info('[addGra] ircNick : ' + ircNick + ', email : ' + emailHash);
  if(ircNick !== '' && emailHash !== '') {
    Gravatar.findOne({ircNick:ircNick}, function(err, data) {
        if( data == null) {
        var gra = new Gravatar({ircNick:ircNick, emailHash:emailHash});
        gra.save(function(err){
          if(err) {
          console.log(err);
          } else {

          ircNick = escape(ircNick);
          emailHash = escape(emailHash);
          io.sockets.emit('reload_gravatar', {ircNick:ircNick, emailHash:emailHash});
          }
          });
        } else {
        data.emailHash = emailHash;
        data.save();
        io.sockets.emit('reload_gravatar', {ircNick:ircNick, emailHash:emailHash});
        }
        });
  }
}
