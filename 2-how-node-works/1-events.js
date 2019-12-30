// we need to require the events module to use built-in node events
const EventEmitter = require('events');

const myEmitter = new EventEmitter(); // to create a new emitter we create an instance of the class we just imported
// can emit named events, we can subscribe to them/listen to them and react accordingly

// OBSERVER PATTERN
// Pretend we are building an online store
// set up the listeners using the on method on the listener object
// if there are multiple listeners for the same event then they will run sunchronously (one after the other) in the order that they were in the code
myEmitter.on('newSale', () => console.log('There was a new sale'));

// one of the nice things about these emitters is we can set up multiple listeners for the same event
myEmitter.on('newSale', () => console.log('Customer Name: Anant'));

// emit the event
myEmitter.emit('newSale'); // can make up any event name that we want, this is generating the event, like clicking on a button
// other events like newOrder, newCustomer,...
// can pass arguments to the listener by passing them as additional arguments (to callback function) in the emitter

myEmitter.on('newSale', stock => {
  console.log(`There are now ${stock} items left in stock.`);
});

myEmitter.emit('newSale', 9); // non-argument listeners will also respond to this event
