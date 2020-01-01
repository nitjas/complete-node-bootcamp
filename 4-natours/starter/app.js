const fs = require('fs');
const express = require('express');

const app = express(); // this is a function which upon calling will add a bunch of methods to our app variable

app.use(express.json()); // express.json() is middleware

// don't read data inside the route handler, do it before
// convert JSON in file to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// handle the /tours GET URL
// it is a good practice to specify API version
app.get('/api/v1/tours', (req, res) => {
  // Express term - "the route handler" function
  // send back all data for this resource- all the tours
  // tours is the right starting point- since we are a tour selling website
  // don't have the blocking readFile inside this callback which will run inside the event loop
  // like to set status code explicitly
  res.status(200).json({
    status: 'success',
    results: tours.length, // not part of JSend, just like to send to client # of results
    data: {
      tours // ES6 key name = value name
    }
  });
});

// GET with a variable id
app.get('/api/v1/tours/:id', (req, res) => {
  console.log(req.params); // req.params is where all the URL variables defined above are stored
  const id = req.params.id * 1; // nice trick to convert a number looking string '5' to a number 5

  // overly simplistic solution for non-existent ids
  if (id >= tours.length) {
    // invalid ID return immediately
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  const tour = tours.find(el => el.id === id); // .find() is a regular JS function that we can use on arrays

  // alternative for bad ID
  // if (!tour) {
  //   // invalid ID return immediately
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

// add a new tour
app.post('/api/v1/tours', (req, res) => {
  // in the real world you will have to check if the input data is valid, does not contain any malicious code
  // data from client is available in the req object
  // use a middleware (modify incoming request data)
  // console.log(req.body); // the body property is available on the request because we used middleware

  // figure out the id of the new object
  // since we don't have a DB, add 1 to the ID of the last object
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // could do a req.body.id = newId but do not want to mutate the original body object
  // push this tour into the tour array
  tours.push(newTour);
  // write back to file async this callback will run in the event loop
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), // stringify JSON object
    err => {
      // send the newly created object as the response
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
  // res.status(200).send('Done'); // always have to send back something to complete the request response cycle
});

// start a server
const port = 3000;
app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});
