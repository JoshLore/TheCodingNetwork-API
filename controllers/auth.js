const jwt = require("jsonwebtoken")
require("dotenv").config();
const User = require("../models/user");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { sendEmail } = require("../helpers");

// Sing up user
exports.signup = async (req, res) => {

    // Async await to find if user already exists
    const userExists = await User.findOne({ email: req.body.email });

    // If user exists, authentication error
    if (userExists) return res.status(403).json({
        error: "Email is taken!"
    })

    // Create a new user and wait for database to save
    const user = await new User(req.body);
    await user.save();
    res.status(200).json({ message: "Signup success! Please login." });
};

// Sign in user
exports.signin = (req, res) => {

    // Find the user based on email
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {

        // If error or no user, ask them to signup
        if (err || !user) {
            return res.status(401).json({
                error: "User with that email does not exist. Please signup."
            })
        }

        // If password for user is incorrect, error message, else login
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password do not match."
            })
        }

        // To login user, generate a token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        // Persist token as 't' in cookie with expiry date
        res.cookie("t", token, { expire: new Date() + 9999 });

        // Return response with user and token to front-end client
        const { _id, name, email } = user;
        return res.json({ token, user: { _id, email, name } });


    });

};

// Sign out user
exports.signout = (req, res) => {
    res.clearCookie("t");
    return res.json({ message: "Sign out success!" });
};

// Require Signned In User for pages needing Authorization
exports.requireSignin = expressJwt({

    // If the token is valid, express-jwt appends the verified user's id
    // in an auth key to the request object
    secret: process.env.JWT_SECRET,
    userProperty: "auth"
});

// Allows user to get a reset link sent to their email
exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: "No request body" });
    if (!req.body.email)
        return res.status(400).json({ message: "No Email in request body" });

    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);

    // Find the user based on email
    User.findOne({ email }, (err, user) => {

        // If err or user doesn't exist
        if (err || !user)
            return res.status("401").json({
                error: "User with that email does not exist!"
            });

        // Generate a token with user id and secret
        const token = jwt.sign(
            { _id: user._id, iss: "NODEAPI" },
            process.env.JWT_SECRET
        );

        // Email data to send to user
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
                }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
                }/reset-password/${token}</p>`
        };

        // Send to email
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};

// To allow user to reset password.
// First find the user in the database with user's resetPasswordLink.
// User model's resetPasswordLink's value must match the token.

// If the user's resetPasswordLink(token) matches the incoming
// req.body.resetPasswordLink(token), then we got the right user.

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {

        // If err or user doesn't exist
        if (err || !user)
            return res.status("401").json({
                error: "Invalid Link!"
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
        };

        // Update user
        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        // Save and handle result
        user.save((err, result) => {

            // Handling errors
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            // Success message
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};