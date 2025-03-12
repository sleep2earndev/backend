const express = require('express');
const router = express.Router();
const midlleware= require('../middleware/AuthMiddleware.js')

const controller = require('../controller/UserController');

router.get('/get-attributes', midlleware.middlewareProofProfile, controller.getAttributes);

module.exports = router;