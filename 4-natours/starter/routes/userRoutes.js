const express = require('express');
// use destructuring just for fun! Specify exact same names and then use them directly without having to write userController.getAllUsers
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('./../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword
} = require('./../controllers/authController');

//routes
// also middleware that apply to a certain kind of URL
const router = express.Router();

// signup is a special endpoint, doesn't fit the REST architecture we talked about before
// in special cases we create other end points that do not 100% fit the REST philosophy
// name of the URL has to do with the action
// a route for signup where we can only post data
// login, reset passwords etc..
router.post('/signup', signup);
// send login credentials in the body so this is valid for a POST request
router.post('/login', login);

router.post('/forgotPassword', forgotPassword); // receives only email address
router.patch('/resetPassword/:token', resetPassword); // receives token and new password

// we create a sub-app for each of these resources
// name of the URL has nothing to do with the action that is performed - REST
// these end points are for system administrator managing users
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
