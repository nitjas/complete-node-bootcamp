const fs = require('fs');
const express = require('express');

const app = express(); // this is a function which upon calling will add a bunch of methods to our app variable

app.use(express.json()); // express.json() is middleware

// don't read data inside the route handler, do it before
// convert JSON in file to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// Get all tours
// create a new function, assign it the function
const getAllTours = (req, res) => {
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
};

const getTour = (req, res) => {
  // console.log(req.params); // req.params is where all the URL variables defined above are stored
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

  // alternative for bad ID but this is after find
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
};

const createTour = (req, res) => {
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
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;

  // validate ID
  if (id >= tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // find tour
  let tour = tours.find(el => el.id === id);

  // update properties
  // console.log(req.body);
  tour = Object.assign(tour, req.body);
  // console.log(tour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), // stringify JSON object
    err => {
      // send back updated tour object
      res.status(200).json({
        status: 'success',
        data: {
          tour
        }
      });
    }
  );
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;

  // validate ID
  if (id >= tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  for (var i = 0; i < tours.length; i++) {
    if (tours[i].id === id) {
      tours.splice(i, 1);
    }
  }

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), // stringify JSON object
    err => {
      // send back updated tour object
      // 204 no content
      res.status(204).json({
        status: 'success',
        data: null // to show the resource we deleted now no longer exists
      });
    }
  );
};

// handle the /tours GET URL
// it is a good practice to specify API version
// app.get('/api/v1/tours', getAllTours);

// Get tour by ID
// GET with a variable id
// app.get('/api/v1/tours/:id', getTour);

// add a new tour
// app.post('/api/v1/tours', createTour);

// Update tour
// app.patch('/api/v1/tours/:id', updateTour);

// Delete a tour
// app.delete('/api/v1/tours/:id', deleteTour);

app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// start a server
const port = 3000;
app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});
