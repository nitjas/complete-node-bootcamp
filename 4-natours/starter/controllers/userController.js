const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  // loop thru the object and for each element check if it is one of the allowed fields
  // if yes add it to a new object that we will return in the end

  // TODO: There are better ways to implement this
  const newObj = {};
  // Object.keys - one of the easy ways to loop thru an object in JS
  // it returns an array containing all the key names , we can loop thru them with forEach()
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]; // new object with the field name of the current field should be equal to whatever's in the object at the current element- current field name
  });
  return newObj;
};

// route handlers
// getting all users has nothing to do with authentication so here, not in authController
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // implement it as query middleware, not here
  // const users = await User.find({ active: true });
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length, // not part of JSend, just like to send to client # of results
    data: {
      users // ES6 key name = value name
    }
  });
});

// the currently authenticated user
// only update name & email
// in a typical web application updating password is done in a different route than updating data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if the user tried to update the password, POSTs password data on req.body
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // we could do it like before with save- getting the user, updating the properties & save the document
  // but there are some fields which are required which we are not updating- ends in error
  // user.name = 'Nitoo';
  // await user.save();
  // passwordConfirm: Please confirm your password
  // so save method is not really the correct option in this case
  // insetad use findByIdAndUpdate since we are not dealing with passwords, but only non-sensitive data like name or email we can now use it
  // we do not want to update everything in the body like if the user puts in role admin or resetToken or resetTokenExpires
  // we need to make sure that the object we pass here only contains name and email
  // we want to filter the body so that in the end it contains only the name and email and nothing else

  // 2) Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email'); // add more later like uploadImage

  // 3) Update user document
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true // we want mongoose to validate our document
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // only works for logged in users as it should
  // TODO: if the same guy/email comes back later you have to flip this back to true to activate the account
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // 204 No Content for Deleted
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

// this is for the admin to update user data
exports.updateUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.deleteUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
