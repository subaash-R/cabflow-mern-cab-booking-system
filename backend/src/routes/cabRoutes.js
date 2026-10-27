const express = require('express');
const router = express.Router();
const { getCabTiers, getPresetLocations, getNearbyCabs } = require('../controllers/cabController');

router.get('/tiers', getCabTiers);
router.get('/locations', getPresetLocations);
router.get('/nearby', getNearbyCabs);

module.exports = router;
