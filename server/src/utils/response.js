export const ok = (res, data, meta = {}) =>
  res.json({ data, meta, error: null });

export const created = (res, data) =>
  res.status(201).json({ data, meta: {}, error: null });

export const noContent = (res) =>
  res.status(204).send();

export const notFound = (res, msg = 'Not found') =>
  res.status(404).json({ data: null, meta: {}, error: { code: 'NOT_FOUND', message: msg } });

export const conflict = (res, msg = 'Conflict') =>
  res.status(409).json({ data: null, meta: {}, error: { code: 'CONFLICT', message: msg } });

export const badRequest = (res, msg, details = null) =>
  res.status(400).json({ data: null, meta: {}, error: { code: 'BAD_REQUEST', message: msg, details } });
