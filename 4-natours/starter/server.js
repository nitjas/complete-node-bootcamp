const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // pass in an object to specify the path where our config file is located
const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env);

// 4) START THE SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});
