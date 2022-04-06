const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const USER = require('../models/users');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFindError = require('../errors/not-find-error');
const IncorrectDataError = require('../errors/incorrect-data-error');
const LoginError = require('../errors/login-error');
const RepeatEmailError = require('../errors/repeat-email-error');

module.exports.getUserInfo = (req, res, next) => {
  const owner = req.user._id;
  USER.findById(owner).orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new IncorrectDataError('пользователь не найден'));
      } else if (err.name === 'CastError') {
        next(new NotFindError('передается невалидный id'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  const owner = req.user._id;

  USER.findByIdAndUpdate(owner, { name, email }, { new: true, runValidators: true }).orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new IncorrectDataError('пользователь не найден'));
      } else if (err.code === 11000) {
        next(new RepeatEmailError('Пользователь с таким емайлом уже зарегестрирован'));
      } else if (err.name === 'ValidationError') {
        next(new NotFindError('переданы некорректные данные в метод обновления профиля'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => USER.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      const {
        name, email,
      } = user;
      res.status(200).send({
        data: {
          name, email,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new RepeatEmailError('Пользователь с таким емайлом уже зарегестрирован'));
      }
      if (err.name === 'ValidationError') {
        next(new NotFindError('переданы некорректные данные в метод создания пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return USER.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 36000000, httpOnly: true, sameSite: false })
        .send({
          data: {
            name: user.name,
            email: user.email,
          },
        });
    })
    .catch(() => {
      res.clearCookie('jwt');
      next(new LoginError('передан неверный логин или пароль.'));
    });
};
