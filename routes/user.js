const express = require('express');
const { userById, allUsers, getUser, updateUser, deleteUser } = require("../controllers/user");
const { requireSignin } = require('../controllers/auth');

const router = express.Router();

// Get routes
router.get('/users', allUsers);
router.get('/user/:userId', requireSignin, getUser);

// Put routes
router.put('/user/:userId', requireSignin, updateUser);

// Delete routes
router.delete('/user/:userId', requireSignin, deleteUser);

// Param routes
router.param("userId", userById); // Any route containing :userId will run the userById() method

module.exports = router;