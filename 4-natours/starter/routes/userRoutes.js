const express = require('express');

// route handlers
const getAllUsers = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const getUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const createUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const updateUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const deleteUser = (req, res) => {
  // 500 Internal Server Error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

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
