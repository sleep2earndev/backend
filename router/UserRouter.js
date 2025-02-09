const express = require('express');
const router = express.Router();  // Gunakan router, bukan app

const controller = require('../controller/UserController');

router.post('/oauth', controller.getToken);

module.exports = router;
