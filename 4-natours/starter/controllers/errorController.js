const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  // path name of field for which input data is in wrong format
  // value the wrong field value
  const message = `Invalid ${err.path}: ${err.value}.`;
  // transform the weird error from mongoose into an operational error with a nice friendly message that is more readable
  return new AppError(message, 400); // 400 for Bad Request
};

const handleUniquenessViolationDB = err => {
  // Extract The Forest Hiker from the errmsg
  // errmsg: 'E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: "The Forest Hiker" }',
  const value = err.errmsg
    .match(/{.*}/)[0]
    .replace(/["{}]/g, '')
    .split(':');
  // const value = err.errmsg.match(/".*"/)[0].replace(/"/g, '');
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // const message = `Duplicate field value: ${value}. Please use another value!`;
  const message = `Duplicate ${value[0].trim()}: ${value[1].trim()}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  // In order to create one big string out of all the strings from all the errors we have to loop over all the objects and extract all the error messages into a new array
  // In JS we use Object.values to loop over elements of an object
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

// take an error & return a new AppError
// ES6 arrow function we can write these one liners where don't even have to sepcify the curly braces and neither the return keyword
const handleJWTError = () =>
  new AppError('Invalid token. Please login again!', 401); // 401 Unauthorized

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details to client
  } else {
    // 1) Log error to console
    console.error('ERROR 🔥', err);

    // 2) Send a very generic error message to the client
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

// other functions will be helpers, only export this
module.exports = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500; // default 500 Internal Server Error, because there will be errors that are coming from other places in the node application without status codes
  err.status = err.status || 'error';
  // statucCode = 5xx, status = error
  // statusCode = 4xx, status = fail

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // not a good practice to overwrite the arguments of a function
    // so hard copy of error object
    let error = { ...err };

    // Handling invalid DB IDs
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // Unique field constraint violated
    if (error.code === 11000) error = handleUniquenessViolationDB(error);

    // Validation error
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    // Invalid JWT signature
    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    // Token expired
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (!error.message) {
      error.message = err.message; // TODO: why u don't work for return next(new AppError())
    }
    sendErrorProd(error, res);
  }
};
