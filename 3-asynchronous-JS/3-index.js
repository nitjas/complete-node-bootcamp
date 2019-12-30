// we are going to read the text file, and search the internet for an image of that dog breed
// and save that image to another text file
// 3 step process - using call backs inside of one another
// using the dog.ceo API
const fs = require('fs');
const superagent = require('superagent');

// promisefy readFile
// create a function that returns promise
// a readFile that receives only filename, no callback
// we are not changing readFile, simply creating a new function that behind the scenes
// still runs the built in readFile but returns a promise so we can use it instead of callback
const readFilePro = file => {
  // promise constructor takes in an executor function- which will get called immediately when the promise is created takes in two function arguments - resolve, reject functions
  return new Promise((resolve, reject) => {
    // executor function for all the asynchronous readFile work
    fs.readFile(file, (err, data) => {
      // resolve and reject in the executor function are both functions
      // in case there was an error
      if (err) reject('I could not find that file 😢'); // whatever we pass here will be the error that is late available in the catch method
      // calling resolve will mark the promise as fulfilled
      resolve(data); // whatever we pass in the resolve fuction will be later available as the
      // argument in the then method
    });
  }); // ES6
};

// promisefy writeFile
const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    // write data
    fs.writeFile(file, data, err => {
      // if error saving file to disk
      if (err) reject('Could not write a file 😒');
      resolve('Random dog image saved to file'); // a promise does not always have to return a meaningful value
    });
  });
};

// create async function
// async marks this function as an asynchronous function
// this is a function that keeps running in the background while performing the code in it, rest of the code keeps running in the event loop
// async functions do async work without ever block the event loop
// async function will also automatically return a promise
// a lot cleaner and easier to understand
const getDogPic = async () => {
  // inside an async function you can have 1 or more await expressions
  // await <<promise>>
  // await will stop the code here from running until this promise is resolved
  // if the promise is fulfilled then the value of the await expression is the resolved value of the promise
  try {
    const result = await readFilePro(`${__dirname}/starter/dog.txt`);
    console.log(`Breed: ${result}`);
    const res = await superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    console.log(res.body.message);

    await writeFilePro('dog-image.txt', res.body.message);
    console.log('Random dog image saved to file');
  } catch (err) {
    console.log(err);
  }
};

// to make it work
getDogPic();
/*
// chain the then handlers
readFilePro(`${__dirname}/starter/dog.txt`) // returns a promise
  .then(result => {
    // result is what we returned is the promise was successful with resolve
    console.log(`Breed: ${result}`);
    // http request to dog.ceo using an npm package called superagent
    // start with npm init to create the package.json file

    // http get using promise
    // return a promise
    return superagent.get(`https://dog.ceo/api/breed/${result}/images/random`);
  }) // end of callback which returns a promise chain to then of next
  .then(res => {
    // res result variable is the resolved value of superagent.get() promise
    // fulfilled promise
    console.log(res.body.message);

    return writeFilePro('dog-image.txt', res.body.message);
  }) // chain the next then
  .then(() => {
    // getting here we didn't have a meaningful resolved value so no args to call back
    console.log('Random dog image saved to file');
  })
  .catch(err => {
    // the beauty is for all these chained then handlers in the end we simply need one single catch handler - handling errors coming from either one of the three promises
    // rejected promise
    // error handling, return right away with log to console
    console.log(err);
  });
*/
