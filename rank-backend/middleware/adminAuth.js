const crypto = require('crypto');

module.exports = (req, res, next) => {
  const provided = req.headers['x-admin-password'] || '';
  const expected = process.env.ADMIN_PASSWORD || '';
  
  if (!provided || provided.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};