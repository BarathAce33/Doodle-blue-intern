const multer = require('multer');
const { upload: s3Upload } = require('../config/s3Config');

// Upload Middleware with Custom Error Handling
const uploadBannerImages = (req, res, next) => {
  const multerFields = s3Upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 }
  ]);

  multerFields(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      let message;

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          message = `File too large. Max allowed size is 5MB. Field: "${err.field}"`;
          break;

        case 'LIMIT_UNEXPECTED_FILE':
          message = err.message.includes('must be an image')
            ? err.message
            : `Unexpected field name: "${err.field}". Allowed fields: "desktopImage" and "mobileImage"`;
          break;

        case 'LIMIT_FILE_COUNT':
          message = `Too many files for field: "${err.field}". Max is 1`;
          break;

        default:
          message = `File upload error: ${err.message}`;
      }

      return res.status(400).json({
        success: false, statusCode: 400,
        message: 'Bad Request - File upload failed',
        error: message
      });
    }

    return res.status(400).json({
      success: false, statusCode: 400,
      message: 'Bad Request - Invalid file',
      error: err.message
    });
  });
};

// Validate Text vs File Fields
const validateFieldTypes = (req, res, next) => {
  const fileFields = ['desktopImage', 'mobileImage'];

  if (req.body) {
    for (const field of fileFields) {
      if (req.body[field] !== undefined) {
        return res.status(400).json({
          success: false, statusCode: 400,
          message: 'Bad Request - Wrong field type',
          error: `"${field}" must be a file upload, not a text value. Received: "${req.body[field]}"`
        });
      }
    }
  }

  next();
};

module.exports = { uploadBannerImages, validateFieldTypes };