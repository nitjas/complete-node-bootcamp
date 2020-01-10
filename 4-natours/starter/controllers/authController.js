// const util = require('util');
// since we are only going to use promise-ify just one method a better way is to destructure the object and take promise-ify directly from there
const crypto = require('crypto');
const { promisify } = require('util'); // ES6 destructuring is all
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // adds some additional data to the payload but thats OK
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendCookie = (user, statusCode, res) => {
  const token = signToken(user._id);

  // send a cookie by attaching it to the response object
  // jwt - name of the cookie
  // 2nd argument data we want to send in the cookie
  // options
  const cookieOptions = {
    // 90d is meaningkess in JS but the jsonwebtoken package can work with this format
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ), // client will delete the cookie after it has expired 90 days to millisecs
    // secure: true, // ONLY in production cookie will only be sent on an encrypted connection HTTPS
    httpOnly: true // cookie cannot be accessed or modified in any way by the browser important to prevent XSS attacks
    // browser will receive it, store it and send it along with every request
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // stop showing the password even on create
  user.password = undefined;

  if (statusCode === 200) {
    res.status(statusCode).json({
      status: 'success',
      // sending this token is all we need to do to log in a user
      token
    });
  } else {
    // 201 Created
    res.status(statusCode).json({
      status: 'success',
      // sending this token is all we need to do to log in a user
      token,
      data: {
        user
      }
    });
  }
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  if (statusCode === 200) {
    res.status(statusCode).json({
      status: 'success',
      // sending this token is all we need to do to log in a user
      token
    });
  } else {
    // 201 Created
    res.status(statusCode).json({
      status: 'success',
      // sending this token is all we need to do to log in a user
      token,
      data: {
        user
      }
    });
  }
};

// signup as opposed to createUser as it has more meaning in the context of authentication
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  // 1st argument payload object for all the data that we are going to store inside the token.. in this case only the id nothing fancy and not a lot of data
  // 2ns a string for our secret - config file is a perfect place to store this kind of secret data
  // the token header will be created automcatically
  // options- when the JWT should expire - after this time the JWT is no longer valid even if correctly verified
  // 90d 10h 5m 3s or a pure number which is treated as milliseconds
  // 90d is standard
  createAndSendCookie(user, 201, res); // 201 Created
  // const token = signToken(user._id);

  // // 201 Created
  // res.status(201).json({
  //   status: 'success',
  //   // sending this token is all we need to do to log in a user
  //   token,
  //   data: {
  //     user
  //   }
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  // read email and password from body
  // const email = req.body.email;
  // do the above with ES6 destructuring
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400)); // Bad Request
  }

  // 2) Check if the user exists && password is correct
  // explicitly select password since it is select: false with a +
  const user = await User.findOne({ email }).select('+password'); // ES6

  // if no user then error so move it to the if block
  // const correct = await user.correctPassword(password, user.password);

  // could have done this separately first the user and then the password
  // but then you give a potential attacker information whether the email is correct
  // this one is more vague.. go figure attacker!
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401)); // Unauthorized
  }

  // 3) If everything OK, send token to client

  // all we want as a response for logging in is the token
  createAndSendCookie(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exists
  // authorization: 'Bearer asdjaslkfhweifuhsfhasfhasldfkhasd'
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Can't define a variable inside of an if block
    // const & let the new ES6 variable declarators are block scoped
    // token = req.headers.authorization.split(' ')[1];
    token = req.headers.authorization.replace(/\s+/g, ' ').split(' ')[1];
  }

  // if the token actually exists
  if (!token) {
    // create a new error
    return next(
      // data in the request may be correct, but that's not enough to get access to the requested resource
      new AppError('You are not logged in! Please log in to get access.', 401) // 401 Unauthorized
    );
  }
  // 2) Validate the token- Super important verification step
  // Valid token - No one tried to change the payload (user id for the user for whom the token was issued)
  // OR if the token has already expired
  // 3rd paramter is a call back function which runs as soon as the verification has been completed
  // verify is an async function
  // we've been working with promises, let's not break that pattern, so promise-ify verify with the built in node function
  // to use that we need to require the build in util module
  // we could add a try catch block, in the catch create errors that will be sent to the client
  // but we don't like to do error handler in our middleware fuctions
  // delegate error handling to global error controller
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // returns decoded payload from JWT

  ///// Most online tutorials stop here
  // What if the user has been deleted in the meantime, token will exist- but the user isn't there
  // What if the user has changed his password after the token has been issued
  // Imagine someone stole the JWT from a user, to protect against that the user changes his password
  // Old token before password change should no longer be accepted to access protected routes

  // 3) Check if user who's trying to access the route still exists
  // this is why we have id in the payload, so we can query for that user
  // we can be 100% sure the id is correct because if we made it so far, that means verification was successful
  // we are sure that the user for which we issued the JWT is exactly the one whose id is now inside the decoded payload
  const currentUser = await User.findById(decoded.id); // not a new user
  if (!currentUser) {
    return next(new AppError('Invalid user', 401));
    // return next(new AppError('The user for this token no longer exists', 401));
  }

  // 4) Check if the user changed password after the JWT (token) was issued
  // Create an instance method that will be available on all the documents
  // documents are instances of a model
  // we do this because it is quite a lot of code which belongs to the user model & not to the controller
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Invalid user', 401)); // 401 Unauthorized
    // return next(new AppError('User recently changed password! Please login again.', 401));
  }

  // If no problem in above 4 steps then give access to the route we are protecting
  // put the entire user data on the request
  // stroing the role onto the user is crucial
  req.user = currentUser; // this might be useful at some point in the future, in  a next middleware function for authorization against roles in restrictTo()
  // this request object travels from middleware to middleware
  // pass data from middleware to middleware
  next();
});

// we want to pass arguments to this middleware function, usually does not work that way
// create a wrapper function which will them return the middleware function that we want to create
// ...roles will create an array of all the arguments that were specified
exports.restrictTo = (...roles) => {
  // right away we will return a fucntion which is the middleware function itself
  return (req, res, next) => {
    // this function will get access to roles parameter because there is a closure
    // roles is an array ['admin', 'lead-guide']
    // where is the role of the current user stored?
    // protect always runs before restrictTo.. that will attach user role to request
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403) // 403 Forbidden
      );
    }
    next();
  };
};

// 2 steps-
// 1. forgotPassword = user sends a POST request to a forgot password route with only his email address, this will then create a reset token, send that to the email address that was provided- just a simple random token not a JSON web token
// 2. resetPassword = The user then sends that token from his email along with a new password in order to update his password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email }); // findOne because we do not know the user's id, user also doesn't know his id
  // verify the user exists
  if (!user) {
    // return next(new AppError('Invalid User', 404));
    return next(new AppError('There is no user with that email address', 404)); // 404 Not found
  }

  // 2) Generate the random token
  // we are going to create an instance method on the user as it has to do with the user data itself
  // & it is not a 1 line code, with mongoose best to have it as an instance method
  const resetToken = user.createPasswordResetToken();

  // nobody knows everything, read the mongoose documentation
  await user.save({ validateBeforeSave: false }); // we are trying to save a document without specifying all the required fields.. this will deactivate all the validators that we specified in our schema
  // it is these small things that you need to know that will make all the difference

  // 3) Send it back as an email to user
  // Protocol http or https?
  // TODO: not good to hard code fix later
  // send the plain original reset token, not the encrypted one
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`; // user will be able to click this and place the request from there

  // Giving the user some instructions here
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email, // or req.body.email
      subject: 'Your password reset token (valid for 10 mins)',
      message
    });

    // if there is an error during sendEmail we have to send an error message to the client
    // we also have to set back the password reset token and the passowrd reset expired we defined
    // not enought to simply catch the error and send it down to ouw global error handling middleware

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
      // we cannot send the resetToken here via JSOn- then anyone could reset anyone's password. Email is a safe place that only the user has access to
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500 // Internal Server Error
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  // encrypt the original to compare with the one encrypted in DB
  // for the password it was the more complex bcrypt and we could not simply compare them, here it is astraighforward
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // this is all we know about the user right now, get the user based on it
  // check if the passwordResetExpires property is greater than right now
  // find the user for the token and check if the token has not yet expired all in one go
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() } // timestamp but mongoDB will handle it by making both same for accurate comparison
  });

  // 2) If the token has not expired, and there is a user, then set the new password
  // send error if no user or if the token has expired
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400)); // 400 Bad Request
  }

  // set the new password, we already have the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // delete the resetToken and the expired
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // save, modifies not update
  await user.save(); // don't want to turn off the validators, we need them password = passwordConfirm
  // this is the reason why we need to use save and not update, unlike findOneAndUpdate for tours
  // but for everything related to passwords and the user we always use save because we always want to run all the validators and above all the save middleware functions like where the passwords are encrypted

  // 3) Update changedPasswordAt property for the user
  // do it in userModel using middleware
  // want it to happen behind the scenes automatically, since we will update password without forgetting also later

  // 4) log the user in, send JWT
  createAndSendCookie(user, 200, res);
});

// only for authenticated or logged in users
// so we will already have the current user on our request object from the protect middleware
exports.updatePassword = catchAsync(async (req, res, next) => {
  // only for logged in users
  // but still we need the logged in user to pass in his current password
  // to confirm he is who he says he is as a security measure
  // for e.g. someone just found your laptop open- can change password without requiring to punch in current password
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if the POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect password!', 400)); // Bad Request
    // return next(new AppError('Your current password is wrong', 401)); // Unauthorized
  }

  // 3) If yes, update password middleware will take care of passwordChangedAt
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // No User.findByIdAndUpdate because we need the validators and pre save middlewares
  // in the model passwordConfirm validator return this.password === el- this is not defined for update so that is not going to work
  // Do NOT use UPDATE for anything related to passwords
  // The 2 pre save middlewares (encryption, passwordChangedAt) are also not going to work

  // 4) Log user in, send JWT back to user now logged in with new updated password
  createAndSendCookie(user, 200, res);
  // upon success you have to send a new JWT otherwise it is possible for old JWT to be used after password was changed
});
