const fs = require('fs');

// following 3 execute in no particular order
// because they are not in an I/O cycle
// so it is not running inside of the event loop
// because it is not running inside of any call back function
setTimeout(() => console.log('Timer 1 finished'), 0); // Set a timer expires after 0 seconds
setImmediate(() => console.log('Immediate 1 finished'));

fs.readFile('${__dirname}/starter/test-file.txt', () => {
  console.log('I/O finished');
});

// top level code executes immediately
console.log('Hello from the top-level code');
