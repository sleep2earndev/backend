const express = require('express');
const router = express.Router();
const midlleware= require('../middleware/AuthMiddleware.js')

const controller = require('../controller/UserController');

router.get('/auth/fitbit', controller.redirectURi);
router.get('/auth/fitbit/callback', controller.token);
router.post('/v1/get-earn',midlleware.middlewareProofProfile, controller.getEarn)
router.post('/v2/get-earn',midlleware.middlewareProofProfile, controller.getEarn2)
router.get('/profile',midlleware.middlewareProofProfile,controller.getProfile)
router.get('/leaderboard', midlleware.middlewareProofProfile,controller.leaderboard)
router.post('/chat-coach', midlleware.middlewareProofProfile,controller.chatWithCoach)
router.delete('/logout', midlleware.middlewareProofProfile,controller.logout)

module.exports = router;