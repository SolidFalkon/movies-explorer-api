const jwt = require('jsonwebtoken');
require('dotenv').config();

const LoginError = require('../errors/login-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    next(new LoginError('Необходима авторизация'));
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new LoginError('Необходима авторизация'));
  }

  req.user = payload;

  next();
};
