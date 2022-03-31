const express = require('express');
const { celebrate, Joi } = require('celebrate');

const routes = express.Router();

const {
  updateUserInfo,
  getUserInfo,
} = require('../controllers/users');

routes.get('/me', getUserInfo);

routes.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateUserInfo);

module.exports = routes;
