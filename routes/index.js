
/*
 * GET home page.
 */
var redis = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');

exports.index = function(req, res){
	var room = req.params.room;
	console.log("get : " + room);
	var sitList;
	client.get(room, function(err, reply) {
		if(!err) {
			sitList = reply;
			console.log(sitList);
			if(sitList == null){
				sitList = "{}";
			}
			res.render('index', { 'sitList':sitList , 'room': room});
		} else {
			res.send({'msg':'fail'});
		}
		res.end();
		
	});
};


