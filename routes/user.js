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
    removeFollowing,
    findPeople,
    hasAuthorization
} = require("../controllers/user");
const { requireSignin } = require('../controllers/auth');

const router = express.Router();

router.put('/user/follow', requireSignin, addFollowing, addFollower); // Add following or follower
router.put('/user/unfollow', requireSignin, removeFollowing, removeFollower); // Remove a follower or unfollow

// Get routes
router.get('/users', allUsers);
router.get('/user/:userId', requireSignin, getUser);
router.get('/user/photo/:userId', userPhoto); // Photo
router.get('/user/findpeople/:userId', requireSignin, findPeople);

// Put routes
router.put('/user/:userId', requireSignin, hasAuthorization, updateUser);


// Delete routes
router.delete('/user/:userId', requireSignin, hasAuthorization, deleteUser);

// Param routes
router.param("userId", userById); // Any route containing :userId will run the userById() method

module.exports = router;