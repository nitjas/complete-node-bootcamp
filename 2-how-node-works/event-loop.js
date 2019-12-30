const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1; // UV = libuv .. not working for me.. hmm!

setTimeout(() => console.log('Timer 1 finished'), 0); // Set a timer expires after 0 seconds
setImmediate(() => console.log('Immediate 1 finished'));

// move the timer and setImmediate to callback
fs.readFile('${__dirname}/starter/test-file.txt', () => {
  console.log('I/O finished');
  // The following happen inside an event loop
  setTimeout(() => console.log('Timer 2 finished'), 0); // Set a timer expires after 0 seconds
  setTimeout(() => console.log('Timer 3 finished'), 3000); // 3s

  // event loop waits for stuff to happen in the poll phase until there is an expired timer
  // if we scheduled a callbck using setImmediate then it will be executed after polling phase
  // even before timers
  // setTmmediate executes once per ti, while nextTick executes immediately
  // so their names should be switched!!
  // usually stick to only one- setImmediate and not nextTick
  setImmediate(() => console.log('Immediate 2 finished')); // 2nd to execute after I/O polling

  // nextTick is part of the micro tasks queue which get executed after each phase
  // nextTick the name is misleading- a Tick is actually an entire loop
  // but nextTick happens before the next phase and not the entire tic
  process.nextTick(() => console.log('process.nextTick')); // 1st to execute after I/O polling

  // sync blocking call - do NOT run in the event loop and will no longer be offloaded to the thread pool
  crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  console.log(Date.now() - start, 'sync password encrypted');

  crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  console.log(Date.now() - start, 'sync password encrypted');

  // Offloaded to thread pool
  // default 4 size of thread pool so each of these takes the same amount of time
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log(Date.now() - start, 'password encrypted');
  });
});

// top level code executes immediately
console.log('Hello from the top-level code');
