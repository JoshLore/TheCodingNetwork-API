const Post = require('../models/post');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

// Get post by id for authorization
exports.postById = (req, res, next, id) => {

    // Search for post in database
    Post.findById(id)
        .populate('postedBy', '_id name')
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name role')
        .select('_id title body created likes comments photo')
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

// PAGINATION! Get all posts
exports.getPosts = async (req, res) => {
    // Get current page from req.query or use default value of 1
    const currentPage = req.query.page || 1;
    // Return 6 posts per page
    const perPage = 6;
    let totalItems;

    const posts = await Post.find()
        // countDocuments() gives you total count of posts
        .countDocuments()
        // Shorten that to perPage
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .populate('comments', 'text created')
                .populate('comments.postedBy', '_id name')
                .populate('postedBy', '_id name')
                .select('_id title body likes created')
                .limit(perPage)
                .sort({ created: -1 });
        })
        .then(posts => {
            res.status(200).json(posts);
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
        .populate('postedBy', '_id name')
        .select('_id title body created likes')
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
    let adminUser = req.post && req.auth && req.auth.role === 'admin';

    let isPoster = sameUser || adminUser;

    // If not authorized user, handle unauthorized error
    if (!isPoster) {
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
                error: 'Photo could not be uploaded'
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
                });
            }

            // Hide password and salt, respond to client
            res.json(post);
        });
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
            message: 'Post deleted successfully!'
        });
    });
};

// Sending photo to client
exports.photo = (req, res, next) => {
    res.set('Content-Type', req.post.photo.contentType);
    return res.send(req.post.photo.data);
};

// Return single post from Id
exports.singlePost = (req, res) => {
    return res.json(req.post);
};

// Add one like to user
exports.like = (req, res) => {

    // Add like to server
    Post.findByIdAndUpdate(req.body.postId, { $push: { likes: req.body.userId } }, { new: true }).exec(
        (err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
                // Return new like list
            } else {
                res.json(result);
            }
        }
    );
};

// Remove one like from user
exports.unlike = (req, res) => {

    // Remove like from server
    Post.findByIdAndUpdate(req.body.postId, { $pull: { likes: req.body.userId } }, { new: true }).exec(
        (err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
                // Return new like list
            } else {
                res.json(result);
            }
        }
    );
};

// Add comment to post
exports.comment = (req, res) => {
    let comment = req.body.comment;
    comment.postedBy = req.body.userId;

    // Add new comment to server
    Post.findByIdAndUpdate(req.body.postId, { $push: { comments: comment } }, { new: true })
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .exec((err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        });
};

// Delete comment from post
exports.uncomment = (req, res) => {
    let comment = req.body.comment;

    // Remove comment from server
    Post.findByIdAndUpdate(req.body.postId, { $pull: { comments: { _id: comment._id } } }, { new: true })
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .exec((err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
            } else {
                res.json(result);
            }
        });
};

// Update comment
exports.updateComment = (req, res) => {
    let comment = req.body.comment;

    // Update comment from server
    Post.findByIdAndUpdate(req.body.postId, { $pull: { comments: { _id: comment._id } } }).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        } else {

            // Tricky: Basically just getting new comment back
            Post.findByIdAndUpdate(
                req.body.postId,
                { $push: { comments: comment, updated: new Date() } },
                { new: true }
            )
                .populate('comments.postedBy', '_id name')
                .populate('postedBy', '_id name')
                .exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: err
                        });
                    } else {
                        res.json(result);
                    }
                });
        }
    });
};