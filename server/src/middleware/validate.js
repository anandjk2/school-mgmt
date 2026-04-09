export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = new Error('Validation failed');
      err.type = 'VALIDATION';
      err.details = result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      return next(err);
    }
    req.body = result.data;
    next();
  };
}
