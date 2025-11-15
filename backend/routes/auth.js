const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth');

const router = express.Router();
router.post('/register', register).post('/login', login);
router.get('/me', getMe).get('/logout', logout);

module.exports = router;