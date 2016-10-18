var Message = require('../models/message').model;

exports.deleteMessage = function (req, res, next) {
    var query = {};

    if (req.query.id) query._id = req.query.id;
    else if (req.query.nickname) query.nickname = req.query.nickname;
    else return res.send(400);

    Message.find(query).remove().exec(function (err) {
        if (err) return next(err);
        res.send(200);
    });
};