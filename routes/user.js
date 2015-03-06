
/*
 * GET users listing.
 */

var winston = require('winston');
var xss = require('xss');
var escape = require('escape-html');
var mongoose = require('mongoose');
var md5 = require('MD5');
mongoose.connect('mongodb://localhost/SeatingTable');
var Schema = mongoose.Schema;
var escape = require('querystring').escape;

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

var sockets;

exports.setSockets = function(s) {
	sockets = s;
}

exports.list = function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var room = escape(req.query.room);
	var sitList;
	winston.info('[/list] access from ', ip);
	winston.info('[/list] room number ', room);

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
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/modify] access from ' + ip);

	var seatNo = escape(req.body.sitno);
	var nickname = escape(req.body.nickname);
	var room = escape(req.body.room);

	winston.info('SeatNo : ' + seatNo);
	winston.info('nickName : ' + nickname);
	winston.info('room : ' + room);
	

	if (seatNo === undefined || nickname === undefined || root === undefined) {
		res.send({'msg':'fail'});
		res.end();
	}

	if(nickname !== '' && seatNo !== '' && room !== '') {

		Seat.findOne({room:room, name:nickname}, function(err, data) {
			var oldSeat;
			if(err) {
				res.send({'msg':'fail'});
			} else if(data == null){
				var s = new Seat({room:room, name:nickname, no:seatNo});
				s.save(function(err){});
			} else {
				if(data.no === seatNo)
					return;
				oldSeat = data.no;
				data.no = seatNo;
				data.save(function(err){});
			}
			sockets.emit('sit_md', {
				sitno: seatNo,
				nickname: nickname,
				room: room,
				oldSeat: oldSeat
			});

			Gravatar.findOne({ircNick:nickname}, function(err, data) {
				if(!err && data != null) {
					sockets.emit('reload_gravatar', data);
				}
			});

			Seat.remove({name:nickname, room:{$ne:room}}, function(err, data){
				winston.info('Remove seat ' + data);
			});

			res.send({'msg':'success'})
			res.end();
		});

	} else if(nickname === '' && seatNo !== '' && room !== '') { 
		winston.info('[/modify] delete seat, room : ' + room + ', seatNo : ' + seatNo);

		Seat.remove({room: room, no: seatNo}, function(err, data) {
			if (err) {
				res.send({'msg': 'fail'});
			} else {
				res.send({'msg': 'success'});
				sockets.emit('sit_clr', {sitno: seatNo, room: room});
			}
			res.end();
		});
		res.send({'msg': 'success'});
		res.end();
	} else {
		res.send({'msg': 'fail'});
		res.end();
	}
	
};

exports.blackList = function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/blackList] access from ' + ip);

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
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/blackList] access from ' + ip);
	var name = escape(req.body.name);
	winston.info('[/blackList] add ' + name + ' to black list');

	if(name !== ''){

		// remove first.
		BlackList.remove({'name':name}, function(err, data) {});
		
		var bl = new BlackList({'name':name});
		bl.save(function(err, data){
			if(err) {
				res.send({msg:'error'});
				res.end();
			} else {
				winston.info('save success');
				res.send({msg:'success'});
				res.end();
			}
		});
		
	} else {
		res.send({'msg':'empty name'});
		res.end();
	}
}

exports.delBlack = function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/blackList] access from ' + ip);
	var name = escape(req.body.name);
	winston.info('[/blackList] delete ' + name + ' to black list');

	BlackList.remove({'name':name}, function(err, data) {
		if(err) {
			res.send({'res':'error'});
			res.end();
		} else {
			res.send({'res':'success'});
			res.end();
		}
	});
}

exports._addGra = function(ircNick, email) {
	var emailHash = md5(email);

	winston.info('[_addGra] ircNick : ' + ircNick + ', email : ' + emailHash);
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
						sockets.emit('reload_gravatar', {ircNick:ircNick, emailHash:emailHash});
					}
				});
			} else {
				data.emailHash = emailHash;
				data.save();
				sockets.emit('reload_gravatar', {ircNick:ircNick, emailHash:emailHash});
			}
		});
	} 
}

exports.addGra = function(req, res) {

	var ircNick = escape(req.body.ircNick);
	var emailHash = escape(req.body.emailHash);
	winston.info("[addGra] Nick : " + ircNick);
	winston.info("[addGra] Hash : " + emailHash);

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
						ircNick = escape(ircNick);
						emailHash = escape(emailHash);
						sockets.emit('reload_gravatar', {ircNick:ircNick, emailHash:emailHash});
					}
					res.end();
				});
			} else {
				data.emailHash = emailHash;
				data.save();
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
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	winston.info('[/list-gra] access from ' + ip);

	Gravatar.find({}, function(err, data) {
		if(err) {
			res.send({msg:'error'});
		} else {
			res.send({msg:'success', list:data});
		}
	});
}
