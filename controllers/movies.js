const MOVIE = require('../models/movies');

const NotFindError = require('../errors/not-find-error');
const IncorrectDataError = require('../errors/incorrect-data-error');
const AnotherOwnerError = require('../errors/another-owner-error');

module.exports.getMovies = (req, res, next) => {
  MOVIE.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

module.exports.deleteMovieById = (req, res, next) => {
  MOVIE.findById(req.params.movieId).orFail()
    .populate(['owner'])
    .then((movie) => {
      if (movie.owner._id.toString() === req.user._id) {
        MOVIE.findByIdAndRemove(req.params.movieId).orFail()
          .populate(['owner'])
          .then((resMovie) => res.send(resMovie))
          .catch(next);
      } else {
        throw new AnotherOwnerError('У вас нет прав на это действие');
      }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new IncorrectDataError('фильм не найдена'));
      } else if (err.name === 'CastError') {
        next(new NotFindError('передается невалидный id'));
      } else {
        next(err);
      }
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;

  MOVIE.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotFindError('переданы некорректные данные в метод создания фильма'));
      } else {
        next(err);
      }
    });
};
