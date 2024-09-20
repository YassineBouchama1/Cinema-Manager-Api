const { validationResult } = require('express-validator');

const validator =

    // middleware catch errors if not valid
    (req, res, next) => {


        const result = validationResult(req);

        // Finds the validation errors in this request and wraps them in an object with handy functions
        //if there is  error in result  show error
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        //if there is no error in result go to next middleware
        next()
    }

module.exports = validator