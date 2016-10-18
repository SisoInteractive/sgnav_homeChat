var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = {
    messages: [
        { type: Schema.Types.ObjectId, ref: 'MessageModel' }
    ],
    createdDate: Date
};

var chatBox = new Schema(schema);

exports.model = mongoose.model('ChatBox', chatBox);
exports.schema = schema;
