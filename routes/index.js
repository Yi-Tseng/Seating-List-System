
/*
 * GET home page.
 */
var redis = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');

exports.index = function(req, res){
	var room = req.params.room;
	if(room !== 'r0' && room !== 'r1' && room !== 'r2') {
		res.status(404);

		if (req.accepts('html')) {
			res.render('404', { url: req.url });
			res.type('txt').send('Not found');
			res.end();
			return;
		}
	}
	
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


