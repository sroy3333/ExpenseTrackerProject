const express = require('express');

const premiumFeatureControllers = require('../controllers/premiumFeature');

const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/showLeaderBoard', authenticatemiddleware.authenticate, premiumFeatureControllers.getUserLeaderBoard);

module.exports = router;