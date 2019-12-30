console.log(arguments); // arguments is an array in JS, contains all the values that were passed into a function
// if something is printed to console it means we really are in a function
// all the code in this module is indeed wrapped into a wrapper function

console.log(require('module').wrapper); // wrapper property is the wrapper function
// template that node uses and then fills up its body with our code

// module.exports
// export and import data from one module into the other
const C = require('./test-module-1a'); // save the exported value to a variable when importing
// upper case names for a class, a class is what we exported

const calc1 = new C(); // create a new instance of calculator
console.log(calc1.add(3, 4));

// exports
// how & when to use the exports shorthand
const calc2 = require('./test-module-2'); // calc2 is the exports object
console.log(calc2.add(2, 5));

// since we are getting an object we can use the power of ES6 destructuring for some magic
const { add, multiply, divide } = require('./test-module-2'); // names from properties of the exports object
// the above destructuring will create a variable called multiply
// can also import only the ones we want
// const { add, multiply } = require('./test-module-2');
console.log(multiply(3, 5));

// caching
require('./test-module-3')(); // calling the function right away, without saving it to any variable
require('./test-module-3')();
require('./test-module-3')();
// this module was loaded only once, top level code will run only once
