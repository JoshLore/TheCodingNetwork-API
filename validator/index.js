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
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({error: firstError});
    }

    // Proceed to next
    next();
}