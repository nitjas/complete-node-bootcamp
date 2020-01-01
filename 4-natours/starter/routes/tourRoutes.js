const express = require('express');
const tourController = require('./../controllers/tourController');

// express variable being used so import express module
// also middleware that apply to a certain kind of URL
const router = express.Router(); // create a new router & save it into this variable
// convention to call this simply router, not tourRouter

// param middleware
// ignored if no id in the route
// middleware #5
router.param('id', tourController.checkID);
// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);
//   next(); // never forget, else the request/response cycle will get stuck in this middleware function
// });

// we create a sub-app for each of these resources
// middleware #6
router
  .route('/') // because the tourRouter middleware only runs on '/api/v1/tours' route anyway.. once we are in this router we are already at this ../tours so we want additionally just the root of that URL
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour); // chain multiple handlers for the same route, fairly common

router
  .route('/:id') // /api/v1/tours coming from parent route
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

// export the router and import it into our main application
module.exports = router;
