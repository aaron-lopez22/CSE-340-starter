const { body, validationResult } = require('express-validator');

const validate = {}

validate.classificationRules = () => {
    return [
        body('classification_name')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Classification name is required.')
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage('Classification name cannot contain spaces or special characters.')
    ];
}

validate.checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        return res.render('inventory/add-classification', {
            title: 'Add Classification',
            nav,
            errors: errors.array()
        });
    }
    next();
}

validate.inventoryRules = () => {
    return [
        body('classification_id')
            .isInt()
            .withMessage('Classification is required.'),
        body('inv_make')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Make is required.'),
        body('inv_model')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Model is required.'),
        body('inv_description')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Description is required.'),
        body('inv_price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number.'),
        body('inv_year')
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Year must be a valid year.'),
        body('inv_image')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Image path is required.'),
        body('inv_thumbnail')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Thumbnail path is required.'),
        body('inv_miles')
            .isInt({ min: 0 })
            .withMessage('Miles must be a positive number.'),
        body('inv_color')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Color is required.')
    ]
}

validate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationList = await utilities.buildClassificationList(req.body.classification_id);
        return res.render('inventory/add-inventory', {
            title: 'Add Inventory',
            nav,
            classificationList,
            errors: errors.array(),
            ...req.body
        });
    }
    next();
}

module.exports = validate;