//  App config file
const ENVIRONMENT = process.env.NODE_ENV;
var CONFIG = require('./config.json');
CONFIG = CONFIG[ENVIRONMENT || 'test'];

//  Dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var chalk = require('chalk');
var cors = require('cors');

//  App
var app = express();

//  App Config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('root', path.join(__dirname, 'public'));
app.set('config', CONFIG);

//  serve static Sources
app.use(express.static(app.get('root')));

//  Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: '*' }));

app.run = function (config) {
  //  connect Mongodb
  mongoose.connect('mongodb://localhost/' + config.database);
  // mongoose.set('debug', true);

  //  init Mongodb Schema register
  require('./models/models').init();

  require('./chatRoom/chatroom')(config);

  //  routes
  app.use(require('./routes/routes')(app));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers
  if (CONFIG.env_name === 'production') {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });
  } else {
    // development error handler
    // will print stacktrace
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  //  listen the Port
  app.listen(config.backend_server.port, function () {
    console.log('server running at: ' + chalk.green('http://localhost:' + config.backend_server.port));
  });
};

//  run App
app.run(CONFIG);

module.exports = app;
