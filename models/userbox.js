var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = {
    count: Number
};

var userBox = new Schema(schema);

exports.model = mongoose.model('UserBox', userBox);
exports.schema = schema;






