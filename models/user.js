var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    idAcc:String,
    token:String,
    displayName:String,
    username:String,
    photos:Array
});

module.exports = mongoose.model('User', userSchema, 'users');