var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var barSchema = mongoose.Schema({
    name:String,
    going:Array
});

barSchema.plugin(findOrCreate);

module.exports = mongoose.model('Bar', barSchema, 'bars');