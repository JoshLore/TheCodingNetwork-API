const Post = require('../models/post');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

// Get post by id for authorization
exports.postById = (req, res, next, id) => {

    // Search for post in database
    Post.findById(id)
        .populate("postedBy", "_id name")
        .exec((err, post) => {

            // Error handling
            if (err || !post) {
                return res.status(400).json({
                    error: err
                });
            }

            // Found post
            req.post = post;
            next();
        });
};

// Get all posts
exports.getPosts = (req, res) => {
    const posts = Post.find()
        .populate("postedBy", "_id name")
        .select("_id title body created")
        .sort({ created: -1 })
        .then((posts) => {
            res.json(posts)
        })
        .catch(err => console.log(err));
};

// Create a post
exports.createPost = (req, res, next) => {

    // Handling file uploads (images) on posts
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        // Error handling
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded.'
            });
        }
        let post = new Post(fields);

        // Removing password and salt for user
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        post.postedBy = req.profile;

        // Initilize image for post
        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        // Create the post
        post.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            res.json(result);
        });
    });
};

// Get all posts by certain user
exports.postsByUser = (req, res) => {

    // Find all posts by user
    Post.find({ postedBy: req.profile._id })
        .populate("postedBy", "_id name")
        .sort({ created: -1 })
        .exec((err, posts) => {

            // Error handling
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            // Once found, respond with all posts
            res.json(posts);
        });
};

// Checks if post was made by currently logged in user
exports.isPoster = (req, res, next) => {
    let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;

    // If not authorized user, handle unauthorized error
    if (!sameUser) {
        return res.status(403).json({
            error: "User is not authorized."
        });
    }

    next();
};

// Updates post
exports.updatePost = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {

        // Error handling
        if (err) {
            return res.status(400).json({
                error: "Photo could not be uploaded"
            });
        }

        // Update post
        let post = req.post;
        post = _.extend(post, fields);
        post.updated = Date.now();

        // If a photo is being update, send to database
        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        // Save to database
        post.save((err, result) => {

            // Error handling
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }

            // Hide password and salt, respond to client
            res.json(post);
        })
    });
};

// Delete post
exports.deletePost = (req, res) => {
    let post = req.post;
    post.remove((err, post) => {

        // Error handling
        if (err) {
            return res.status(400).json({
                error: err
            });
        }

        // Post has been deleted
        res.json({
            message: "Post deleted successfully!"
        });
    });
};

// Sending photo to client
exports.photo = (req, res, next) => {
    res.set("Content-Type", req.post.photo.contentType);
    return res.send(req.post.photo.data);
};

exports.singlePost = (req, res) => {
    return res.json(req.post);
}