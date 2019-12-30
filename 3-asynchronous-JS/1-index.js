// we are going to read the text file, and search the internet for an image of that dog breed
// and save that image to another text file
// 3 step process - using call backs inside of one another
// using the dog.ceo API
const fs = require('fs');
const superagent = require('superagent');

// async readFile
fs.readFile(`${__dirname}/starter/dog.txt`, (err, data) => {
  console.log(`Breed: ${data}`);
  // http request to dog.ceo using an npm package called superagent
  // start with npm init to create the package.json file

  // http get
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .end((err, res) => {
      // error handling, return right away with log to console
      if (err) return console.log(err.message);
      console.log(res.body);
      console.log(res.body.message);

      // save res.body.message into a new text file
      fs.writeFile('dog-image.txt', res.body.message, err => {
        // call back inside of call back inside of call back
        // can go up to 10 levels, messy & hard to maintain
        // if error saving file to disk
        if (err) return console.log(err.message);
        console.log('Random dog image saved to file');
      });
    });
});

// use a promise for the http call back
// superagent library has support for promises out of the box
// the get() method returns a promise
