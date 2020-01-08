// catch asynchronous errors
// fn is an async function since we pass async into it which return promises
// when there is error in an async function the promise gets rejected
module.exports = fn => {
  // return an anonymous function that can be called by express as & when
  return (req, res, next) => {
    // catch the error here instead of in the try catch block
    // use the promise that the fn function returns
    // fn(req, res, next).catch(err => next(err));
    // we can simplify it
    fn(req, res, next).catch(next); // all the magic happens here
  };
};
