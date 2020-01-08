const mongoose = require('mongoose');
const dotenv = require('dotenv');

// HANDLING UNCAUGHT EXCEPTIONS - should be at the top of our code especially before require('./app');
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 🔥 Shutting down..');
  console.log(err.name, err.message);

  // abrupt way of ending the program
  // immediately abort all the requests that are currently still running or pending.. not a good idea
  process.exit(1); // 0 - success, 1 - uncaught exception
  // crashing is compulsory after an uncaught exception the entire node process is in a so called unclean state.. terminate the process and then restart.. default for many hosting services
});

dotenv.config({ path: './config.env' }); // pass in an object to specify the path where our config file is located
// application only after we read the environment variable
const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env);

// configure MongoDB
// connection string
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// returns a promise
mongoose
  // .connect(DB, {
  // hosted DB version
  .connect(process.env.DATABASE_LOCAL, {
    // 2nd argument is an object to deal with some deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    // promise gets access to a connection object as the resolved value of the promise
    // console.log(con.connections);
    console.log('DB connection successful!');
  });
// .catch(err => console.log('ERROR')); // this will work but we want to create a global handler for rejected promises

// 4) START THE SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});

// FINAL SAFETY NET

// HANDLE UNHANDLED REJECTIONS
// Events and event listeners- each time that there is an unhandled rejection somewhere in our app the proess object will emit an object called Unhandled Rejection- just subscribe to that event
// we are listening to unhandledRejection event which then allows us to handle all the errors that occur in asynchronous code which were not previously handled
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 🔥 Shutting down..');
  console.log(err.name, err.message);
  // shut down gracefully, shutdown server and then exit
  // give the server time to finish pending requests
  server.close(() => {
    // abrupt way of ending the program
    // immediately abort all the requests that are currently still running or pending.. not a good idea
    process.exit(1); // 0 - success, 1 - uncaught exception
    // crashing is optional
  });
});
