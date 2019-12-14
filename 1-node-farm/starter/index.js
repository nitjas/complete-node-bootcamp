// const is an ES6 way of declaring variables rather than var
const fs = require('fs'); // fs - file system functions for reading/writing to FS
const http = require('http'); // built in http module
const url = require('url'); // to analyze the URL

//////////////////////////////////////////////
// Top level code

// Synchronous file read, executed only once so not a problem
// Synchronous call is easier as it simply puts the data into a variable that we can use right away
// The secret is in knowing what is in top level code and executed only once at the beginning vs over and over again blocking the event loop
const replaceTemplate = (temp, product) => {

    // not a good practice to directly manipulate the arguments we pass in to a function
    // so the new variable output
    // not a const, but a let
    // let we can mutate after it's been created
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName); // use regex to replace all, not just the first one
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);

    // organic is special
    // if (product.organic)
    //     output = output.replace(/{%NOT_ORGANIC%}/g, ''); // remove ugly {%NOT_ORGANIC%}
    if (!product.organic)
        output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic'); // class name for display: none;

    return output;
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
// In JS we have JSON.parse built in
const dataObj = JSON.parse(data); // string -> JS object/array
// need the above object when we build our HTML templates

//////////////////////////////////////////////
// SERVER

// Create the server and start it to listen to incoming requests
// createServer aceepts a call back function which will be fired each time a new request hits our server
const server = http.createServer((req, res) => {
    // console.log(req.url); // can parse /overview?id=23&abc=2345

    // Different pathNames, different actions
    const pathName = req.url;

    // Overview page
    if (pathName === '/' || pathName === '/overview') {
        // load the template overview
        // can do this in top level code
        // these templates they will always be the same- read them to memory right in the beginning when you start the app
        res.writeHead(200, {'Context-type': 'text/html'});

        // loop with a map
        // loop over the data object array which holds all the products
        // in each iteration we will replace the placeholders in the template card with the current product which is el (ement)
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join(''); // if you dont have curly braces in arrow function the value is automatically returned so do NOT need explicit return
        console.log(cardsHtml);
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

        res.end(output);

    // Product page
    } else if (pathName === '/product') {
        res.end('No, you want the product!');

    // API
    } else if (pathName === '/api') {
        // fs.readFile('./dev-data/data.json'); // . represents the directory from which we run the node command
        // Read the file once in the beginning and simply send back data each time the route is hit
        // as of now each time someone hits the /api route the file is read and sent back, NO MORE!
        res.writeHead(200, {'Context-type': 'application/json'});
        res.end(data); // needs to send back string, not object

    // Not found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'heady stuff, this!'
        });
        // headers and status code needs to be set BEFORE we send out the response
        res.end('<h1>404!</h1>');
    }
});

server.listen(8000, '127.0.0.1', () => { // host address is optional
    console.log('Listening to requests on port 8000');
});
// app doesn't end like earlier, keeps running because of an event loop