

exports.index = function(req, res){
	var room = req.params.room;
	if(room !== 'r0' && room !== 'r1' && room !== 'r2') {
		res.status(404);

		if (req.accepts('html')) {
			res.render('404', { url: req.url });
			return;
		}
	}
	
	console.log("get : " + room);

	
	res.render('index', {room: room});
	
	
	

};


