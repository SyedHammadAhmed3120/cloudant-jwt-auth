var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var dotenv = require('dotenv');
dotenv.load();

var usersController = require('./controllers/usersController');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err
    });
});

app.use('/', usersController);

var port = process.env.PORT;
app.listen(port, function(){
    console.log('App running on port ' + port); 
});

module.exports = app;