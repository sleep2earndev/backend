const express = require('express');
const router = express.Router();
const midlleware= require('../middleware/AuthMiddleware.js')

const controller = require('../controller/UserController');

router.get('/auth/fitbit', controller.redirectURi);
router.get('/auth/fitbit/callback', controller.token);
router.get('/get-earn',midlleware.middlewareProofProfile, controller.getEarn)
router.get('/profile',midlleware.middlewareProofProfile,controller.getProfile)

module.exports = router;