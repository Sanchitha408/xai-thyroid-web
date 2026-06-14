module.exports = (err, req, res, next) => {
  console.error('FULL ERROR:', err.stack || err.message || err);
  
  const status = err.status || err.statusCode || 500;
  
  res.status(status).json({
    message: err.message || 'An unexpected error occurred.',
    stack: err.stack,
    name: err.name
  });
};
