
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorUtils');


const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    throw new AppError(
      `Validation failed: ${errorMessages.map((e) => e.message).join(', ')}`,
      400
    );
  }

  next();
};

module.exports = {
  validateRequest,
};