const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

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
// add next because we need next() to pass the error into it so that the error can then be handled in the global error handling middleware
exports.getAllTours = catchAsync(async (req, res, next) => {
  // Express term - "the route handler" function
  // send back all data for this resource- all the tours
  // tours is the right starting point- since we are a tour selling website
  // don't have the blocking readFile inside this callback which will run inside the event loop
  // like to set status code explicitly

  // to get all tour documents simply use find() on the model
  // BUILD QUERY
  // 1a) Filtering
  // 1b) Advanced filtering
  // 2) Sorting
  // 3) Field limiting
  // 4) Pagination

  // EXECUTE QUERY
  // Chain the methods one after the other
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // query.sort().select().skip().limit()
  const tours = await features.query;

  // 0 tours in result is not an error

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length, // not part of JSend, just like to send to client # of results
    data: {
      tours // ES6 key name = value name
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // console.log(req.params); // req.params is where all the URL variables defined above are stored

  const tour = await Tour.findById(req.params.id);
  // shorthand for Tour.findOne({ _id: req.params.id });

  // tour is null, null is false in JS
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // in the real world you will have to check if the input data is valid, does not contain any malicious code

  // old way of doing things
  // const newTour = new Tour({});
  // newTour.save();

  // the easier and better way- call the create method right on the model itself
  // exact same as above.. difference being in this version we call the method directly on the tour, while before we were calling the method on the new document
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // query for the document we want to update and then update it
  // can do that all in one command in mongoose update based on id
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the new, updated document so it can be sent back to client
    runValidators: true
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 204 no content
  res.status(204).json({
    status: 'success',
    data: null // to show the resource we deleted now no longer exists
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // manipulate the data in a couple of different steps
  // define these steps- pass in an array of stages
  // returns an aggregate object
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } } // query
    },
    {
      // group stage
      $group: {
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage', // 'cause why not..
        numTours: { $sum: 1 }, // Add 1 for each document that passes thru this pipeline
        numratings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      // sort stage
      // in sorting we need to use the field names we specified in the group, we can no longer use the old names because at this point they are already gone, they no longer exist
      $sort: { avgPrice: 1 } // 1 for ascending, -1 for descending
    }
    // {
    //   // we can repeat stages, let's do anothre match here
    //   $match: { _id: { $ne: 'EASY' } } // id is now the difficulty from group stage
    //   // all the documents that are NOT EASY
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    // define an object & then the name of the stage
    {
      $unwind: '$startDates' // the field with the array that we want to unwind
    },
    {
      // select the documents for the year that was passed in
      // match is to select documents
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // year-month-day
          $lte: new Date(`${year}-12-31`)
          // $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      // group stage
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 }, // Add 1 for each document that passes thru this pipeline
        tours: { $push: '$name' } // which tours send in an array, otherwise how to have multiple tours in one field
      }
    },
    {
      // sort stage
      // in sorting we need to use the field names we specified in the group, we can no longer use the old names because at this point they are already gone, they no longer exist
      $sort: { numTours: -1 } // 1 for ascending, -1 for descending
    },
    // {
    //   $limit: 1
    // },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0 // hide _id from the output
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
