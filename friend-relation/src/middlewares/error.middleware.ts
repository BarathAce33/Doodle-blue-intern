// error handler
const errorHandler = (err: any, req: any, res: any, next: any) => {
  // json error
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ status: 400, message: 'Invalid JSON format' });
  }

  // generic
  let status = err.status || 500;
  let message = err.message || 'Server error';

  // mongo errors
  if (err.name === 'ValidationError') status = 400;
  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate field value entered';
  }

  res.status(status).json({
    status,
    message
  });
};

module.exports = errorHandler;

export {};
