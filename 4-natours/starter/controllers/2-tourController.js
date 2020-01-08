const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  // ?limit=5&sort=-ratingsAverage,price
  // everything is strings here
  // set these values of the query object to these values
  // Prefilling the query string on behalf of the user
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  // specify some fields so the user is not bombarded
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// route handlers
exports.getAllTours = async (req, res) => {
  // Express term - "the route handler" function
  // send back all data for this resource- all the tours
  // tours is the right starting point- since we are a tour selling website
  // don't have the blocking readFile inside this callback which will run inside the event loop
  // like to set status code explicitly

  // to get all tour documents simply use find() on the model
  try {
    // console.log(req.query);

    // BUILD QUERY
    // 1a) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // remove all these from our query object by looping
    // from the queryObj we want to remove the field (current element in array) with the name query element
    excludedFields.forEach(el => delete queryObj[el]);

    // 1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // we want to replace lt, lte, gt, gte using regex
    queryStr = queryStr.replace(/\b[gl]te?\b/g, match => `$${match}`);

    // investigate why ^..$ is not working..
    // queryStr = queryStr.replace(/^[gl]te?$/g, match => `$${match}`);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // simply the query without any await
    // change fron const to a regular variable, find() will return a query we will keep chaining more methods to it available on all documents created thru the query class
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      // const sortBy = req.query.sort.replace(/,/g, ' ');
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy); // say price
    } else {
      // add a default sort order, newest appear first
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // - is excluding
    }

    // 4) Pagination
    // page=2&limit=10
    // get the page and the limit from the query string and also define some default values
    const page = req.query.page * 1 || 1; // String to # & default value
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      // are we skipping more tours than we actually have
      const numTours = await Tour.countDocuments(); // returns a promise which will then come back with the # of documents
      // if skip > numTours then the page does not exist
      if (skip >= numTours) throw new Error('This page does not exist'); // if i throw an error in the try block it will then immediately move on to the catch black
    }

    // EXECUTE QUERY
    // query.sort().select().skip().limit()
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length, // not part of JSend, just like to send to client # of results
      data: {
        tours // ES6 key name = value name
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  // console.log(req.params); // req.params is where all the URL variables defined above are stored

  try {
    const tour = await Tour.findById(req.params.id);
    // shorthand for Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      status: 'success',
      tour
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  // in the real world you will have to check if the input data is valid, does not contain any malicious code

  // old way of doing things
  // const newTour = new Tour({});
  // newTour.save();

  // the easier and better way- call the create method right on the model itself
  // exact same as above.. difference being in this version we call the method directly on the tour, while before we were calling the method on the new document
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    // when can an error happen? Validation error.. required fields.. unique feilds.. then the promise is rejected
    // 400 Bad request
    res.status(400).json({
      status: 'failed',
      message: err // 'Invalid data sent!'
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // query for the document we want to update and then update it
    // can do that all in one command in mongoose update based on id
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the new, updated document so it can be sent back to client
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    // 204 no content
    res.status(204).json({
      status: 'success',
      data: null // to show the resource we deleted now no longer exists
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
};
