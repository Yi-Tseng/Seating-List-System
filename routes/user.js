
/*
 * GET users listing.
 */

var redis = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');
var xss = require('xss');

client.on("error", function(error) {
    console.log(error);
});

exports.list = function(req, res) {
	var room = req.query.room;
	var sitList;
	client.get(room, function(err, reply) {
		if(!err) {
			sitList = reply;
			// console.log(sitList);
			res.send({'msg':'success', 'sits':sitList});
		} else {
			res.send({'msg':'fail'});
		}
		res.end();
		
	});
	
};

exports.modify = function(req, res) {
	console.log('modify');
	// console.log(req.body);

	var sitno = req.body.sitno;
	var nickname = req.body.nickname;
	var room = req.body.room;

	client.get(room, function(err, reply) {
		if(err) {
			res.send({'msg':'fail'});
		} else {
			if(reply === null) {
				reply = "{}";
			}
			reply = JSON.parse(reply);
			if(nickname !== '') {
				nickname = xss(nickname);
				reply[sitno] = nickname;
			} else {
				delete reply[sitno];
			}
			client.set(room, JSON.stringify(reply));
			res.send({'msg':'success'})
		}
		res.end();
	});
};

exports.blackList = function(req, res) {

	client.get('blackList', function(err, reply) {
		if(reply == null) {
			reply = "[]";
		}
		var bl = JSON.parse(reply);
		res.send({'msg':'success', 'list': bl});
		res.end();
	});
	
}

exports.addBlack = function(req, res) {
	var name = req.body.name;
	if(name !== ''){
		client.get('blackList', function(err, reply) {
			if(reply == null) {
				reply = "[]";
			}
			var bl = JSON.parse(reply);
			bl.push(name);
			client.set('blackList', JSON.stringify(bl));

			res.send({'msg':'success', 'list': bl});
			res.end();
		});
	} else {
		res.send({'msg':'empty name'});
		res.end();
	}
}

exports.addGra = function(req, res) {

	var ircNick = req.body.ircNick;
	var email = req.body.email;
	email = email.toLowerCase();

	if(ircNick !== '' && email !== '') {
		client.get('gravatar', function(err, reply) {
			if(reply == null) {
				reply = "{}";
			}
			var list = JSON.parse(reply);
			list[ircNick] = email;
			console.log('nick : ' + ircNick);
			console.log('email : ' + email);
			console.log(JSON.stringify(list));

			client.set('gravatar', JSON.stringify(list));
			res.send({'res':'success', 'list':list});
			res.end();
		});
	} else {
		res.send({'res':'error'});
		res.end();
	}
}

exports.getGra = function(req, res) {
	client.get('gravatar', function(err, reply) {
		if(reply == null) {
			reply = "{}";
		}
		res.send({'res':'success', 'graList':reply});
		res.end();
	});
}

