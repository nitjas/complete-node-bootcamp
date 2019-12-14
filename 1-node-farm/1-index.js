// const is an ES6 way of declaring variables rather than var
const fs = require('fs'); // fs - file system functions for reading/writing to FS
const http = require('http'); // built in http module

//////////////////////////////////////////////
// FILES

// Blocking, synchronous way
// start at the home folder where index.js is located
// Synchronous means each statement is processed one after another, line by line
// fs module is required -> file is read -> log to console
// each line waits for the results of the previous line
// each line blocks the execution of the rest of the code
// can be a problem with slow operations
// synchronous code is also called blocking code. NOT good
// solution is to use asynchronous non blocking code
const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8');
console.log(textIn);

// ES6 template string w/ ``, rather than +
const textOut = `Avocado: ${textIn}\n Created: ${Date.now()}`;
console.log(textOut);
fs.writeFileSync('./starter/txt/output.txt', textOut);
console.log('File written');

// Non-blocking, asynchronous way
// In async code we offload heavy work to be done in the background
// when that work is done, a callback function that we registered is called to handle the result
// during this rest of the code can continue executing without being blocked by the heavy task
// defer our reaction into the future to make the code non-blocking, BETTER
// we are NOT blocking the execution here
// when the file is cmmpletely read , the callback function will be called
fs.readFile('./starter/txt/input.txt', 'utf-8', (err, data) => {
    console.log(data);
});
console.log('Reading file..');

// In readFile we do NOT have to specify the file encoding
// () => {}
// error first callback style is very typical in node.js
fs.readFile('./starter/txt/start.txt', 'utf-8', (err, text) => {
    console.log(text);
});
console.log('Reading another file..');

console.log('\n\n');

// Dialing it up a notch perform multiple steps in order
// How we can do multiple steps one after the other with call backs
// steps that depend on the result of previous step
// new ES6 syntax for writing functions- arrow functions
// doesn't get its own this keyword (uses parent function's called lexical this keyword)
// unlike normal functions which have their own this keyword
fs.readFile('./starter/txt/start.txt', 'utf-8', (err, data1) => {
    // if (err) return console.log('ERROR 💥');
    fs.readFile(`./starter/txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile(`./starter/txt/append.txt`, 'utf-8', (err, data3) => {
            console.log(data3);
            fs.writeFile('./starter/txt/finally.txt', `${data2}\n${data3}`, 'utf-8', err => { // there is no data we read, so error is the only argument
                console.log('File has been written 😊');
            });
        });
    });
});
console.log('Read one after another..');
// The registered call back is called as soon as the operation it is doing has finished

console.log('\n\n');

//////////////////////////////////////////////
// SERVER

// Create the server and start it to listen to incoming requests
// createServer aceepts a call back function which will be fired each time a new request hits our server
const server = http.createServer((req, res) => {
    // console.log(req);
    res.end('server says hello!');
});

server.listen(8000, '127.0.0.1', () => { // host address is optional
    console.log('Listening to requests on port 8000');
});
// app doesn't end like earlier, keeps running because of an event loop