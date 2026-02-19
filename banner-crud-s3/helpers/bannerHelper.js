// Pagination Helper 
const getPagination = (page, limit, total) => ({
  currentPage:  parseInt(page),
  totalPages:   Math.ceil(total / limit),
  totalItems:   total,
  itemsPerPage: parseInt(limit)
});

// Success Response Helper 
const successResponse = (res, statusCode, message, data = null, extra = {}) => {
  const response = { success: true, statusCode, message };
  if (data)              response.data       = data;
  if (extra.pagination)  response.pagination = extra.pagination;
  return res.status(statusCode).json(response);
};

// Error Response Helper 
const errorResponse = (res, statusCode, message, error = null) => {
  const response = { success: false, statusCode, message };
  if (error) response.error = error;
  return res.status(statusCode).json(response);
};

//  HTTP Status Messages 
const STATUS_MESSAGES = {
  200: 'OK - Request successful',
  201: 'Created - Resource created successfully',
  400: 'Bad Request - Invalid input data',
  404: 'Not Found - Resource does not exist',
  422: 'Unprocessable Entity - Validation failed',
  500: 'Internal Server Error - Something went wrong on the server'
};

module.exports = { getPagination, successResponse, errorResponse, STATUS_MESSAGES };
