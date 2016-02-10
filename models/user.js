var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/SeatingTable');

var SeatSchema = new Schema({
	room : String,
	no : String,
	name : String
});

exports.Seat = mongoose.model('Seat', SeatSchema);

var BlackListSchema = new Schema({
	name : String
});

exports.BlackList = mongoose.model('BlackList', BlackListSchema);

var GravatarSchema = new Schema({
	ircNick:String,
	emailHash:String
});

exports.Gravatar = mongoose.model('Gravatar', GravatarSchema);
