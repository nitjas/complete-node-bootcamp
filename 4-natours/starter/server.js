const app = require('./app');

// 4) START THE SERVER
const port = 3000;
app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});
