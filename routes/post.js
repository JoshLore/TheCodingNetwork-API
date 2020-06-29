const express = require('express');
const {
    getPosts,
    createPost,
    postsByUser,
    postById,
    isPoster,
    updatePost,
    deletePost,
    photo,
    singlePost,
    like,
    unlike,
    comment,
    uncomment,
    updateComment
} = require('../controllers/post');
const { createPostValidator } = require('../validator');
const { requireSignin } = require('../controllers/auth');
const { userById } = require("../controllers/user");

const router = express.Router();

// Get posts
router.get('/posts', getPosts);

// Like routes
router.put('/post/like', requireSignin, like);
router.put('/post/unlike', requireSignin, unlike);

// Comment routes
router.put('/post/comment', requireSignin, comment);
router.put('/post/uncomment', requireSignin, uncomment);
router.put('/post/updatecomment', requireSignin, updateComment);

// Get routes
router.get('/posts/by/:userId', requireSignin, postsByUser);
router.get('/post/photo/:postId', photo);
router.get('/post/:postId', singlePost)

// Post routes
router.post('/post/new/:userId', requireSignin, createPost, createPostValidator);

// Put routes
router.put('/post/:postId', requireSignin, isPoster, updatePost);

// Delete routes
router.delete('/post/:postId', requireSignin, isPoster, deletePost);

// Param routes
router.param("userId", userById);
router.param("postId", postById); // Any route containing :userId will run the userById() method

module.exports = router;