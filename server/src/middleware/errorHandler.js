export function errorHandler(err, req, res, next) {
  if (err.type === 'VALIDATION') {
    return res.status(400).json({
      data: null, meta: {},
      error: { code: 'VALIDATION_ERROR', message: err.message, details: err.details }
    });
  }

  console.error(err);
  res.status(500).json({
    data: null, meta: {},
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  });
}
