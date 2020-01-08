const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // this is a function which upon calling will add a bunch of methods to our app variable

// 1) MIDDLEWARES
// the next 4 middlewares apply to all the routes
// middleware #1
// logger middleware only run in development
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // into this function morgan() we can pass an argument which will specify how we want the logging to look like.. there are some predefined strings like dev, common, tiny..
}

// middleware #2
app.use(express.json()); // express.json() is middleware

// serve static file
app.use(express.static(`${__dirname}/public`));

// define our own middleware
// in each middleware we have access to the request & response objects and we have the next function
// applies to each and every request since we did not specify any route

// middleware #4
app.use((req, res, next) => {
  // manipulate the request, add current time to the request
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
// look at /routes
// mount the routers
// more middleware inside each route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// none of the routers were able to catch this request if it got to here
// handle all the URLS for all HTTP verbs
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.method} ${req.originalUrl} on this server!`,
      404
    )
  );
});

// Error handling middleware
// to define an error handling middleware all we need to do is to give the middleware function four arguments
// express will then automatically recognize it as an error handling middle ware & only call it when there is an error
// like many others this middlware function is an error first function
app.use((err, req, res, next) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500; // default 500 Internal Server Error, because there will be errors that are coming from other places in the node application without status codes
  err.status = err.status || 'error';
  // statucCode = 5xx, status = error
  // statusCode = 4xx, status = fail

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
