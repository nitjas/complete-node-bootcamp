const express = require('express');
const morgan = require('morgan');

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
  // send back response in JSON, not the current HTML
  // just a regular JSend formatted response
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.method} ${req.originalUrl} on this server!` // originalUrl - URL that was requested
  });
});

module.exports = app;
