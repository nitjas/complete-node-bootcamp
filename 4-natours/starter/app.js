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

// middleware #3
app.use((req, res, next) => {
  // code we want to execute here
  console.log('Hello from the middleware 🖐');
  // need to call next(), othewise the request/response cycle would be stuck at this point
  next(); // never forget, else no response will ever be sent to client
});

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

module.exports = app;
