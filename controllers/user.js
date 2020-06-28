const _ = require('lodash');
const User = require('../models/user');

// Get user by id for authorization
exports.userById = (req, res, next, id) => {

    // Look in database for user with matching id
    User.findById(id).exec((err, user) => {

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
exports.updateUser = (req, res, next) => {
    let user = req.profile;

    // Using lodash.extend to mutate the user
    user = _.extend(user, req.body);
    user.updated = Date.now();

    // Save to database
    user.save((err) => {

        // Error handling
        if (err) {
            return res.status(400).json({
                error: "You are not authorized to perform this action."
            });
        }

        // Returning profile (without password and salt)
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json({ user });
    });
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
}