const express = require('express');

const app = express(); // this is a function which upon calling will add a bunch of methods to our app variable

// define routes
// routing - to determine how an application responds to certain client requests/URL & HTTP method
// GET for root URL
// 2nd arg is a callback that specifies what should happen
// much easier than node.js
app.get('/', (req, res) => {
  // res.status(200).send('Hello from the server side!');
  res
    .status(200) // 200 is the default
    .json({ message: 'Hello from the server side!', app: 'Natours' }); // automatically sets Content-Type to application/json
});

app.post('/', (req, res) => {
  res.send('You can POST to this endpoint..');
});

// start a server
const port = 3000;
app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});
