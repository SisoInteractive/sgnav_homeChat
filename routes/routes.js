module.exports = function (app) {
    var express = require('express');
    var router = express.Router();

    var admin = require('./admin');
    var message = require('./message');

    router.get('/', function(req, res){
        res.render('index');
    });

    router.get('/admin', admin.home);
 
    router.delete('/message', message.deleteMessage);

    return router;
};
