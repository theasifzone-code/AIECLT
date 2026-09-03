
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getRoute, 
  getETA, 
  getNearbyCenters, 
  geocodeAddress 
} = require('../controllers/routeController');


router.use(protect);


router.post('/get-route', getRoute);
router.post('/get-eta', getETA);
router.post('/nearby-centers', getNearbyCenters);
router.post('/geocode', geocodeAddress);

module.exports = router;