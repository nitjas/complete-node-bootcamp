const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

// A simple schema for our tours
// into Schema() pass our schema as an object
const tourSchema = new mongoose.Schema(
  {
    // into Schema() pass our schema as an object, can also pass some options
    // mongoose uses the native JS datatypes
    // 1st object is schema definition
    name: {
      // pass in schema type options
      type: String,
      required: [true, 'A tour must have a name'], // validator - used to validate our data
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name cannot have more than 40 characters'], // error if longer
      minlength: [10, 'A tour name cannot have less than 10 characters']
      // validate: [validator.isAlpha, 'Tour name must be all letters'] // won't allow space also
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      // maximum # of people that can be on a tour
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      // one of easy. medium, difficult enforced via validators
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // enum: ['easy', 'medium', 'difficult']
      // a very nice and handy validator for Strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      // if we create a new tour document using the schema and not specify rating it would be set automatically
      default: 4.5,
      // not a required, because the user who creates tours wont specify these values
      // min & max also work with dates
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      // in the beginning there will be absolutely no reviews when the tour is new
      default: 0
      // not a required, because the user who creates tours wont specify these values
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // instead of message, validator can do it with an array as well, but it would look wierd
        message: 'Discount price of {VALUE} should be below regular price', // {VALUE} is internal to mongoose, nothing to do with JS
        validator: function(val) {
          // not an arrow function but a real function.. this points to current document ONLY when we are creating a new document
          // this function is not going to work on update
          // this only points to current doc on NEW document creation
          // if you don't need this variable then use arrow function
          return this.price >= val;
        }
      }
    },
    summary: {
      type: String,
      // not making it required, because it's not on the front page (overview) of our website
      // trim only works for strings, different schema types for different types like trim() in java
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    // the image we see on the overview page
    imageCover: {
      type: String, // simply the name of the image, which we will be able to read from the file system
      required: [true, 'A tour must have a cover image']
    },
    // rest of the images, multiple images saved as an array of Strings
    images: [String],
    createdAt: {
      // automatically created time stamp
      type: Date,
      // time stamp in ms to represent the current ms.. mongo converts it to today's date to make more sense of this data
      default: Date.now()
      // select: false
    },
    // array of start dates- different dates at which a tour starts, different instances of the tour starting at different dates
    // no default values here, will not be auto created by mongoDB, mongoDB will try to parse the String we try to pass in as a JS Date "2021-03-21" "2021-03-21, 11:32" or a Unix timestamp, throw an error if it cant parse the date
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false // usually the tours are not secret
    },
    // Embedding locations
    startLocation: {
      // we want to be allowed to leave the start location blank so not a required field
      // GeoJSON to specify geospatial data
      // this object is not for schema type options like above, but an embedded object inside which we can specify a couple of properties like type and coordinates each of these sub fields gets its own schema type options.. type and coordinates are the minimum properties we need to specify a location
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'] // start location will ALWAYS be a point, so is the only possible option
      },
      coordinates: [Number], // expect an array of numbers with longitude first, latitude second as per GeoJSON- reverse as per the usual for eg Google Maps
      address: String,
      description: String // description of the start location
    },
    locations: [
      // by specifying an array of object this will then create brand new documents inside of the parent document (tour)
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'] // cannot be anything but point
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number // day of the tour in which people will go to this location
      }
    ],
    guides: Array
  },
  {
    // 2nd object for options
    // each time the data is outputted as JSON we want virtuals to be true, to be part of the output
    toJSON: { virtuals: true },
    // also when the data gets outputted as an object
    toObject: { virtuals: true }
  }
);

// this virtual property will be created each time we get some data out of the DB
// get() is called getter()
// in that you pass a real function, not an arroe function
// we used a regular function here, because an arrow function does not get its own this keyword- which we need here
// this will be pointing to the current document
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() & .create(), but not on insertMnay()
// pre middleware to run before an actual event, in this case the save event
tourSchema.pre('save', function(next) {
  // called before an actual document is saved to the DB
  // in a save middleware the this keyword is gonna point to the curently processed document
  // create a slug for each of these documents based on the name
  // define a new property on this
  this.slug = slugify(this.name, { lower: true });
  next(); // without this you will be stuck in here for good
});

tourSchema.pre('save', async function(next) {
  // retreive the user documents corresponding to the array of user IDs in this.guides and embed them in tours
  // we need to await the findById promise and mark the function as async
  // there is a problem: map method will assign the result of each iteration to a new element in the guides array
  // async function returns a promise, so guides will be an array full of promises!
  // const guides = this.guides.map(async id => await User.findById(id));
  const guidesPromises = this.guides.map(async id => await User.findById(id));

  // now run all of these promises at the same time
  // over write the simple array of IDs with an array of user documents
  this.guides = await Promise.all(guidesPromises);
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document..');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// before the Tour.find() this pre find hook is executed
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  // find, findOne, findOneAndDelete, findOneAndUpdate,..
  this.find({ secretTour: { $ne: true } }); // this is a query object & we have to do it like this because the other objects are not set to false, they simply do not have this attribute
  this.start = Date.now();
  next();
});

// Specify the same middleware also for findOne()
// Not good, find and findOne use a regex instead
// tourSchema.pre('findOne', function(next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// has access to all the documents that were returned from the query
tourSchema.post(/^find/, function(docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  // Add a $match state to the beginning of each pipeline.
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

// create a model out of the schema above
// 1st arugment is name of the model with T in upper case- convention to use first letter upper case on model names & variables
const Tour = mongoose.model('Tour', tourSchema);

// this is the only thing we export from here
module.exports = Tour;
