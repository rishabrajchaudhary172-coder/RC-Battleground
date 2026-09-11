const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rc_battleground_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role privilege required' });
  }
  next();
}

function requireMasterAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin' || (!req.user.is_master_admin && req.user.id !== 1)) {
    return res.status(403).json({ error: 'Master Admin (Second Lieutenant) privilege required' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAdmin,
  requireMasterAdmin,
};
