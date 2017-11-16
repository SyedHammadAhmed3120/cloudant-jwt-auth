var Joi = require('joi');

var user = {
    body: {
        _id: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().required(),
        roles: Joi.array().items(Joi.string())
    }
}

module.exports = user;