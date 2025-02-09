const express = require('express');
const router = express.Router(); 

const controller = require('../controller/UserController');

router.post('/oauth', controller.getToken);

module.exports = router;
