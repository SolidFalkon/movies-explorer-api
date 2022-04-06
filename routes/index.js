const express = require('express');
const { celebrate, Joi } = require('celebrate');

const IncorrectDataError = require('../errors/incorrect-data-error');

const auth = require('../middlewares/auth');

const routes = express.Router();

const {
  createUser,
  login,
} = require('../controllers/users');

routes.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

routes.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

routes.use(auth, require('./users'));
routes.use(auth, require('./movies'));

routes.use(auth, (req, res, next) => {
  next(new IncorrectDataError('Такого запроса не существует'));
});

module.exports = routes;
