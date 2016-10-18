var Message = require('../models/message').model;

exports.home = function (req, res) {
    if (req.query.token != 'a123456..') return res.send(403);

    Message.find({}).exec(function (err, messages) {
        if (err) return next(err);

        var context = {
            title: '丝瓜导航-首页聊天室内容管理',
            messages: messages.map(function (message) {
                var time = message.createdDate;
                return {
                    _id: message._id.toString(),
                    nickname: message.nickname,
                    content: message.content,
                    createdDate: time.getMonth() + '月' + time.getDate() + '日 ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
                };
            })
        };
        
        res.render('admin', context);
    });
};