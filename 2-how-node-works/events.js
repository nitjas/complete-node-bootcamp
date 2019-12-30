// we need to require the events module to use built-in node events
const EventEmitter = require('events');
const http = require('http');

// const myEmitter = new EventEmitter();

// ES6 or ES2015 syntax for class inheritance
// also how different node modules like http, fs and other core modules implement events internally
class Sales extends EventEmitter {
  constructor() {
    super(); // get access to all the methods of the parent class
  }
}

const myEmitter = new Sales(); // to create a new emitter we create an instance of the class we just imported
// can emit named events, we can subscribe to them/listen to them and react accordingly

// 1-events.js works perfectly but in real life the best practice is to create a new class that inherits from the node event emitter

// OBSERVER PATTERN
// Pretend we are building an online store
// set up the listeners using the on method on the listener object
// if there are multiple listeners for the same event then they will run sunchronously (one after the other) in the order that they were in the code
myEmitter.on('newSale', () => console.log('There was a new sale'));

// one of the nice things about these emitters is we can set up multiple listeners for the same event
myEmitter.on('newSale', () => console.log('Customer Name: Anant'));

// emit the event
//myEmitter.emit('newSale');
// can make up any event name that we want, this is generating the event, like clicking on a button
// other events like newOrder, newCustomer,...
// can pass arguments to the listener by passing them as additional arguments (to callback function) in the emitter

myEmitter.on('newSale', stock => {
  console.log(`There are now ${stock} items left in stock.`);
});

myEmitter.emit('newSale', 9);

///////////////////////////////////////
/////////// Create a web server and listen to the event it emits
const server = http.createServer();

// .on() means the code is listening for an event
server.on('request', (req, res) => {
  console.log(req.url);
  console.log('Request received');
  res.end('Request received!');
});

server.on('request', (req, res) => {
  console.log('Another request received 😊');
});

// event fired when the server closes down
server.on('close', () => {
  console.log('Server closed');
});

// start the server, app won't shut down because event loop is waiting for incoming I/O
server.listen(8000, '127.0.0.1', () => {
  console.log('Waiting for requests..');
});
