// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
    });
};

// Error handler
const errorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            statusCode: 400,
            message: 'Invalid JSON payload received',
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        statusCode: statusCode,
        message: err.message || 'Internal Server Error',
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
