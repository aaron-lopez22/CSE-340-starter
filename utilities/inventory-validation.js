const { body, validationResult } = require('express-validator');
const utilities = require("../utilities");

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
      body('classification_id').isInt({ gt: 0 }).withMessage('Classification is required'),
      body('inv_make').trim().isLength({ min: 1 }).withMessage('Make is required'),
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
          title: 'Add New Inventory Item',
          nav,
          classificationList,
          errors: errors.array(),
          locals: {
              classification_id: req.body.classification_id,
              inv_make: req.body.inv_make,
              inv_model: req.body.inv_model,
              inv_description: req.body.inv_description,
              inv_price: req.body.inv_price,
              inv_year: req.body.inv_year,
              inv_miles: req.body.inv_miles,
              inv_color: req.body.inv_color,
              inv_image: req.body.inv_image,
              inv_thumbnail: req.body.inv_thumbnail
          }
      });
  }
  next();
}

/* ***************************
 * Inventory Validation Rules
 * ************************** */
validate.newInventoryRules = () => {
    return [
      body('classification_id').isInt({ gt: 0 }).withMessage('Classification is required'),
      body('inv_make').trim().isLength({ min: 1 }).withMessage('Make is required'),
      body('inv_model').trim().isLength({ min: 1 }).withMessage('Model is required'),
      body('inv_year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Year is required and must be valid'),
      body('inv_price').isFloat({ gt: 0 }).withMessage('Price is required and must be a positive number'),
      body('inv_miles').isInt({ gt: 0 }).withMessage('Miles is required and must be a positive number'),
      body('inv_color').trim().isLength({ min: 1 }).withMessage('Color is required'),
      body('inv_description').trim().isLength({ min: 1 }).withMessage('Description is required'),
      body('inv_image').trim().isURL().withMessage('Image URL is required and must be valid'),
      body('inv_thumbnail').trim().isURL().withMessage('Thumbnail URL is required and must be valid')
    ];
  };
  
  /* ***************************
   * Check data and return errors for adding new inventory items
   * ************************** */
  
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      nav,
      classificationList,
      errors: errors.array(),
      locals: {
        classification_id: req.body.classification_id,
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_description: req.body.inv_description,
        inv_price: req.body.inv_price,
        inv_year: req.body.inv_year,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail
      }
    });
  } else {
    next();
  }
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    res.render('inventory/edit-inventory', {
      title: 'Edit ' + req.body.inv_make + ' ' + req.body.inv_model,
      nav,
      classificationList,
      errors: errors.array(),
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id
    });
  } else {
    next();
  }
}

module.exports = validate;