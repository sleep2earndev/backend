const express = require('express');
const router = express.Router();

const controller = require('../controller/UserController');

router.get('/auth/fitbit', controller.redirectURi);
router.get('/auth/fitbit/callback', controller.auth);

module.exports = router;