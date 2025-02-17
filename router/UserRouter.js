const express = require('express');
const router = express.Router();
const midlleware= require('../middleware/AuthMiddleware.js')

const controller = require('../controller/UserController');

router.get('/auth/fitbit', controller.redirectURi);
router.get('/auth/fitbit/callback', controller.auth);
router.get('/get-sleep',midlleware.authMidlleware, controller.getSleep)
router.get('/generate-proof', midlleware.authMidlleware, controller.proof)

module.exports = router;