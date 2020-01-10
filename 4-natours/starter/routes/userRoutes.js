const express = require('express');
// use destructuring just for fun! Specify exact same names and then use them directly without having to write userController.getAllUsers
const {
  getAllUsers,
  updateMe,
  deleteMe,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('./../controllers/userController');

const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword
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

router.patch('/updateMyPassword', protect, updatePassword); // patch because we are changing/manipulating the user document
// MyPassword because it is for the currently logged in user
// protect will also put the user object on our request object

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

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
