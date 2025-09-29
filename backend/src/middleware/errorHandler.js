const errorHandler = (err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.id || 'Anonymous'
  });

  // Default error response
  let error = {
    success: false,
    error: 'Internal Server Error'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.error = 'Validation Error';
    error.details = Object.values(err.errors).map(val => val.message);
    return res.status(400).json(error);
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.error = 'Duplicate entry. This item already exists.';
    return res.status(400).json(error);
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error.error = 'Invalid reference. Related item not found.';
    return res.status(400).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid authentication token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Authentication token expired';
    return res.status(401).json(error);
  }

  if (err.message && err.message.includes('not found')) {
    error.error = 'Resource not found';
    return res.status(404).json(error);
  }

  // Handle custom application errors
  if (err.statusCode) {
    error.error = err.message || 'Application Error';
    return res.status(err.statusCode).json(error);
  }

  // Default server error
  res.status(500).json(error);
};

module.exports = errorHandler;