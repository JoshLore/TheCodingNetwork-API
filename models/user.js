const mongoose = require("mongoose");
const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;
const Post = require("./post");

// Schema for Users
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    hashed_password: {
        type: String,
        trim: true,
        required: true
    },
    salt: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    photo: {
        data: Buffer,
        contentType: String
    },
    about: {
        type: String,
        trim: true
    },
    following: [{ type: ObjectId, ref: "User" }],
    followers: [{ type: ObjectId, ref: "User" }],
    resetPasswordLink: {
        data: String,
        default: ""
    },
    role: {
        type: String,
        default: "subscriber"
    }
});

// Virtual field for hashing a user's new password
userSchema.virtual('password')
    .set(function (password) {
        // Temporary variable for password to hash
        this._password = password;
        // Generate a timestamp
        this.salt = uuidv1();
        // Encrypt Password
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });


// Methods
userSchema.methods = {

    // Authenticate if password given matches password in database
    // Returns true if passwords match
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    // Encyption for passwords
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return "";
        }
    }

}

// Method for deleting posts from people who's accounts have been deleted
userSchema.pre("remove", function (next) {
    Post.remove({ postedBy: this._id }).exec();
    next();
});

module.exports = mongoose.model("User", userSchema);