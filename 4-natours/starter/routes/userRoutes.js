const express = require('express');
// use destructuring just for fun! Specify exact same names and then use them directly without having to write userController.getAllUsers
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('./../controllers/userController');

//routes
// also middleware that apply to a certain kind of URL
const router = express.Router();

// we create a sub-app for each of these resources
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
