const jwt = require("jsonwebtoken")
require("dotenv").config();
const User = require("../models/user");
const expressJwt = require("express-jwt");

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
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password do not match."
            })
        }

        // To login user, generate a token with user id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

        // Persist token as 't' in cookie with expiry date
        res.cookie("t", token, {expire: new Date() + 9999});

        // Return response with user and token to front-end client
        const { _id, name, email } = user;
        return res.json({token, user: { _id, email, name }});
        
        
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