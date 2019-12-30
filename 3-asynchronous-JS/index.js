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
    // want to get 3 random dog images.. not just 1

    // simply awaiting the 3 API calls one after the other
    // 3 waits for 2 waits for 1- unnecessary waiting time
    /*
    const res1 = await superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    const res2 = await superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    const res3 = await superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    */
    // Instead of above, run many promises all at the same time
    // Do not await the first promise, just save the promise into a variable
    const pro1 = superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    ); // save the promise, not the resolved value of the promise
    const pro2 = superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    const pro3 = superagent.get(
      `https://dog.ceo/api/breed/${result}/images/random`
    );
    // await Promise.all, in to it pass an array of promises
    const all = await Promise.all([pro1, pro2, pro3]);
    // create an array of res.body.message(s), using maps
    const imgs = all.map(el => el.body.message); // map will loop thru the 'all' array, save the current value we return in each iteration (called el) into a new array called imgs
    console.log(imgs);

    await writeFilePro('dog-image.txt', imgs.join('\n'));
    console.log('Random dog image saved to file');
  } catch (err) {
    // throw the error so it is not marked successful if error
    console.log(err);
    throw err; // mark the entire promise as rejected
  }
  return '2: Ready 🐶'; // JS cannot know x will be this string at some point
  // if you really want to get this and log it to console then treat this async function as a promise or use Async/Await
};

// to make it work
console.log('1: Will get dog pics');
// const x = getDogPic(); // offload this to the background and go to the next line
// console.log(x); // x is a promise which is still pending, instead of logging Ready to console
// console.log('3: Done getting dog pics!');

// return values from async functions using Async/Await
// Don't want to create a whole new named function for this, which we'll have to call at some point later
// use a well known pattern IFFE - Immeditately Invoked Function Pattern
// (() => {})();
// in paranthesis we define our function and then call it right away
// async/await all the way without using then and catch
(async () => {
  try {
    // async calling async..
    const x = await getDogPic(); // declare a variable and then await the promise
    console.log(x);
    console.log('3: Done getting dog pics!');
  } catch (err) {
    // in future versions of JS this (err) will be gone but for now we have to write it even if we don't use it
    console.log('ERROR 🔥');
  }
})();
/*
// return values from async functions using then & catch
getDogPic()
  .then(x => {
    // getDogPic returns a promise, use the then method to access its future value
    // even if there was an error, it still resolves as a successful promise
    // that fact doesn't change even with a catch handler
    console.log(x);
    console.log('3: Done getting dog pics!');
  })
  .catch(err => {
    console.log('ERROR 🔥');
  });
*/

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
