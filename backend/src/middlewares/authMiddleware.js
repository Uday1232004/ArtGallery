const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request (assuming decoded payload has id and role)
      req.user = decoded;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as super admin' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'MANAGER')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Administrative privileges required' });
  }
};

const adminOrArtist = (req, res, next) => {
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'MANAGER' || req.user.role === 'ARTIST')) {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Administrative/Artist privileges required' });
  }
};

module.exports = { protect, superAdminOnly, adminOnly, adminOrArtist };
