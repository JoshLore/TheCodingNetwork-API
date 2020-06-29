const _ = require('lodash');
const User = require('../models/user');
const fs = require('fs');
const formidable = require('formidable');

// Get user by id for authorization
exports.userById = (req, res, next, id) => {

    // Look in database for user with matching id
    User.findById(id)

        // Return the following and followers
        .populate('following', '_id name')
        .populate('followers', '_id name')

        // Return user object to the client
        .exec((err, user) => {

            // Checks whether user exists.
            if (err || !user) {
                return res.status(400).json({
                    error: "User not found"
                })
            }

            // Adds profile object in req with user info
            req.profile = user;
            next();
        });
};


// Checks if the user has authorization
exports.hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id === req.auth._id;
    if (!authorized) {
        return res.status(403).json({
            error: "User is not authorized to perform this action."
        });
    }
};

// Get all users in database
exports.allUsers = (req, res) => {

    User.find((err, users) => {

        // Error handling
        if (err) {
            return res.status(400).json({
                error: err
            });
        }

        // Respond with array of users
        res.json(users);
    })
        // Only return name, email, and time of creation.
        .select("name email updated created");
};

// Get a single user
exports.getUser = (req, res) => {

    // Returning profile (without password and salt)
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

// Update a user
// exports.updateUser = (req, res, next) => {
//     let user = req.profile;

//     // Using lodash.extend to mutate the user
//     user = _.extend(user, req.body);
//     user.updated = Date.now();

//     // Save to database
//     user.save((err) => {

//         // Error handling
//         if (err) {
//             return res.status(400).json({
//                 error: "You are not authorized to perform this action."
//             });
//         }

//         // Returning profile (without password and salt)
//         user.hashed_password = undefined;
//         user.salt = undefined;
//         res.json({ user });
//     });
// };

// Updates user profile
exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {

        // Error handling
        if (err) {
            return res.status(400).json({
                error: "Photo could not be uploaded"
            });
        }

        // Update profile
        let user = req.profile;
        user = _.extend(user, fields);
        user.updated = Date.now();

        // If a photo is being update, send to database
        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        // Save to database
        user.save((err, result) => {

            // Error handling
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }

            // Hide password and salt, respond to client
            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);
        })
    });
};

// Process photos seperately for faster load times
exports.userPhoto = (req, res, next) => {

    if (req.profile.photo.data) {
        res.set(('Content-Type', req.profile.photo.contentType));
        return res.send(req.profile.photo.data);
    }
    next();
};

// Delete user
exports.deleteUser = (req, res, next) => {
    let user = req.profile;
    user.remove((err, user) => {

        // Error handling
        if (err) {
            return res.status(400).json({
                error: err
            });
        }

        res.json({ message: "User deleted successfully!" });
    });
};

// Add a new following user
exports.addFollowing = (req, res, next) => {

    // Find following user
    User.findByIdAndUpdate(

        // Get following user
        req.body.userId,

        // Update user's following list
        { $push: { following: req.body.followId } },
        (err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({ error: err });
            }

            next();
        });
};

// Add a follower to user
exports.addFollower = (req, res) => {

    // Find following user
    User.findByIdAndUpdate(

        // Get user's followId
        req.body.followId,
        // Update followers list
        { $push: { followers: req.body.userId } },
        // Return new updated data
        { new: true }
    )
        // Return following and followers
        .populate('following', '_id name')
        .populate('followers', '_id name')

        // Return user object to the client
        .exec((err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            // Return user with updated list
            result.hashed_password = undefined;
            result.salt = undefined;
            res.json(result);

        });
};

// Unfollow a user
exports.removeFollowing = (req, res, next) => {

    // Find following user
    User.findByIdAndUpdate(

        // Get following user
        req.body.userId,

        // Remove following user
        { $pull: { following: req.body.unfollowId } },
        (err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({ error: err });
            }

            next();
        }
    );
};


// Remove a follower from user
exports.removeFollower = (req, res) => {

    // Find following user
    User.findByIdAndUpdate(

        // Get user's followId
        req.body.unfollowId,
        // Remove follower from followers list
        { $pull: { followers: req.body.userId } },
        // Return new updated data
        { new: true }
    )
        // Return new following and followers list
        .populate("following", "_id name")
        .populate("followers", "_id name")
        .exec((err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }

            // Return user with updated list
            result.hashed_password = undefined;
            result.salt = undefined;
            res.json(result);
        });
};

// Find users that aren't being followed by logged in user
exports.findPeople = (req, res) => {

    // Gathers all currently following users + the user himself
    let following = req.profile.following;
    following.push(req.profile._id);

    // Get all users, not including already followed users
    User.find({ _id: { $nin: following } }, (err, users) => {

        // Handling errors
        if (err) {
            return res.status(400).json({
                error: err
            });
        }

        res.json(users);
        // Only returning name, the rest we can get from Id if needed
    }).select('name');
}