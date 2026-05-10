import jwt from 'jsonwebtoken';

const unauthorized = (res, msg = 'Authentication required') =>
  res.status(401).json({ data: null, meta: {}, error: { code: 'UNAUTHORIZED', message: msg } });

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return unauthorized(res);
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user     = payload;
    req.tenantId = payload.tenantId;
    next();
  } catch {
    unauthorized(res, 'Invalid or expired token');
  }
};

export const requireTenant = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(403).json({ data: null, meta: {}, error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ data: null, meta: {}, error: { code: 'FORBIDDEN', message: 'Super admin access required' } });
  }
  next();
};
