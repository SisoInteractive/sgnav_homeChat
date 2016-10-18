var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = {
    nickname: String,
    content: String,
    createdDate: Date
};

var message = new Schema(schema);

exports.model = mongoose.model('Message', message);
exports.schema = schema;
