const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express(); // this is a function which upon calling will add a bunch of methods to our app variable

// 1) MIDDLEWARES
app.use(morgan('dev')); // into this function morgan() we can pass an argument which will specify how we want the logging to look like.. there are some predefined strings like dev, common, tiny..
app.use(express.json()); // express.json() is middleware

// define our own middleware
// in each middleware we have access to the request & response objects and we have the next function
// applies to each and every request since we did not specify any route
app.use((req, res, next) => {
  // code we want to execute here
  console.log('Hello from the middleware 🖐');
  // need to call next(), othewise the request/response cycle would be stuck at this point
  next(); // never forget, else no response will ever be sent to client
});

app.use((req, res, next) => {
  // manipulate the request, add current time to the request
  req.requestTime = new Date().toISOString();
  next();
});

// Top level code
// don't read data inside the route handler, do it before
// convert JSON in file to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// 2) ROUTE HANDLERS
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
  console.log(req.requestTime);
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
    requestedAt: req.requestTime,
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

const getAllUsers = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const getUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const updateUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const deleteUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
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

// 3) ROUTES
// also middleware that apply to a certain kind of URL
const tourRouter = express.Router(); // create a new router & save it into this variable
const userRouter = express.Router();

// this is mounting a router - mounting a router on a new route
// cannot use the router before we declare them
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// we create a sub-app for each of these resources
tourRouter
  .route('/') // because the tourRouter middleware only runs on '/api/v1/tours' route anyway.. once we are in this router we are already at this ../tours so we want additionally just the root of that URL
  .get(getAllTours)
  .post(createTour);

tourRouter
  .route('/:id') // /api/v1/tours coming from parent route
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4) START THE SERVER
const port = 3000;
app.listen(port, () => {
  // this call back to be called as soon as the server starts listening
  console.log(`App running on port ${port}..`);
});
