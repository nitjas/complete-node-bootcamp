// const is an ES6 way of declaring variables rather than var
const fs = require('fs'); // fs - file system functions for reading/writing to FS

// start at the home folder where index.js is located
const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8');
console.log(textIn);

// ES6 template string w/ ``, rather than +
const textOut = `Avocado: ${textIn}\n Created: ${Date.now()}`;
console.log(textOut);
fs.writeFileSync('./starter/txt/output.txt', textOut);
console.log('File written');