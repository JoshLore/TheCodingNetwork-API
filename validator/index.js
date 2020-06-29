exports.createPostValidator = (req, res, next) => {

    // Title Validator
    req.check('title', "A title is required.").notEmpty();
    req.check('title', "Title must be between 4 to 150 characters.").isLength({
        min: 4,
        max: 150
    });

    // Body Validator
    req.check('body', "A body is required.").notEmpty();
    req.check('body', "Body must be between 4 to 2000 characters.").isLength({
        min: 4,
        max: 2000
    });

    // Check for errors
    const errors = req.validationErrors();

    // If there is an error(s), show the first error
    if (errors) {
        console.log("HELLO WORLD")
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    // Proceed to next
    next();
}

exports.userSignupValidator = (req, res, next) => {

    // Name must be between 4-24 characters
    req.check("name", "Name is required.").notEmpty();
    req.check("name", "Name must be between 4 to 24 characters").isLength({
        min: 4,
        max: 20
    });

    // Email msut be between 3 to 64 characters
    req.check("email", "Email must be between 3 to 64 characters.")
        .matches(/.+\@.+\..+/)
        .withMessage("Email must contain @")
        .isLength({
            min: 4,
            max: 64
        });

    // Password must have at least 1 number and at least 6 characters
    req.check("password", "Password is required").notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage("Password must contain at least 6 characters.")
        .matches(/\d/)
        .withMessage("Password must contain a number.");

    // Check for errors
    const errors = req.validationErrors();
    // If there is an error(s), show the first error
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    // Proceed to next
    next();

}