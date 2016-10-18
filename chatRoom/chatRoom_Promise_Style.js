var chalk = require('chalk');
var ChatBox = require('../models/chatbox').model;
var Message = require('../models/message').model;

module.exports = function (config) {
    var httpServer = require('http').createServer();
    var io = require('socket.io')(httpServer);

    io.on('connection', function(socket){
        console.log('a user connected');
    });

    io.on('message', function (msg) {
        ChatBox.find({}).sort({createdTime: -1}).limit(1).exec(function (err, chatbox) {
            if (err) return error(err);

            var message = new Message({
                user: msg.user,
                content: msg.content,
                createdTime: new Date()
            });

            if (!chatbox) {
                new Promise(function (resolve, reject) {
                    createNewChatbox(function (err, chatbox) {
                        if (err) return reject(err);

                        resolve(chatbox);
                    });
                })
                .then(function (chatbox) {
                    message.save(function (err, message) {
                        if (err) return error(err);

                        chatbox.messages.push(message._id);
                        chatbox.save(function (err, chatbox) {
                            if (err) return reject(err);
                        });
                    });
                });
            }
        });
    });

    setup_IfUninitialized();

    //  listen the server
    httpServer.listen(config.socket_server.port, function(){
        console.log('ChatRoom Server listening on: ' + chalk.green(`localhost ${config.socket_server.port}`));
    });

    //  Promise Style
    function setup_IfUninitialized () {
        ChatBox.find({}, function (err, chatbox) {
            if (err) return error(err);

            if (!chatbox) {
                createNewChatbox().catch(function (err) {
                    error(err);
                });
            }
        });
    }

    function createNewChatbox () {
        return new Promise(function (resolve, reject) {
            var chatbox = new ChatBox({
                messages: [],
                createdTime: new Date()
            });

            chatbox.save(function (err, chatbox) {
                if (err) return reject(err);

                resolve(null, chatbox);
            });
        });
    }

    function error (err) {
        console.log(chalk.red(err.stack));

        io.emmit('error', { result: 500 });
    }
};