var express = require('express');
var Cloudant = require('cloudant');
var expressJoi = require('express-joi-validator');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var dotenv = require('dotenv');
dotenv.load();

var user = require('../models/user');
var verify = require('../auth/verify');

var cloudant = Cloudant({ 
    account: process.env.CLOUDANT_USERNAME,  
    password: process.env.CLOUDANT_PASSWORD 
}, function(err, cloudant) {
    if(!err) {
        console.log('Cloudant connected.');
    } else {
        console.log('Failed to connect Cloudant.');
    }
});

var db = cloudant.db.use(process.env.CLOUDANT_DATABASE);
var router = express.Router();

router.get('/users', verify.verifyUser, function(req, res, next){
    db.find({
        selector: { schema: 'User' }
    }, function(err, body) {
        if(!err) {
            res.status(200).json(body.docs);
        } else {
            return next(err);
        }
    });
});

router.post('/users/signup', expressJoi(user), function(req, res, next) {
    db.insert({
        _id: req.body._id,
        password: bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        roles: req.body.roles,
        schema: 'User'
    }, function(err, body) {
        if(!err) {
            return res.status(200).json({
                _id: req.body._id,
                email: req.body.email,
                roles: req.body.roles
            });
        } else {
            return next(err);
        }
    });
});

router.post('/users/signin', function(req, res, next) {
    db.find({
        selector: { _id: req.body._id }
    }, function(err, body) {
        if(!err) {
            var user = body.docs[0];
            
            if(user && bcrypt.compareSync(req.body.password, user.password)) {
                var payload = {
                    _id: user._id,
                    email: user.email,
                    roles: user.roles
                };
                
                var token = jwt.sign(payload, process.env.SECRET_KEY, {
                    expiresIn: 3600
                });
                
                return res.status(200).json({
                    token: token
                });
            } else {
                return res.status(401).json({ error: 'Incorrect id or password.' });
            }
        } else {
            return res.status(401).json({ error: 'Authentication failed.' });
        }
    });
});

module.exports = router;