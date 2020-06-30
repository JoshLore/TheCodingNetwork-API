const express = require('express');
const { signup, signin, signout, forgotPassword, resetPassword, socialLogin } = require('../controllers/auth');
const { userById } = require("../controllers/user");
const { userSignupValidator, passwordResetValidator } = require('../validator');

const router = express.Router();

// Post routes
router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.post('/social-login', socialLogin);

// Get routes
router.get('/signout', signout);

// Put routes
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

// Param routes
router.param("userId", userById);

module.exports = router;