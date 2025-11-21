const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/register', register).post('/login', login);
router.route('/me').get(protect, getMe);
router.route('/logout').get(protect, logout);

module.exports = router;