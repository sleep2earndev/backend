const express = require('express');
const router = express.Router();
const midlleware= require('../middleware/AuthMiddleware.js')

const controller = require('../controller/UserController');

router.get('/auth/fitbit', controller.redirectURi);
router.get('/auth/fitbit/callback', controller.token);
router.get('/get-sleep',midlleware.middlewareProof, controller.getSleep)
// router.get('/generate-proof', midlleware.authMidlleware, controller.proof)
router.get('/profile',midlleware.middlewareProof,controller.getProfile)

module.exports = router;