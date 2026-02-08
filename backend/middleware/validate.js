const { validationResult, body, param, query } = require('express-validator');

function validate(validations) {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  };
}

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('pricing_model').trim().notEmpty().withMessage('Pricing model is required'),
  body('base_price').isNumeric().withMessage('Base price must be a number'),
];

const goalValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('goal_type').isIn(['objective', 'key_result']).withMessage('Goal type must be objective or key_result'),
];

const financeInvoiceValidation = [
  body('invoice_number').trim().notEmpty().withMessage('Invoice number is required'),
  body('total').isNumeric().withMessage('Total must be a number'),
];

module.exports = { validate, body, param, query, productValidation, goalValidation, financeInvoiceValidation };
