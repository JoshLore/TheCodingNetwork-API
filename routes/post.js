const express = require('express');
const { getPosts, createPost, postsByUser, postById, isPoster, deletePost, updatePost } = require('../controllers/post');
const { createPostValidator } = require('../validator');
const { requireSignin } = require('../controllers/auth');
const { userById } = require("../controllers/user");

const router = express.Router();

// Get routes
router.get('/posts', getPosts);
router.get('/posts/by/:userId', requireSignin, postsByUser);


// Post routes
router.post('/post/new/:userId', requireSignin, createPost, createPostValidator);

// Put routes
router.put('/post/:postId', requireSignin, isPoster, updatePost);

// Delete routes
router.delete('/post/:postId', requireSignin, isPoster, deletePost);

// Param routes
router.param("userId", userById); // Any route containing :userId will run the userById() method
router.param("postId", postById) // Any route containing :postId will run the postById() method

module.exports = router;