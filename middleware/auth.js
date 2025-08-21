const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Specific role middleware
const authorizeFarmer = authorize('farmer');
const authorizeBuyer = authorize('buyer');
const authorizeExporter = authorize('exporter');
const authorizeAdmin = authorize('admin');

// Check if user is verified
const requireVerification = async (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Account verification required',
      message: 'Please verify your email address before accessing this resource'
    });
  }
  next();
};

// Check if exporter is approved
const requireExporterApproval = async (req, res, next) => {
  if (req.user.role === 'exporter' && !req.user.isExporterApproved) {
    return res.status(403).json({ 
      error: 'Exporter approval required',
      message: 'Your exporter account is pending approval from admin'
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Check if user owns the resource or is admin
const checkOwnership = (model, field = 'user') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      if (resource[field].toString() === req.user._id.toString()) {
        req.resource = resource;
        return next();
      }

      return res.status(403).json({ error: 'Access denied. Resource ownership required.' });
    } catch (error) {
      return res.status(500).json({ error: 'Error checking resource ownership' });
    }
  };
};

// Rate limiting for specific actions
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Export all middleware
module.exports = {
  protect,
  authorize,
  authorizeFarmer,
  authorizeBuyer,
  authorizeExporter,
  authorizeAdmin,
  requireVerification,
  requireExporterApproval,
  optionalAuth,
  checkOwnership,
  createRateLimiter
};
