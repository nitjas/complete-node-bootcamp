const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel'); // the Tour model is where we want to write the Tours to

dotenv.config({ path: './config.env' }); // pass in an object to specify the path where our config file is located

// configure MongoDB
// connection string
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// returns a promise
mongoose
  .connect(DB, {
    // hosted DB version
    //   .connect(process.env.DATABASE_LOCAL, {
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

// READ JSON FILE
// convert it into JS object from JSON using JSON.parse
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    // create() can also accept an array of objects- create a new document for each of the objects in the array
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    // create() can also accept an array of objects- create a new document for each of the objects in the array
    await Tour.deleteMany(); // pass nothing to deleteMany() to delete all the documents in a certain collection
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE THEN IMPORT
const refreshData = async () => {
  try {
    // create() can also accept an array of objects- create a new document for each of the objects in the array
    await Tour.deleteMany(); // pass nothing to deleteMany() to delete all the documents in a certain collection
    console.log('Data successfully deleted!');
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
// --import and --delete
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--refresh') {
  refreshData();
} else {
  console.log('Use either --import or --delete or --refresh');
}

// console.log(process.argv);
