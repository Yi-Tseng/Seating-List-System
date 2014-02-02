
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
				reply = {};
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