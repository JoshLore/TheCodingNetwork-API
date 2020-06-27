const express = require('express');
const { signup, signin, signout } = require('../controllers/auth');
const { userById } = require("../controllers/user");
const { userSignupValidator } = require('../validator');

const router = express.Router();

// Post routes
router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);

// Get routes
router.get('/signout', signout);

// Param routes
router.param("userId", userById);

module.exports = router;