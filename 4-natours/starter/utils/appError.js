class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // status can be calculated from statusCode so not required to be passed in
    this.isOperational = true; // later we can test for this property and only send back error response for operational errors created using this class
    // capture the stack trace

    // 1st arguent is the current object with this keyword
    // 2nd argument is the AppError class itself which is this.constructor
    // this way when a new object is created and the constructor function is called then that function call is not gonna appear in the stack trace and will not pollute it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
