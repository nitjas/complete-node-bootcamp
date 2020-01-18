const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // this is a function which upon calling will add a bunch of methods to our app variable

// 1) GLOBAL MIDDLEWARES
// the next 4 middlewares apply to all the routes
// middleware #1
// this will produce the middle ware function!
// in app.use we always need a function, not a function call
// this will return a function which will be sitting here until it is called
// best to use this helmet package early in the middleware stack so these headers are sure to be set
// this should be the 1st of all middlewares
// Set Security HTTP headers
app.use(helmet());

// Development logging
// logger middleware only run in development
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // into this function morgan() we can pass an argument which will specify how we want the logging to look like.. there are some predefined strings like dev, common, tiny..
}

// limit requests from same IP
const limiter = rateLimit({
  // how many requests per IP we are going to allow in a certain time 100 requests per hour per IP
  max: 100, // find the right balance on your own eso if you are an API developer
  windowMs: 60 * 60 * 1000, // it should not become unusable because of this limiter
  message: 'Too many requests from this IP, please try again in an hour!'
});
// app.use(limiter);
app.use('/api', limiter); // so we only limit access to our API route, we can do this with middle ware

// middleware #2
// body parser, reading data from the body into req.body
// let us limit the amount of data that comes in the body
// express.json() is middleware
// body more than 10 kilobytes will not be accepted
app.use(express.json({ limit: '10kb' }));

// DATA SANITIZATION MIDDLEWARE
// now that you have read the data, clean it
// Data sanitization against NoSQL query injection
// looks at the request body, the request query string and request.params and filters out all the $ and .
app.use(mongoSanitize());

// Data sanitization against XSS attacks
// clean the user input from malicious HTML code
// an attacker would try to insert some malicious HTML code with some JS code attached to it
// if it is injected into our HTML site- can cause damage
// mongoose validation itself is already verygood protection against XSS- won't allow crazy stuff in to DB
// add as much validation as you can to your schema will protect you from XSS at least on server side
app.use(xss());

// TODO: add some manually created sanitizing middleware using validator js

// Prevent parameter pollution - use it in the end to clear up the query string after sanitization
app.use(
  hpp({
    // array of properties for which we allow duplicates in the query string
    // TODO: do some complex stuff to get these field names from the model itself, otherwise this will grow big esp with other resources
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static file
app.use(express.static(`${__dirname}/public`));

// Test middleware
// define our own middleware
// in each middleware we have access to the request & response objects and we have the next function
// applies to each and every request since we did not specify any route
// middleware #4
app.use((req, res, next) => {
  // manipulate the request, add current time to the request
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
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
app.use(globalErrorHandler);

module.exports = app;
