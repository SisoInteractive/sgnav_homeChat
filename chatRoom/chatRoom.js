var chalk = require('chalk');
var ChatBoxModel = require('../models/chatbox').model;
var MessageModel = require('../models/message').model;
var UserModel = require('../models/userbox').model;

module.exports = function (config) {
    var httpServer = require('http').createServer();
    var io = require('socket.io')(httpServer);

    io.on('connection', function(socket){
        console.log('a user connected');

        //  emit message history
        socket.on('get message history', function () {
            MessageModel.find({}, {_id: 0}).sort({createdDate: -1}).limit(50).exec(function (err, messages) {
                if (err) return error(err);
                socket.emit('message history', messages.reverse());
            });
        });

        //  save Message from Sender, broadcast it to another Clients
        socket.on('chat message', function (msg) {
            socket.broadcast.emit('broadcast', msg);

            ChatBoxModel.find({}).sort({createdTime: -1}).limit(1).exec(function (err, chatbox) {
                if (err) return error(err);

                chatbox = chatbox[0];

                var message = new MessageModel({
                    nickname: msg.nickname,
                    content: msg.content,
                    createdDate: new Date(),
                    isUser: msg.isUser
                });

                if (!chatbox) {
                    createNewChatbox(function (err, chatbox) {
                        if (err) return error(err);

                        saveMessage(message, chatbox);
                    });

                    return;
                }

                saveMessage(message, chatbox);
            });
        });

        //  return User Count
        socket.on('getUserCount', function () {
            UserModel.findOne({}, function (err, userbox) {
                if (err && !userbox) return socket.emit();

                socket.emit('sendUserCount', ++userbox.count);
                userbox.save();
            });
        });

        function saveMessage (message, chatbox) {
            message.save(function (err, message) {
                if (err) return error(err);

                chatbox.messages.push(message._id);
                chatbox.save(function (err) {
                    //  document maxSize
                    if (err) createNewChatbox(function (err, chatbox) {
                        if (err) return;
                        chatbox.messages.push(message._id);
                        chatbox.save();
                    })
                });
            });
        }

        function error (err) {
            console.log(chalk.red(err.stack));

            socket.emit('error', err);
        }
    });

    setup_IfUninitialized();

    //  listen the server
    httpServer.listen(config.socket_server.port, function(){
        console.log('ChatRoom Server listening on: ' + chalk.green(`localhost ${config.socket_server.port}`));
    });

    function setup_IfUninitialized () {
        ChatBoxModel.find({}, function (err, chatbox) {
            if (chatbox.length == 0) {
                createNewChatbox();
            }
        });

        UserModel.find({}, function (err, userbox) {
            if (userbox.length == 0) {
                userbox = new UserModel({
                    count: 0
                });

                userbox.save();
            }
        })
    }

    function createNewChatbox (fn) {
        var chatbox = new ChatBoxModel({
            messages: [],
            createdTime: new Date()
        });

        chatbox.save(function (err, chatbox) {
            fn && fn(null, chatbox);
        });
    }
};
