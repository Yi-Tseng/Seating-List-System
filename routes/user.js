
/*
 * GET users listing.
 */

var xss = require('xss');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SeatingTable');
var Schema = mongoose.Schema;

var SeatSchema = new Schema({
	room : String,
	no : String,
	name : String
});

var Seat = mongoose.model('Seat', SeatSchema);

var BlackListSchema = new Schema({
	name : String
});

var BlackList = mongoose.model('BlackList', BlackListSchema);

var GravatarSchema = new Schema({
	ircNick:String, 
	emailHash:String
});

var Gravatar = mongoose.model('Gravatar', GravatarSchema);

exports.list = function(req, res) {
	var room = req.query.room;
	var sitList;

	Seat.find({room:room}, function(err, data) {
		if(err) {
			res.send({msg : 'fail'});
		} else {
			res.send({msg:'success', seats : data})
		}
		res.end();
	});
	
};

exports.modify = function(req, res) {
	console.log('modify');
	// console.log(req.body);

	var seatNo = req.body.sitno;
	var nickname = req.body.nickname;
	var room = req.body.room;

	console.log('SeatNo : ' + seatNo);
	console.log('nickName : ' + nickname);
	console.log('room : ' + room);

	
	if(nickname !== '' && seatNo !== '' && room !== '') {
		Seat.findOne({room:room, name:nickname}, function(err, data) {
			if(err) {
				res.send({'msg':'fail'});
			} else if(data == null){
				var s = new Seat({room:room, name:nickname, no:seatNo});
				s.save(function(err){});
			} else {
				data.no = seatNo;
				data.save(function(err){});
				// Seat.update({room:room, name:nickname, no:seatNo});
			}
			res.send({'msg':'success'})
			res.end();
		});
	} else if(nickname === '' && seatNo !== '' && room !== '') { 
		// delete seat
		console.log('delete');
		Seat.remove({room:room, no:seatNo}, function(err, data) {
			if (err) {
				res.send({'msg':'fail'});
			} else {
				res.send({'msg':'success'});
			}
			res.end();
		});

		

	} else {
		res.send({'msg':'fail'});
		res.end();
	}
	
};

exports.blackList = function(req, res) {
	BlackList.find({}, function(err, data) {
		if(err) {
			res.send({msg:'fail'});
		} else {
			res.send({msg:'success', list:data});
		}
		res.end();
	});
}

exports.addBlack = function(req, res) {
	var name = req.body.name;
	console.log('add ' + name + ' to black list');
	if(name !== ''){
		var bl = new BlackList({'name':name});
		bl.save(function(err){
			if(err) {
				res.send({msg:'error'});
			} else {
				res.send({msg:'success'});
			}
			res.end();
		});
	} else {
		res.send({'msg':'empty name'});
		res.end();
	}
}

exports.addGra = function(req, res) {

	var ircNick = req.body.ircNick;
	var emailHash = req.body.emailHash;
	console.log("Nick : " + ircNick);
	console.log("Hash : " + emailHash);
	if(ircNick !== '' && emailHash !== '') {
		Gravatar.findOne({ircNick:ircNick}, function(err, data) {
			if(err) {
				res.send({'res':'error'});
				res.end();
			} else if( data == null) {
				var gra = new Gravatar({ircNick:ircNick, emailHash:emailHash});
				gra.save(function(err){
					if(err) {
						res.send({'res':'error'});
					} else {
						res.send({'res':'success'});		
					}
					res.end();
				});
			} else {
				data.emailHash = emailHash;
				data.save();
				// console.log('save ' + data);
				res.send({'res':'success'});
				res.end();
			}
		});

		
	} else {
		res.send({'res':'error'});
		res.end();
	}
}

exports.getGra = function(req, res) {
	Gravatar.find({}, function(err, data) {
		if(err) {
			res.send({res:'error'});
		} else {
			res.send({res:'success', list:data});
		}
	});
}

