const express = require('express');
const { userById,
    allUsers,
    getUser,
    updateUser,
    deleteUser,
    userPhoto,
    addFollowing,
    addFollower,
    removeFollower,
    removeFollowing
} = require("../controllers/user");
const { requireSignin } = require('../controllers/auth');

const router = express.Router();

// Get routes
router.get('/users', allUsers);
router.get('/user/:userId', requireSignin, getUser);
router.get('/user/photo/:userId', userPhoto);

// Put routes
router.put('/user/:userId', requireSignin, updateUser);
router.put('/user/follow', requireSignin, addFollowing, addFollower); // Add following or follower
router.put('/user/follow', requireSignin, removeFollowing, removeFollower); // Remove a follower or unfollow

// Delete routes
router.delete('/user/:userId', requireSignin, deleteUser);

// Param routes
router.param("userId", userById); // Any route containing :userId will run the userById() method

module.exports = router;